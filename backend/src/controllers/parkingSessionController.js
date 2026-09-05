const supabase = require("../config/supabase");
const transporter = require("../config/email");
const QRCode = require("qrcode");
const crypto = require("crypto");
const createAuraEmail = require("../templates/auraEmailTemplate");
const createVehicleReturnEmail = require("../templates/vehicleReturnEmailTemplate");
const ACTIVE_STATUSES = [
  "checked_in",
  "parked",
  "retrieval_requested",
  "retrieving",
  "ready_for_pickup"
];

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
        valet:employees (
          id,
          name,
          phone,
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

    let result = sessions || [];

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

    // ------------------------------------------------------------
    // GET VEHICLE + CUSTOMER DETAILS
    // ------------------------------------------------------------

    const { data: vehicle, error: vehicleError } = await supabase
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

    // ------------------------------------------------------------
    // PREVENT DUPLICATE ACTIVE CHECK-IN
    // ------------------------------------------------------------

    const { data: existingSession, error: existingSessionError } =
      await supabase
        .from("parking_sessions")
        .select(`
          id,
          ticket_code,
          status,
          parking_slot
        `)
        .eq("vehicle_id", vehicle_id)
        .in("status", ACTIVE_STATUSES)
        .maybeSingle();

    if (existingSessionError) {
      console.error(
        "Check existing parking session error:",
        existingSessionError
      );

      return res.status(500).json({
        success: false,
        message: existingSessionError.message
      });
    }

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: "Vehicle is already checked in.",
        session: existingSession
      });
    }

    // ------------------------------------------------------------
    // GENERATE UNIQUE TICKET CODE
    // ------------------------------------------------------------

    let ticketCode;
    let ticketExists = true;

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

    // ------------------------------------------------------------
    // GENERATE QR CODE
    // ------------------------------------------------------------

    const qrCode = await QRCode.toDataURL(ticketCode);

    // ------------------------------------------------------------
    // CREATE PARKING SESSION
    // ------------------------------------------------------------

    const { data: session, error: sessionError } = await supabase
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

    if (sessionError) {
      console.error("Create parking session error:", sessionError);

      return res.status(400).json({
        success: false,
        message: sessionError.message
      });
    }
    if (parking_type === "valet") {
  const { data: existingKey, error: keyCheckError } = await supabase
    .from("keys")
    .select("id")
    .eq("parking_session_id", session.id)
    .maybeSingle();

  if (keyCheckError) {
    console.error("Check parking session key error:", keyCheckError);

    return res.status(500).json({
      success: false,
      message: keyCheckError.message
    });
  }

  if (!existingKey) {
    const { error: keyError } = await supabase
      .from("keys")
      .insert([
        {
          key_number: `KEY-${ticketCode}`,
          parking_session_id: session.id,
          status: "stored",
          notes: "Vehicle key received during check-in."
        }
      ]);

    if (keyError) {
      console.error("Create parking session key error:", keyError);

      return res.status(400).json({
        success: false,
        message: keyError.message
      });
    }
  }
}

    // ------------------------------------------------------------
    // SEND CUSTOMER EMAIL
    // ------------------------------------------------------------

    let emailSent = false;
    let emailErrorMessage = null;

    const customer = vehicle.customer;

    if (customer?.email) {
      try {
        const qrBuffer = await QRCode.toBuffer(ticketCode);

        const html = createAuraEmail({
          customerName: customer.name || "Customer",
          vehicleNumber: vehicle.license_plate || "N/A",
          vehicleModel: vehicle.model || vehicle.make || "N/A",
          parkingType:
            parking_type === "valet"
              ? "Valet Parking"
              : "Self Parking",
          ticketCode,
          parkingSlot: session.parking_slot,
          checkedInAt: new Date(
            session.checked_in_at
          ).toLocaleString("en-IN"),
          qrCode: "cid:aura-parking-qr"
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customer.email,
          subject:
            "Aura Valet Parking - Vehicle Check-In Confirmation",
          text:
            `Your vehicle has been successfully checked in at Aura Valet Parking. ` +
            `Ticket Code: ${ticketCode}`,
          html,
          attachments: [
            {
              filename: "aura-parking-qr.png",
              content: qrBuffer,
              cid: "aura-parking-qr"
            }
          ]
        });

        emailSent = true;

        console.log(
          `Check-in email sent successfully to ${customer.email}`
        );

        // --------------------------------------------------------
        // SAVE EMAIL NOTIFICATION AS SENT
        // --------------------------------------------------------

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            parking_session_id: session.id,
            recipient_type: "customer",
            recipient_id: customer.id,
            message:
              "Vehicle check-in confirmation email sent successfully.",
            channel: "email",
            status: "sent",
            sent_at: new Date().toISOString()
          });

        if (notificationError) {
          console.error(
            "Save email notification error:",
            notificationError
          );
        }
      } catch (emailError) {
        emailErrorMessage = emailError.message;

        console.error(
          "Check-in email notification error:",
          emailError
        );

        // --------------------------------------------------------
        // SAVE FAILED EMAIL NOTIFICATION
        // --------------------------------------------------------

        const { error: notificationError } = await supabase
          .from("notifications")
          .insert({
            parking_session_id: session.id,
            recipient_type: "customer",
            recipient_id: customer.id,
            message:
              "Vehicle check-in confirmation email could not be sent.",
            channel: "email",
            status: "failed"
          });

        if (notificationError) {
          console.error(
            "Save failed email notification error:",
            notificationError
          );
        }
      }
    } else {
      emailErrorMessage = "Customer email address not available.";

      console.warn(
        "Check-in email skipped: customer email address not available."
      );
    }

    // ------------------------------------------------------------
    // RESPONSE
    // ------------------------------------------------------------

    return res.status(201).json({
      success: true,
      message: emailSent
        ? "Parking session created and confirmation email sent successfully."
        : "Parking session created successfully, but confirmation email could not be sent.",
      session,
      ticket: {
        ticket_code: ticketCode,
        qr_code: qrCode
      },
      email: {
        sent: emailSent,
        error: emailSent ? null : emailErrorMessage
      }
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
      .update({ status: "occupied" })
      .eq("id", slot.id);

    if (updateSlotError) {
      console.error("Update slot error:", updateSlotError);

      return res.status(400).json({
        success: false,
        message: updateSlotError.message
      });
    }
    const { data: vehicle, error: vehicleError } = await supabase
  .from("vehicles")
  .select("customer_id")
  .eq("id", session.vehicle_id)
  .single();

if (vehicleError || !vehicle) {
  console.error("Get vehicle customer error:", vehicleError);
} else {
  const { error: notificationError } = await supabase
    .from("notifications")
    .insert([
      {
        parking_session_id: session.id,
        recipient_type: "customer",
        recipient_id: vehicle.customer_id,
        message: `Your vehicle has been parked successfully in slot ${parking_slot}.`,
        channel: "in_app",
        status: "sent",
        sent_at: new Date().toISOString()
      }
    ]);

  if (notificationError) {
    console.error("Vehicle parked notification error:", notificationError);
  }
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
      .from("employees")
      .select("id, name, phone, role, email, is_active")
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

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("email", valet.email)
      .eq("role", "valet")
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "Valet user account not found."
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

    const { data: key, error: keyError } = await supabase
      .from("keys")
      .select("id, status")
      .eq("parking_session_id", id)
      .maybeSingle();

    if (keyError) {
      console.error("Find parking session key error:", keyError);
    }

    if (key) {
      const { error: keyUpdateError } = await supabase
        .from("keys")
        .update({
          assigned_to: user.id,
          status: "assigned",
          assigned_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", key.id);

      if (keyUpdateError) {
        console.error("Assign key to valet error:", keyUpdateError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Valet assigned successfully and key assigned to valet.",
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

    const { data: session, error: sessionError } =
      await supabase
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

    const { data: session, error: sessionError } =
      await supabase
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
        message:
          "Vehicle must have a retrieval request first."
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

    const { data: key, error: keyFetchError } = await supabase
      .from("keys")
      .select("id, status")
      .eq("parking_session_id", id)
      .maybeSingle();

    if (keyFetchError) {
      console.error("Find parking session key error:", keyFetchError);
    }

    if (key) {
      const { error: keyUpdateError } = await supabase
        .from("keys")
        .update({
          status: "in_use",
          updated_at: new Date().toISOString()
        })
        .eq("id", key.id);

      if (keyUpdateError) {
        console.error("Update key status error:", keyUpdateError);
      }
    }

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("customer_id")
      .eq("id", updatedSession.vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      console.error("Get vehicle customer error:", vehicleError);
    } else {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            parking_session_id: updatedSession.id,
            recipient_type: "customer",
            recipient_id: vehicle.customer_id,
            message: "Your vehicle retrieval has started.",
            channel: "in_app",
            status: "sent",
            sent_at: new Date().toISOString()
          }
        ]);

      if (notificationError) {
        console.error("Retrieval started notification error:", notificationError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle retrieval started and key is now in use.",
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

    const { data: session, error: sessionError } =
      await supabase
        .from("parking_sessions")
        .select("id, status, vehicle_id")
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

    const { data: vehicle, error: vehicleError } = await supabase
      .from("vehicles")
      .select("customer_id")
      .eq("id", session.vehicle_id)
      .single();

    if (vehicleError || !vehicle) {
      console.error("Get vehicle customer error:", vehicleError);
    } else {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            parking_session_id: updatedSession.id,
            recipient_type: "customer",
            recipient_id: vehicle.customer_id,
            message: "Your vehicle is ready for pickup.",
            channel: "in_app",
            status: "sent",
            sent_at: new Date().toISOString()
          }
        ]);

      if (notificationError) {
        console.error("Ready for pickup notification error:", notificationError);
      }
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

    const { data: session, error: sessionError } =
      await supabase
        .from("parking_sessions")
        .select(`
          id,
          status,
          parking_slot,
          ticket_code,
          completed_at,
          vehicle:vehicles (
            id,
            customer_id,
            license_plate,
            make,
            model,
            customer:customers (
              id,
              name,
              email
            )
          )
        `)
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
        message:
          "Vehicle must be ready for pickup before completing return."
      });
    }

    const completedAt = new Date().toISOString();

    const {
      data: updatedSession,
      error: updateSessionError
    } = await supabase
      .from("parking_sessions")
      .update({
        status: "returned_completed",
        completed_at: completedAt
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

    const { data: key, error: keyFetchError } = await supabase
      .from("keys")
      .select("id")
      .eq("parking_session_id", id)
      .maybeSingle();

    if (keyFetchError) {
      console.error("Fetch parking session key error:", keyFetchError);
    }

    if (key) {
      const { error: keyUpdateError } = await supabase
        .from("keys")
        .update({
          status: "returned",
          assigned_to: null,
          returned_at: completedAt,
          updated_at: completedAt
        })
        .eq("id", key.id);

      if (keyUpdateError) {
        console.error("Update returned key error:", keyUpdateError);
      }
    }

    const customer = session.vehicle?.customer;

    if (customer?.id) {
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert([
          {
            parking_session_id: updatedSession.id,
            recipient_type: "customer",
            recipient_id: customer.id,
            message: "Your vehicle has been returned successfully.",
            channel: "in_app",
            status: "sent",
            sent_at: completedAt
          }
        ]);

      if (notificationError) {
        console.error("Vehicle returned notification error:", notificationError);
      }
    }

    if (customer?.email) {
      try {
        const emailHtml = createVehicleReturnEmail({
          customerName: customer.name,
          vehicleNumber: session.vehicle.license_plate,
          vehicleModel: `${session.vehicle.make} ${session.vehicle.model}`,
          ticketCode: session.ticket_code,
          parkingSlot: session.parking_slot,
          completedAt
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: customer.email,
          subject: "Vehicle Returned Successfully - Aura Valet Parking",
          html: emailHtml
        });
      } catch (emailError) {
        console.error("Vehicle returned email error:", emailError);
      }
    }

    return res.status(200).json({
      success: true,
      message:
        "Vehicle returned successfully, parking slot is now available, key status is updated, and customer notifications were sent.",
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
        valet:employees (
          id,
          name,
          phone,
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
        valet:employees (
          id,
          name,
          phone
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

    const awaitingRetrieval = (activeSessions || []).filter(
      (session) =>
        session.status === "retrieval_requested"
    ).length;

    const readyForPickup = (activeSessions || []).filter(
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
        message: "This ticket has already been completed."
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

    const { data: session, error: sessionError } =
      await supabase
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
    console.error("Complete self-parking error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};
const getValetDashboard = async (req, res) => {
  try {
    const { data: valet, error: valetError } = await supabase
      .from("employees")
      .select("id, name, phone, email, role, is_active")
      .eq("email", req.user.email)
      .eq("role", "valet")
      .single();

    if (valetError || !valet) {
      return res.status(404).json({
        success: false,
        message: "Valet employee record not found."
      });
    }

    const { data: sessions, error: sessionError } = await supabase
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
          phone,
          email,
          role
        )
      `)
      .eq("valet_id", valet.id)
      .order("checked_in_at", { ascending: false });

    if (sessionError) {
      console.error("Get valet dashboard sessions error:", sessionError);

      return res.status(400).json({
        success: false,
        message: sessionError.message
      });
    }

    const result = sessions || [];

    const activeSessions = result.filter((session) =>
      ACTIVE_STATUSES.includes(session.status)
    );

    const assignedVehicles = activeSessions.filter(
      (session) =>
        session.status === "checked_in" ||
        session.status === "parked"
    ).length;

    const parkedVehicles = activeSessions.filter(
      (session) => session.status === "parked"
    ).length;

    const retrievalRequests = activeSessions.filter(
      (session) => session.status === "retrieval_requested"
    ).length;

    const retrievingVehicles = activeSessions.filter(
      (session) => session.status === "retrieving"
    ).length;

    const readyForPickup = activeSessions.filter(
      (session) => session.status === "ready_for_pickup"
    ).length;

    const completedReturns = result.filter(
      (session) => session.status === "returned_completed"
    ).length;

    return res.status(200).json({
      success: true,
      valet: {
        id: valet.id,
        name: valet.name,
        phone: valet.phone,
        email: valet.email,
        role: valet.role,
        is_active: valet.is_active
      },
      dashboard: {
        assigned_vehicles: assignedVehicles,
        parked_vehicles: parkedVehicles,
        retrieval_requests: retrievalRequests,
        retrieving_vehicles: retrievingVehicles,
        ready_for_pickup: readyForPickup,
        completed_returns: completedReturns
      },
      sessions: activeSessions
    });
  } catch (error) {
    console.error("Get valet dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

module.exports = {
  getParkingSessions,
  getActiveParkingSessions,
  getValetDashboard,
  getReceptionDashboard,
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