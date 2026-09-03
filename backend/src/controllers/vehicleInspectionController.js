const supabase = require("../config/supabase");

const createVehicleInspection = async (req, res) => {
  try {
    const {
      session_id,
      vehicle_id,
      condition_status,
      damage_description,
      inspection_notes
    } = req.body;

    if (!session_id || !vehicle_id || !condition_status) {
      return res.status(400).json({
        success: false,
        message: "Session ID, vehicle ID and condition status are required."
      });
    }

    if (!["good", "damaged"].includes(condition_status)) {
      return res.status(400).json({
        success: false,
        message: "Condition status must be good or damaged."
      });
    }

    const { data: session, error: sessionError } = await supabase
      .from("parking_sessions")
      .select("id, vehicle_id")
      .eq("id", session_id)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({
        success: false,
        message: "Parking session not found."
      });
    }

    if (session.vehicle_id !== vehicle_id) {
      return res.status(400).json({
        success: false,
        message: "Vehicle does not belong to this parking session."
      });
    }

    const { data: existingInspection } = await supabase
      .from("vehicle_inspections")
      .select("id")
      .eq("session_id", session_id)
      .maybeSingle();

    if (existingInspection) {
      return res.status(409).json({
        success: false,
        message: "Inspection already exists for this parking session."
      });
    }

    const { data: inspection, error } = await supabase
      .from("vehicle_inspections")
      .insert([
        {
          session_id,
          vehicle_id,
          condition_status,
          damage_description: damage_description || null,
          inspection_notes: inspection_notes || null,
          inspected_by: req.user.id
        }
      ])
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Vehicle inspection recorded successfully.",
      inspection
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

const getInspectionBySession = async (req, res) => {
  try {
    const { session_id } = req.params;

    const { data: inspection, error } = await supabase
      .from("vehicle_inspections")
      .select(`
        id,
        session_id,
        vehicle_id,
        condition_status,
        damage_description,
        inspection_notes,
        inspected_by,
        inspected_at,
        users (
          id,
          name,
          email,
          role
        )
      `)
      .eq("session_id", session_id)
      .maybeSingle();

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (!inspection) {
      return res.status(404).json({
        success: false,
        message: "Inspection not found."
      });
    }

    return res.status(200).json({
      success: true,
      inspection
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

module.exports = {
  createVehicleInspection,
  getInspectionBySession
};