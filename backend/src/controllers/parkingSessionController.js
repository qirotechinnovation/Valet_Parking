const supabase = require("../config/supabase");

const getParkingSessions = async (req, res) => {
  try {
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
      .order("checked_in_at", { ascending: false });

    if (error) {
      console.error("Get parking sessions error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
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

    // Check valet exists and is active
    const { data: valet, error: valetError } = await supabase
      .from("employees")
      .select("id, name, role, is_active")
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

module.exports = {
  getParkingSessions,
  createParkingSession,
  assignParkingSlot,
  assignValet
};