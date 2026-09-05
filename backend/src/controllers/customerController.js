const supabase = require("../config/supabase");

// ============================================================
// CREATE CUSTOMER
// ============================================================

const createCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone number are required.",
      });
    }

    // Check for existing customer by phone
    const { data: existingCustomer, error: existingError } = await supabase
      .from("customers")
      .select("*")
      .eq("phone", phone.trim())
      .maybeSingle();

    if (existingError) {
      console.error("Check existing customer error:", existingError);
      return res.status(400).json({
        success: false,
        message: existingError.message,
      });
    }

    if (existingCustomer) {
      return res.status(200).json({
        success: true,
        message: "Existing customer found.",
        customer: existingCustomer,
      });
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .insert([
        {
          name: name.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Create customer error:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      customer,
    });
  } catch (error) {
    console.error("Create customer error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create customer.",
    });
  }
};

// ============================================================
// GET ALL CUSTOMERS (with search)
// ============================================================

const getCustomers = async (req, res) => {
  try {
    const { search } = req.query;

    let query = supabase
      .from("customers")
      .select(`
        id,
        name,
        phone,
        email,
        created_at,
        vehicles (
          id,
          license_plate,
          make,
          model,
          color
        )
      `)
      .order("name", { ascending: true });

    if (search) {
      const searchTerm = search.trim();
      query = query.or(
        `name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
      );
    }

    const { data: customers, error } = await query;

    if (error) {
      console.error("Get customers error:", error);
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      count: customers.length,
      customers: customers || [],
    });
  } catch (error) {
    console.error("Get customers error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers.",
    });
  }
};

// ============================================================
// GET CUSTOMER BY ID
// ============================================================

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: customer, error } = await supabase
      .from("customers")
      .select(`
        id,
        name,
        phone,
        email,
        created_at,
        vehicles (
          id,
          license_plate,
          make,
          model,
          color
        )
      `)
      .eq("id", id)
      .single();

    if (error || !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    return res.status(200).json({
      success: true,
      customer,
    });
  } catch (error) {
    console.error("Get customer by ID error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer.",
    });
  }
};
const getCustomerDashboard = async (req, res) => {
  try {
    const customerEmail = req.user.email;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer email not available."
      });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select(`
        id,
        name,
        phone,
        email,
        created_at,
        vehicles (
          id,
          license_plate,
          make,
          model,
          color,
          created_at
        )
      `)
      .eq("email", customerEmail)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found."
      });
    }

    const vehicleIds = (customer.vehicles || []).map(
      (vehicle) => vehicle.id
    );

    let activeSessions = [];

    if (vehicleIds.length > 0) {
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
            color
          ),
          valet:employees (
            id,
            name,
            phone
          )
        `)
        .in("vehicle_id", vehicleIds)
        .in("status", [
          "checked_in",
          "parked",
          "retrieval_requested",
          "retrieving",
          "ready_for_pickup"
        ])
        .order("checked_in_at", { ascending: false });

      if (sessionError) {
        console.error("Get customer active sessions error:", sessionError);

        return res.status(400).json({
          success: false,
          message: sessionError.message
        });
      }

      activeSessions = sessions || [];
    }

    let sessionsWithKeys = activeSessions;

    if (activeSessions.length > 0) {
      const sessionIds = activeSessions.map((session) => session.id);

      const { data: keys, error: keyError } = await supabase
        .from("keys")
        .select(`
          id,
          key_number,
          parking_session_id,
          key_location,
          status,
          assigned_at,
          returned_at
        `)
        .in("parking_session_id", sessionIds);

      if (keyError) {
        console.error("Get customer session keys error:", keyError);

        return res.status(400).json({
          success: false,
          message: keyError.message
        });
      }

      sessionsWithKeys = activeSessions.map((session) => ({
        ...session,
        key:
          (keys || []).find(
            (key) => key.parking_session_id === session.id
          ) || null
      }));
    }

    return res.status(200).json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      },
      vehicles: customer.vehicles || [],
      active_sessions: sessionsWithKeys,
      current_session: sessionsWithKeys[0] || null
    });
  } catch (error) {
    console.error("Get customer dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer dashboard."
    });
  }
};
const getCustomerParkingHistory = async (req, res) => {
  try {
    const customerEmail = req.user.email;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer email not available."
      });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customerEmail)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found."
      });
    }

    const { data: vehicles, error: vehicleError } = await supabase
      .from("vehicles")
      .select("id")
      .eq("customer_id", customer.id);

    if (vehicleError) {
      return res.status(400).json({
        success: false,
        message: vehicleError.message
      });
    }

    const vehicleIds = (vehicles || []).map((vehicle) => vehicle.id);

    if (vehicleIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        history: []
      });
    }

    const { data: history, error: historyError } = await supabase
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
          color
        ),
        valet:employees (
          id,
          name,
          phone
        )
      `)
      .in("vehicle_id", vehicleIds)
      .eq("status", "returned_completed")
      .order("completed_at", { ascending: false });

    if (historyError) {
      console.error("Get customer parking history error:", historyError);

      return res.status(400).json({
        success: false,
        message: historyError.message
      });
    }

    const result = (history || []).map((session) => {
      let parkingDuration = null;

      if (session.checked_in_at && session.completed_at) {
        const start = new Date(session.checked_in_at);
        const end = new Date(session.completed_at);

        const durationMinutes = Math.round(
          (end - start) / (1000 * 60)
        );

        const hours = Math.floor(durationMinutes / 60);
        const minutes = durationMinutes % 60;

        parkingDuration =
          hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes}m`;
      }

      return {
        ...session,
        parking_duration: parkingDuration
      };
    });

    return res.status(200).json({
      success: true,
      count: result.length,
      history: result
    });
  } catch (error) {
    console.error("Get customer parking history error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer parking history."
    });
  }
};

const requestCustomerRetrieval = async (req, res) => {
  try {
    const customerEmail = req.user.email;
    const { id } = req.params;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer email not available."
      });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customerEmail)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found."
      });
    }

    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .select(`
        id,
        ticket_code,
        parking_type,
        status,
        valet_id,
        vehicle:vehicles (
          id,
          customer_id,
          license_plate,
          make,
          model,
          color
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

    if (!session.vehicle || session.vehicle.customer_id !== customer.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to request this vehicle."
      });
    }

    if (session.parking_type !== "valet") {
      return res.status(400).json({
        success: false,
        message: "Vehicle retrieval request is available only for valet parking."
      });
    }

    if (session.status !== "parked") {
      return res.status(400).json({
        success: false,
        message: `Vehicle cannot be requested for retrieval from the current status: ${session.status}.`
      });
    }

    const { data: updatedSession, error: updateError } = await supabase
      .from("parking_sessions")
      .update({
        status: "retrieval_requested"
      })
      .eq("id", id)
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
          color
        ),
        valet:employees (
          id,
          name,
          phone,
          email
        )
      `)
      .single();

    if (updateError) {
      console.error("Customer vehicle retrieval request error:", updateError);

      return res.status(400).json({
        success: false,
        message: updateError.message
      });
    }

    if (updatedSession.valet?.email) {
      const { data: valetUser, error: valetUserError } = await supabase
        .from("users")
        .select("id")
        .eq("email", updatedSession.valet.email)
        .single();

      if (valetUserError || !valetUser) {
        console.error("Get valet user error:", valetUserError);
      } else {
        const { error: notificationError } = await supabase
          .from("notifications")
          .insert([
            {
              parking_session_id: updatedSession.id,
              recipient_type: "valet",
              recipient_id: valetUser.id,
              message: `Vehicle retrieval requested for ticket ${updatedSession.ticket_code}.`,
              channel: "in_app",
              status: "sent",
              sent_at: new Date().toISOString()
            }
          ]);

        if (notificationError) {
          console.error("Retrieval requested notification error:", notificationError);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle retrieval requested successfully.",
      session: updatedSession
    });
  } catch (error) {
    console.error("Customer vehicle retrieval request error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to request vehicle retrieval."
    });
  }
};
const getCustomerVehicles = async (req, res) => {
  try {
    const customerEmail = req.user.email;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer email not available."
      });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id, name, email")
      .eq("email", customerEmail)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found."
      });
    }

    const { data: vehicles, error: vehicleError } = await supabase
      .from("vehicles")
      .select(`
        id,
        license_plate,
        make,
        model,
        color,
        created_at
      `)
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false });

    if (vehicleError) {
      console.error("Get customer vehicles error:", vehicleError);

      return res.status(400).json({
        success: false,
        message: vehicleError.message
      });
    }

    const vehicleIds = (vehicles || []).map((vehicle) => vehicle.id);

    let activeSessions = [];

    if (vehicleIds.length > 0) {
      const { data: sessions, error: sessionError } = await supabase
        .from("parking_sessions")
        .select(`
          id,
          vehicle_id,
          ticket_code,
          parking_type,
          status,
          parking_slot,
          checked_in_at,
          parked_at,
          completed_at
        `)
        .in("vehicle_id", vehicleIds)
        .in("status", [
          "checked_in",
          "parked",
          "retrieval_requested",
          "retrieving",
          "ready_for_pickup"
        ])
        .order("checked_in_at", { ascending: false });

      if (sessionError) {
        console.error("Get customer vehicle sessions error:", sessionError);

        return res.status(400).json({
          success: false,
          message: sessionError.message
        });
      }

      activeSessions = sessions || [];
    }

    const result = (vehicles || []).map((vehicle) => {
      const session = activeSessions.find(
        (item) => item.vehicle_id === vehicle.id
      );

      return {
        ...vehicle,
        current_session: session || null
      };
    });

    return res.status(200).json({
      success: true,
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      },
      count: result.length,
      vehicles: result
    });
  } catch (error) {
    console.error("Get customer vehicles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer vehicles."
    });
  }
};

const cancelCustomerRetrieval = async (req, res) => {
  try {
    const customerEmail = req.user.email;
    const { id } = req.params;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer email not available."
      });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("email", customerEmail)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found."
      });
    }

    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .select(`
        id,
        parking_type,
        status,
        vehicle:vehicles (
          id,
          customer_id,
          license_plate,
          make,
          model
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

    if (!session.vehicle || session.vehicle.customer_id !== customer.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to modify this parking session."
      });
    }

    if (session.parking_type !== "valet") {
      return res.status(400).json({
        success: false,
        message: "Retrieval cancellation is available only for valet parking."
      });
    }

    if (session.status !== "retrieval_requested") {
      return res.status(400).json({
        success: false,
        message: `Retrieval request cannot be cancelled from the current status: ${session.status}.`
      });
    }

    const { data: updatedSession, error: updateError } = await supabase
      .from("parking_sessions")
      .update({
        status: "parked"
      })
      .eq("id", id)
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
          color
        ),
        valet:employees (
          id,
          name,
          phone
        )
      `)
      .single();

    if (updateError) {
      console.error("Cancel customer retrieval error:", updateError);

      return res.status(400).json({
        success: false,
        message: updateError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Vehicle retrieval request cancelled successfully.",
      session: updatedSession
    });
  } catch (error) {
    console.error("Cancel customer retrieval error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to cancel vehicle retrieval request."
    });
  }
};
const getCustomerProfile = async (req, res) => {
  try {
    const customerEmail = req.user.email;

    if (!customerEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer email not available."
      });
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .select(`
        id,
        name,
        phone,
        email,
        created_at
      `)
      .eq("email", customerEmail)
      .single();

    if (error || !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer account not found."
      });
    }

    return res.status(200).json({
      success: true,
      customer
    });
  } catch (error) {
    console.error("Get customer profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer profile."
    });
  }
};
module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  getCustomerDashboard,
  getCustomerParkingHistory,
  requestCustomerRetrieval,
  getCustomerVehicles,
  cancelCustomerRetrieval,
  getCustomerProfile
};