const supabase = require("../config/supabase");

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

    let result = sessions;

    if (search) {
      const searchTerm = search.toLowerCase();

      result = sessions.filter((session) => {
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
const createParkingSession = async (req, res) => {
  try {
    const {
      vehicle_id,
      parking_type,
      ticket_code
    } = req.body;

    if (!vehicle_id || !parking_type || !ticket_code) {
      return res.status(400).json({
        success: false,
        message: "Vehicle ID, parking type and ticket code are required."
      });
    }

    if (!["valet", "self"].includes(parking_type)) {
      return res.status(400).json({
        success: false,
        message: "Parking type must be valet or self."
      });
    }

    // Check whether vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id")
      .eq("id", vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found."
      });
    }

    // Create parking session
    const { data: session, error } = await supabase
      .from("parking_sessions")
      .insert([
        {
          vehicle_id,
          parking_type,
          ticket_code,
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

    return res.status(201).json({
      success: true,
      message: "Parking session created successfully.",
      session
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

    // Check if slot exists and is available
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

    // Assign slot to session
    const { data: session, error: sessionError } = await supabase
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

    // Mark slot as occupied
    const { error: updateSlotError } = await supabase
      .from("parking_slots")
      .update({ status: "occupied" })
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

    // Check valet exists and is active in users table
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

    // Assign valet to parking session
    const { data: session, error: sessionError } = await supabase
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

    const { data: session, error: sessionError } = await supabase
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
        message: "Only parked vehicles can be requested for retrieval."
      });
    }

    const { data: updatedSession, error } = await supabase
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

    const { data: session, error: sessionError } = await supabase
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

    if (session.status !== "retrieval_requested") {
      return res.status(400).json({
        success: false,
        message: "Vehicle must have a retrieval request first."
      });
    }

    const { data: updatedSession, error } = await supabase
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

    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .select("id, status")
      .eq("id", id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    if (session.status !== "retrieving") {
      return res.status(400).json({
        success: false,
        message: "Vehicle must be in retrieving state."
      });
    }

    const { data: updatedSession, error } = await supabase
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

    const { data: session, error: sessionError } = await supabase
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

    if (session.status !== "ready_for_pickup") {
      return res.status(400).json({
        success: false,
        message: "Vehicle must be ready for pickup before completing return."
      });
    }

    // Complete parking session
    const { data: updatedSession, error: updateSessionError } =
      await supabase
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

    // Free the parking slot
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
      message: "Vehicle returned successfully and parking slot is now available.",
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

    let result = requests;

    if (search) {
      const searchTerm = search.toLowerCase();

      result = requests.filter((request) => {
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

    let result = history.map((session) => {
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
        vehicle_number: session.vehicle?.license_plate || null,
        customer_name: session.vehicle?.customer?.name || null,
        customer_phone: session.vehicle?.customer?.phone || null,
        valet_name: session.valet?.name || null,
        parking_duration: duration
      };
    });

    if (search) {
      const searchTerm = search.toLowerCase();

      result = result.filter((session) =>
        session.vehicle_number?.toLowerCase().includes(searchTerm) ||
        session.customer_name?.toLowerCase().includes(searchTerm) ||
        session.customer_phone?.toLowerCase().includes(searchTerm) ||
        session.parking_slot?.toLowerCase().includes(searchTerm) ||
        session.ticket_code?.toLowerCase().includes(searchTerm)
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

module.exports = {
  getParkingSessions,
  getRetrievalRequests,
  createParkingSession,
  assignParkingSlot,
  assignValet,
  requestRetrieval,
  startRetrieval,
  markReadyForPickup,
  completeReturn,
  getParkingHistory,
};