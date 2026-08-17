const supabase = require("../config/supabase");

const createParkingSlot = async (req, res) => {
  try {
    const { slot_number, parking_type } = req.body;

    if (!slot_number || !parking_type) {
      return res.status(400).json({
        success: false,
        message: "slot_number and parking_type are required."
      });
    }

    const { data, error } = await supabase
      .from("parking_slots")
      .insert([
        {
          slot_number,
          parking_type
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Create parking slot error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Parking slot created successfully.",
      slot: data
    });
  } catch (error) {
    console.error("Create parking slot error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create parking slot."
    });
  }
};


const getParkingSlots = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("parking_slots")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Get parking slots error:", error);

      return res.status(500).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      count: data.length,
      slots: data
    });
  } catch (error) {
    console.error("Get parking slots error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch parking slots."
    });
  }
};

const getParkingSlotById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("parking_slots")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Get parking slot by ID error:", error);

      return res.status(404).json({
        success: false,
        message: "Parking slot not found."
      });
    }

    return res.status(200).json({
      success: true,
      slot: data
    });
  } catch (error) {
    console.error("Get parking slot by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch parking slot."
    });
  }
};


const updateParkingSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { slot_number, parking_type } = req.body;

    if (!slot_number || !parking_type) {
      return res.status(400).json({
        success: false,
        message: "slot_number and parking_type are required."
      });
    }

    const { data, error } = await supabase
      .from("parking_slots")
      .update({
        slot_number,
        parking_type
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update parking slot error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Parking slot updated successfully.",
      slot: data
    });
  } catch (error) {
    console.error("Update parking slot error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update parking slot."
    });
  }
};

const updateParkingSlotStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "status is required."
      });
    }

    const allowedStatuses = ["available", "occupied", "maintenance"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Use available, occupied, or maintenance."
      });
    }

    const { data, error } = await supabase
      .from("parking_slots")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update parking slot status error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: "Parking slot status updated successfully.",
      slot: data
    });
  } catch (error) {
    console.error("Update parking slot status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update parking slot status."
    });
  }
};

module.exports = {
  createParkingSlot,
  getParkingSlots,
  getParkingSlotById,
  updateParkingSlot,
   updateParkingSlotStatus
};