const supabase = require("../config/supabase");
const transporter = require("../config/email");
const QRCode = require("qrcode");
const createAuraEmail = require("../templates/auraEmailTemplate");

const getRecipientEmail = async (recipient_type, recipient_id) => {
  if (recipient_type === "customer") {
    const { data, error } = await supabase
      .from("customers")
      .select("email")
      .eq("id", recipient_id)
      .single();

    if (error || !data) {
      throw new Error("Customer not found.");
    }

    return data.email;
  }

  const { data, error } = await supabase
    .from("users")
    .select("email")
    .eq("id", recipient_id)
    .single();

  if (error || !data) {
    throw new Error("Recipient not found.");
  }

  return data.email;
};

const createNotification = async (req, res) => {
  try {
    const {
      parking_session_id,
      recipient_type,
      recipient_id,
      message,
      channel
    } = req.body;

    if (
      !parking_session_id ||
      !recipient_type ||
      !recipient_id ||
      !message ||
      !channel
    ) {
      return res.status(400).json({
        success: false,
        message:
          "parking_session_id, recipient_type, recipient_id, message and channel are required."
      });
    }

    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .select(`
        id,
        vehicle_id,
        parking_type,
        status,
        ticket_code,
        parking_slot,
        checked_in_at,
        vehicle:vehicles(
          license_plate,
          model,
          customer_id,
          customer:customers(
            name
          )
        )
      `)
      .eq("id", parking_session_id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    const { data: notification, error: notificationError } = await supabase
      .from("notifications")
      .insert({
        parking_session_id,
        recipient_type,
        recipient_id,
        message,
        channel,
        status: "pending"
      })
      .select()
      .single();

    if (notificationError) {
      return res.status(400).json({
        success: false,
        message: notificationError.message
      });
    }

    if (channel === "email") {
      try {
        const recipientEmail = await getRecipientEmail(
          recipient_type,
          recipient_id
        );

        const qrBuffer = await QRCode.toBuffer(session.ticket_code);

        const customerName =
          session.vehicle?.customer?.name || "Customer";

        const html = createAuraEmail({
          customerName,
          vehicleNumber: session.vehicle?.license_plate || "N/A",
          vehicleModel: session.vehicle?.model || "N/A",
          parkingType:
            session.parking_type === "valet"
              ? "Valet Parking"
              : "Self Parking",
          ticketCode: session.ticket_code,
          parkingSlot: session.parking_slot,
          checkedInAt: new Date(session.checked_in_at).toLocaleString("en-IN"),
          qrCode: "cid:aura-parking-qr"
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: recipientEmail,
          subject: "Aura Valet Parking - Vehicle Check-In Confirmation",
          text: message,
          html,
          attachments: [
            {
              filename: "aura-parking-qr.png",
              content: qrBuffer,
              cid: "aura-parking-qr"
            }
          ]
        });

        const { data: updatedNotification, error: updateError } =
          await supabase
            .from("notifications")
            .update({
              status: "sent",
              sent_at: new Date().toISOString()
            })
            .eq("id", notification.id)
            .select()
            .single();

        if (updateError) {
          return res.status(500).json({
            success: false,
            message: "Email sent but notification status could not be updated."
          });
        }

        return res.status(201).json({
          success: true,
          message: "Notification created and email sent successfully.",
          notification: updatedNotification
        });
      } catch (emailError) {
        console.error("Email notification error:", emailError);

        return res.status(500).json({
          success: false,
          message: "Notification created but email could not be sent.",
          notification
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Notification created successfully.",
      notification
    });
  } catch (error) {
    console.error("Create notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const { recipient_id, recipient_type, status } = req.query;

    let query = supabase
      .from("notifications")
      .select(`
        *,
        parking_session:parking_sessions(
          id,
          vehicle_id,
          parking_type,
          status,
          ticket_code,
          parking_slot
        )
      `)
      .order("created_at", { ascending: false });

    if (recipient_id) {
      query = query.eq("recipient_id", recipient_id);
    }

    if (recipient_type) {
      query = query.eq("recipient_type", recipient_type);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: notifications, error } = await query;

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      count: notifications?.length || 0,
      notifications: notifications || []
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

const updateNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required."
      });
    }

    const { data: notification, error } = await supabase
      .from("notifications")
      .update({
        status,
        sent_at: status === "sent" ? new Date().toISOString() : null
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Notification status updated successfully.",
      notification
    });
  } catch (error) {
    console.error("Update notification status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

const getMyNotifications = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const userRole = req.user.role;

    if (!userEmail || !userRole) {
      return res.status(400).json({
        success: false,
        message: "User information not available."
      });
    }

    let recipientId;
    let recipientType;

    if (userRole === "customer") {
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .select("id")
        .eq("email", userEmail)
        .single();

      if (customerError || !customer) {
        return res.status(404).json({
          success: false,
          message: "Customer account not found."
        });
      }

      recipientId = customer.id;
      recipientType = "customer";
    } else {
      recipientId = req.user.id;
      recipientType = userRole;
    }

    const { data: notifications, error } = await supabase
      .from("notifications")
      .select(`
        id,
        parking_session_id,
        recipient_type,
        recipient_id,
        message,
        channel,
        status,
        sent_at,
        created_at
      `)
      .eq("recipient_id", recipientId)
      .eq("recipient_type", recipientType)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get my notifications error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      count: notifications?.length || 0,
      notifications: notifications || []
    });
  } catch (error) {
    console.error("Get my notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications."
    });
  }
};

module.exports = {
  createNotification,
  getNotifications,
  updateNotificationStatus,
  getMyNotifications
};