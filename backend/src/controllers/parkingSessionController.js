const supabase = require("../config/supabase");
const QRCode = require("qrcode");
const crypto = require("crypto");
const {
  createAndSendNotification
} = require("../services/notificationService");


const getParkingSessions = async (req, res) => {
  try {
    const { search, status, parking_type } = req.query;

    let query = supabase
      .from("parking_sessions")
      .select(`
        id,
        ticket_code,
        parking_type,
        status,
        parking_slot,
        checked_in_at,
        parked_at,
        completed_at,
        valet_id,
        vehicle:vehicles (
          id,
          license_plate,
          make,
          model,
          color,
          customer:customers (
            id,
            name,
            phone,
            email
          )
        )
      `)
      .order("checked_in_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (parking_type) {
      query = query.eq("parking_type", parking_type);
    }

    const { data: sessions, error } = await query;

    if (error) {
      console.error("Get parking sessions error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    /*
     * Fetch valet information separately.
     *
     * We cannot use:
     * valet:users(...)
     *
     * because parking_sessions -> users does not have
     * a Supabase relationship in the current database schema.
     */
    const valetIds = [
      ...new Set(
        (sessions || [])
          .map((session) => session.valet_id)
          .filter(Boolean)
      )
    ];

    let valets = [];

    if (valetIds.length > 0) {
      const { data: valetUsers, error: valetError } = await supabase
        .from("users")
        .select(`
          id,
          name,
          email,
          role
        `)
        .in("id", valetIds);

      if (valetError) {
        console.error("Get valet users error:", valetError);
      } else {
        valets = valetUsers || [];
      }
    }

    /*
     * Create a quick lookup map:
     * valet user ID -> valet user object
     */
    const valetMap = new Map(
      valets.map((valet) => [valet.id, valet])
    );

    /*
     * Add valet information back onto each session
     * so the frontend can continue using session.valet.
     */
    let result = (sessions || []).map((session) => ({
      ...session,
      valet: session.valet_id
        ? valetMap.get(session.valet_id) || null
        : null
    }));

    /*
     * Reception quick lookup
     */
    if (search) {
      const searchTerm = search.toLowerCase();

      result = result.filter((session) => {
        const vehicleNumber =
          session.vehicle?.license_plate?.toLowerCase() || "";

        const customerName =
          session.vehicle?.customer?.name?.toLowerCase() || "";

        const customerPhone =
          session.vehicle?.customer?.phone?.toLowerCase() || "";

        const slot =
          session.parking_slot?.toLowerCase() || "";

        const ticket =
          session.ticket_code?.toLowerCase() || "";

        const valet =
          session.valet?.name?.toLowerCase() || "";

        return (
          vehicleNumber.includes(searchTerm) ||
          customerName.includes(searchTerm) ||
          customerPhone.includes(searchTerm) ||
          slot.includes(searchTerm) ||
          ticket.includes(searchTerm) ||
          valet.includes(searchTerm)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      sessions: result
    });

  } catch (error) {
    console.error("Get parking sessions error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


/*
|--------------------------------------------------------------------------
| CREATE PARKING SESSION / CHECK-IN
|--------------------------------------------------------------------------
*/

const createParkingSession = async (req, res) => {
  try {
    const { vehicle_id, parking_type } = req.body;

    if (!vehicle_id || !parking_type) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID and parking type are required."
      });
    }

    if (!["valet", "self"].includes(parking_type)) {
      return res.status(400).json({
        success: false,
        message: "Parking type must be valet or self."
      });
    }

    /*
     * Fetch vehicle + customer information.
     *
     * We need customer_id and customer email/name
     * so the check-in confirmation can be sent.
     */
    const { data: vehicle, error: vehicleError } =
      await supabase
        .from("vehicles")
        .select(`
          id,
          license_plate,
          make,
          model,
          color,
          customer_id,
          customer:customers (
            id,
            name,
            email
          )
        `)
        .eq("id", vehicle_id)
        .single();

    if (vehicleError || !vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found."
      });
    }

    let ticketCode;
    let ticketExists = true;

    /*
     * Generate a unique ticket code.
     */
    while (ticketExists) {
      const randomCode = crypto
        .randomBytes(3)
        .toString("hex")
        .toUpperCase();

      ticketCode = `VP-${randomCode}`;

      const {
        data: existingTicket,
        error: ticketCheckError
      } = await supabase
        .from("parking_sessions")
        .select("id")
        .eq("ticket_code", ticketCode)
        .maybeSingle();

      if (ticketCheckError) {
        return res.status(500).json({
          success: false,
          message: ticketCheckError.message
        });
      }

      ticketExists = !!existingTicket;
    }

    /*
     * Generate QR code for the ticket.
     */
    const qrCode = await QRCode.toDataURL(ticketCode);

    /*
     * Create parking session.
     */
    const { data: session, error } = await supabase
      .from("parking_sessions")
      .insert([
        {
          vehicle_id,
          parking_type,
          ticket_code: ticketCode,
          status: "checked_in"
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Create parking session error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    /*
     * Send customer check-in notification.
     *
     * IMPORTANT:
     * Email failure does NOT fail the check-in.
     */
    let emailSent = false;
    let emailError = null;

    if (vehicle.customer_id) {
      try {
        const notificationResult =
          await createAndSendNotification({
            parking_session_id: session.id,
            recipient_type: "customer",
            recipient_id: vehicle.customer_id,
            message:
              "Your vehicle has been successfully checked in at Aura Valet Parking.",
            channel: "email"
          });

        emailSent = notificationResult.emailSent;

        if (!emailSent) {
          emailError =
            notificationResult.emailError ||
            "Email could not be sent.";
        }

      } catch (notificationError) {
        /*
         * The parking session already exists, so don't
         * roll back the successful check-in just because
         * the notification failed.
         */
        console.error(
          "Create check-in notification error:",
          notificationError
        );

        emailError = notificationError.message;
      }
    } else {
      console.warn(
        "No customer_id found for vehicle:",
        vehicle_id
      );

      emailError =
        "No customer is associated with this vehicle.";
    }

    /*
     * Successful check-in response.
     *
     * email_sent is included so the frontend/API consumer
     * can know whether the confirmation email was sent.
     */
    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Parking session created successfully and confirmation email sent."
        : "Parking session created successfully, but confirmation email could not be sent.",
      session,
      ticket: {
        ticket_code: ticketCode,
        qr_code: qrCode
      },
      email_sent: emailSent,
      email_error: emailSent ? null : emailError
    });

  } catch (error) {
    console.error("Create parking session error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const assignParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { parking_slot } = req.body;

    if (!parking_slot) {
      return res.status(400).json({
        success: false,
        message: "Parking slot is required."
      });
    }

    const { data: slot, error: slotError } = await supabase
      .from("parking_slots")
      .select("id, slot_number, status")
      .eq("slot_number", parking_slot)
      .single();

    if (slotError || !slot) {
      return res.status(404).json({
        success: false,
        message: "Parking slot not found."
      });
    }

    if (slot.status !== "available") {
      return res.status(400).json({
        success: false,
        message: "Parking slot is not available."
      });
    }

    /*
     * Fetch the session first so we can validate valet ownership.
     */
    const {
      data: existingSession,
      error: existingSessionError
    } = await supabase
      .from("parking_sessions")
      .select("id, valet_id, status")
      .eq("id", id)
      .single();

    if (existingSessionError || !existingSession) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    /*
     * A valet can only park vehicles assigned to them.
     */
    if (
      req.user?.role === "valet" &&
      existingSession.valet_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "This vehicle is not assigned to you."
      });
    }

    if (existingSession.status !== "checked_in") {
      return res.status(400).json({
        success: false,
        message: "Only checked-in vehicles can be parked."
      });
    }

    const { data: session, error: sessionError } =
      await supabase
        .from("parking_sessions")
        .update({
          parking_slot,
          status: "parked",
          parked_at: new Date().toISOString()
        })
        .eq("id", id)
        .select()
        .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    const { error: updateSlotError } = await supabase
      .from("parking_slots")
      .update({
        status: "occupied"
      })
      .eq("id", slot.id);

    if (updateSlotError) {
      console.error("Update slot error:", updateSlotError);

      return res.status(400).json({
        success: false,
        message: updateSlotError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Parking slot assigned successfully.",
      session
    });

  } catch (error) {
    console.error("Assign parking slot error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const assignValet = async (req, res) => {
  try {
    const { id } = req.params;
    const { valet_id } = req.body;

    if (!valet_id) {
      return res.status(400).json({
        success: false,
        message: "Valet ID is required."
      });
    }

    const { data: valet, error: valetError } = await supabase
      .from("users")
      .select("id, name, email, role, is_active")
      .eq("id", valet_id)
      .eq("role", "valet")
      .single();

    if (valetError || !valet) {
      return res.status(404).json({
        success: false,
        message: "Valet not found."
      });
    }

    if (!valet.is_active) {
      return res.status(400).json({
        success: false,
        message: "Valet is inactive."
      });
    }

    const { data: session, error: sessionError } =
      await supabase
        .from("parking_sessions")
        .update({
          valet_id
        })
        .eq("id", id)
        .select()
        .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Valet assigned successfully.",
      session
    });

  } catch (error) {
    console.error("Assign valet error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const requestRetrieval = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      data: session,
      error: sessionError
    } = await supabase
      .from("parking_sessions")
      .select("id, status, parking_slot")
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    if (session.status !== "parked") {
      return res.status(400).json({
        success: false,
        message:
          "Only parked vehicles can be requested for retrieval."
      });
    }

    const { data: updatedSession, error } =
      await supabase
        .from("parking_sessions")
        .update({
          status: "retrieval_requested"
        })
        .eq("id", id)
        .select()
        .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle retrieval requested successfully.",
      session: updatedSession
    });

  } catch (error) {
    console.error("Request retrieval error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const startRetrieval = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      data: session,
      error: sessionError
    } = await supabase
      .from("parking_sessions")
      .select("id, status, parking_slot, valet_id")
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    /*
     * A valet can only retrieve their own assigned vehicle.
     */
    if (
      req.user?.role === "valet" &&
      session.valet_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "This vehicle is not assigned to you."
      });
    }

    if (session.status !== "retrieval_requested") {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle must have a retrieval request first."
      });
    }

    const {
      data: updatedSession,
      error
    } = await supabase
      .from("parking_sessions")
      .update({
        status: "retrieving"
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle retrieval started.",
      session: updatedSession
    });

  } catch (error) {
    console.error("Start retrieval error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const markReadyForPickup = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      data: session,
      error: sessionError
    } = await supabase
      .from("parking_sessions")
      .select("id, status, valet_id")
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    /*
     * A valet can only update their own assigned vehicle.
     */
    if (
      req.user?.role === "valet" &&
      session.valet_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "This vehicle is not assigned to you."
      });
    }

    if (session.status !== "retrieving") {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle must be in retrieving state."
      });
    }

    const {
      data: updatedSession,
      error
    } = await supabase
      .from("parking_sessions")
      .update({
        status: "ready_for_pickup"
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle is ready for pickup.",
      session: updatedSession
    });

  } catch (error) {
    console.error("Ready for pickup error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const completeReturn = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      data: session,
      error: sessionError
    } = await supabase
      .from("parking_sessions")
      .select("id, status, parking_slot, valet_id")
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    /*
     * A valet can only complete the return of their assigned vehicle.
     */
    if (
      req.user?.role === "valet" &&
      session.valet_id !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "This vehicle is not assigned to you."
      });
    }

    if (session.status !== "ready_for_pickup") {
      return res.status(400).json({
        success: false,
        message:
          "Vehicle must be ready for pickup before completing return."
      });
    }

    const {
      data: updatedSession,
      error: updateSessionError
    } = await supabase
      .from("parking_sessions")
      .update({
        status: "returned_completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (updateSessionError) {
      return res.status(400).json({
        success: false,
        message: updateSessionError.message
      });
    }

    if (session.parking_slot) {
      const { error: slotError } = await supabase
        .from("parking_slots")
        .update({
          status: "available"
        })
        .eq("slot_number", session.parking_slot);

      if (slotError) {
        console.error("Free parking slot error:", slotError);

        return res.status(400).json({
          success: false,
          message: slotError.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Vehicle returned successfully and parking slot is now available.",
      session: updatedSession
    });

  } catch (error) {
    console.error("Complete return error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const getRetrievalRequests = async (req, res) => {
  try {
    const { search, status } = req.query;

    const allowedStatuses = [
      "retrieval_requested",
      "retrieving",
      "ready_for_pickup"
    ];

    let query = supabase
      .from("parking_sessions")
      .select(`
        id,
        ticket_code,
        parking_type,
        status,
        parking_slot,
        checked_in_at,
        parked_at,
        vehicle:vehicles (
          id,
          license_plate,
          make,
          model,
          color,
          customer:customers (
            id,
            name,
            phone,
            email
          )
        ),
        valet:users (
          id,
          name,
          email,
          role
        )
      `)
      .in("status", allowedStatuses)
      .order("checked_in_at", { ascending: false });

    if (status && allowedStatuses.includes(status)) {
      query = query.eq("status", status);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error("Get retrieval requests error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    let result = requests || [];

    if (search) {
      const searchTerm = search.toLowerCase();

      result = result.filter((request) => {
        const vehicleNumber =
          request.vehicle?.license_plate?.toLowerCase() || "";

        const customerName =
          request.vehicle?.customer?.name?.toLowerCase() || "";

        const customerPhone =
          request.vehicle?.customer?.phone?.toLowerCase() || "";

        const slot =
          request.parking_slot?.toLowerCase() || "";

        const valet =
          request.valet?.name?.toLowerCase() || "";

        return (
          vehicleNumber.includes(searchTerm) ||
          customerName.includes(searchTerm) ||
          customerPhone.includes(searchTerm) ||
          slot.includes(searchTerm) ||
          valet.includes(searchTerm)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      requests: result
    });

  } catch (error) {
    console.error("Get retrieval requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch retrieval requests."
    });
  }
};


const getParkingHistory = async (req, res) => {
  try {
    const { search, parking_type } = req.query;

    let query = supabase
      .from("parking_sessions")
      .select(`
        id,
        ticket_code,
        parking_type,
        status,
        parking_slot,
        checked_in_at,
        completed_at,
        vehicle:vehicles (
          license_plate,
          make,
          model,
          customer:customers (
            name,
            phone
          )
        ),
        valet:users (
          id,
          name,
          email
        )
      `)
      .eq("status", "returned_completed")
      .order("completed_at", { ascending: false });

    if (parking_type) {
      query = query.eq("parking_type", parking_type);
    }

    const { data: history, error } = await query;

    if (error) {
      console.error("Get parking history error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    let result = (history || []).map((session) => {
      let duration = null;

      if (session.checked_in_at && session.completed_at) {
        const start = new Date(session.checked_in_at);
        const end = new Date(session.completed_at);

        const durationMinutes = Math.round(
          (end - start) / (1000 * 60)
        );

        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        duration =
          hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes}m`;
      }

      return {
        ...session,
        vehicle_number:
          session.vehicle?.license_plate || null,
        customer_name:
          session.vehicle?.customer?.name || null,
        customer_phone:
          session.vehicle?.customer?.phone || null,
        valet_name:
          session.valet?.name || null,
        parking_duration: duration
      };
    });

    if (search) {
      const searchTerm = search.toLowerCase();

      result = result.filter((session) =>
        session.vehicle_number
          ?.toLowerCase()
          .includes(searchTerm) ||
        session.customer_name
          ?.toLowerCase()
          .includes(searchTerm) ||
        session.customer_phone
          ?.toLowerCase()
          .includes(searchTerm) ||
        session.parking_slot
          ?.toLowerCase()
          .includes(searchTerm) ||
        session.ticket_code
          ?.toLowerCase()
          .includes(searchTerm)
      );
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      history: result
    });

  } catch (error) {
    console.error("Get parking history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch parking history."
    });
  }
};


const getActiveParkingSessions = async (req, res) => {
  try {
    const activeStatuses = [
      "checked_in",
      "parked",
      "retrieval_requested",
      "retrieving",
      "ready_for_pickup"
    ];

    const { data: sessions, error } = await supabase
      .from("parking_sessions")
      .select(`
        id,
        ticket_code,
        parking_type,
        status,
        parking_slot,
        checked_in_at,
        parked_at,
        vehicles (
          id,
          license_plate,
          make,
          model,
          color,
          customers (
            id,
            name,
            phone,
            email
          )
        ),
        employees (
          id,
          name,
          phone,
          role
        )
      `)
      .in("status", activeStatuses)
      .order("checked_in_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      sessions
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const getReceptionDashboard = async (req, res) => {
  try {
    const activeStatuses = [
      "checked_in",
      "parked",
      "retrieval_requested",
      "retrieving",
      "ready_for_pickup"
    ];

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const startOfDayISO = startOfDay.toISOString();

    const {
      data: activeSessions,
      error: activeError
    } = await supabase
      .from("parking_sessions")
      .select("id, status")
      .in("status", activeStatuses);

    if (activeError) {
      return res.status(500).json({
        success: false,
        message: activeError.message
      });
    }

    const {
      data: todayCheckIns,
      error: checkInError
    } = await supabase
      .from("parking_sessions")
      .select("id")
      .gte("checked_in_at", startOfDayISO);

    if (checkInError) {
      return res.status(500).json({
        success: false,
        message: checkInError.message
      });
    }

    const awaitingRetrieval =
      (activeSessions || []).filter(
        (session) =>
          session.status === "retrieval_requested"
      ).length;

    const readyForPickup =
      (activeSessions || []).filter(
        (session) =>
          session.status === "ready_for_pickup"
      ).length;

    return res.status(200).json({
      success: true,
      dashboard: {
        active_vehicles:
          activeSessions?.length || 0,
        today_check_ins:
          todayCheckIns?.length || 0,
        awaiting_retrieval: awaitingRetrieval,
        ready_for_pickup: readyForPickup
      }
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const verifyTicket = async (req, res) => {
  try {
    const { ticket_code } = req.params;

    if (!ticket_code) {
      return res.status(400).json({
        success: false,
        message: "Ticket code is required."
      });
    }

    const { data: session, error } = await supabase
      .from("parking_sessions")
      .select(`
        id,
        ticket_code,
        parking_type,
        status,
        parking_slot,
        checked_in_at,
        parked_at,
        completed_at,
        vehicle:vehicles (
          id,
          license_plate,
          make,
          model,
          color,
          customer:customers (
            id,
            name,
            phone,
            email
          )
        ),
        valet:employees (
          id,
          name,
          phone
        )
      `)
      .eq("ticket_code", ticket_code)
      .single();

    if (error || !session) {
      return res.status(404).json({
        success: false,
        message: "Invalid ticket code."
      });
    }

    if (session.status === "returned_completed") {
      return res.status(400).json({
        success: false,
        message:
          "This ticket has already been completed."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Ticket verified successfully.",
      ticket: {
        ticket_code: session.ticket_code,
        status: session.status,
        parking_type: session.parking_type
      },
      session
    });

  } catch (error) {
    console.error("Verify ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const completeSelfParking = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      data: session,
      error: sessionError
    } = await supabase
      .from("parking_sessions")
      .select(
        "id, status, parking_type, parking_slot"
      )
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    if (session.parking_type !== "self") {
      return res.status(400).json({
        success: false,
        message:
          "This session is not a self-parking session."
      });
    }

    if (session.status !== "parked") {
      return res.status(400).json({
        success: false,
        message:
          "Self-parking vehicle must be parked before checkout."
      });
    }

    const {
      data: updatedSession,
      error: updateSessionError
    } = await supabase
      .from("parking_sessions")
      .update({
        status: "returned_completed",
        completed_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (updateSessionError) {
      return res.status(400).json({
        success: false,
        message: updateSessionError.message
      });
    }

    if (session.parking_slot) {
      const { error: slotError } = await supabase
        .from("parking_slots")
        .update({
          status: "available"
        })
        .eq("slot_number", session.parking_slot);

      if (slotError) {
        console.error(
          "Free self-parking slot error:",
          slotError
        );

        return res.status(400).json({
          success: false,
          message: slotError.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Self-parking checkout completed successfully and parking slot is now available.",
      session: updatedSession
    });

  } catch (error) {
    console.error(
      "Complete self-parking error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


/*
|--------------------------------------------------------------------------
| VALET DASHBOARD
|--------------------------------------------------------------------------
*/

const getValetDashboard = async (req, res) => {
  try {
    const valetId = req.user.id;

    const {
      data: valet,
      error: valetError
    } = await supabase
      .from("users")
      .select(
        "id, name, email, phone, role, is_active"
      )
      .eq("id", valetId)
      .eq("role", "valet")
      .single();

    if (valetError || !valet) {
      return res.status(404).json({
        success: false,
        message: "Valet profile not found."
      });
    }

    const {
      data: sessions,
      error: sessionsError
    } = await supabase
      .from("parking_sessions")
      .select(`
        id,
        ticket_code,
        parking_type,
        status,
        parking_slot,
        checked_in_at,
        parked_at,
        completed_at,
        vehicle:vehicles (
          id,
          license_plate,
          make,
          model,
          color,
          customer:customers (
            id,
            name,
            phone,
            email
          )
        ),
        valet:users (
          id,
          name,
          email,
          phone,
          role
        )
      `)
      .eq("valet_id", valetId)
      .order("checked_in_at", {
        ascending: false
      });

    if (sessionsError) {
      console.error(
        "Get valet dashboard sessions error:",
        sessionsError
      );

      return res.status(400).json({
        success: false,
        message: sessionsError.message
      });
    }

    const allSessions = sessions || [];

    const activeStatuses = [
      "checked_in",
      "parked",
      "retrieval_requested",
      "retrieving",
      "ready_for_pickup"
    ];

    const activeSessions = allSessions.filter(
      (session) =>
        activeStatuses.includes(session.status)
    );

    const checkedIn = allSessions.filter(
      (session) => session.status === "checked_in"
    );

    const parked = allSessions.filter(
      (session) => session.status === "parked"
    );

    const retrievalRequests = allSessions.filter(
      (session) =>
        session.status === "retrieval_requested"
    );

    const retrieving = allSessions.filter(
      (session) => session.status === "retrieving"
    );

    const readyForPickup = allSessions.filter(
      (session) =>
        session.status === "ready_for_pickup"
    );

    const completedReturns = allSessions.filter(
      (session) =>
        session.status === "returned_completed"
    );

    return res.status(200).json({
      success: true,

      valet,

      dashboard: {
        assigned_vehicles: activeSessions.length,
        checked_in_vehicles: checkedIn.length,
        parked_vehicles: parked.length,
        retrieval_requests:
          retrievalRequests.length,
        retrieving_vehicles:
          retrieving.length,
        ready_for_pickup:
          readyForPickup.length,
        completed_returns:
          completedReturns.length
      },

      sessions: activeSessions,

      retrieval_requests: retrievalRequests,

      completed_returns: completedReturns
    });

  } catch (error) {
    console.error(
      "Get valet dashboard error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load valet dashboard."
    });
  }
};


module.exports = {
  getParkingSessions,
  getActiveParkingSessions,
  getReceptionDashboard,
  getValetDashboard,
  createParkingSession,
  verifyTicket,
  assignParkingSlot,
  assignValet,
  requestRetrieval,
  startRetrieval,
  markReadyForPickup,
  completeReturn,
  completeSelfParking,
  getRetrievalRequests,
  getParkingHistory
};

