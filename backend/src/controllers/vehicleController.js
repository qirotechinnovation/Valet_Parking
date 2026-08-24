const supabase = require("../config/supabase");

// ============================================================
// CREATE VEHICLE
// ============================================================

const createVehicle = async (req, res) => {
  try {
    const {
      customer_id,
      license_plate,
      make,
      model,
      color
    } = req.body;

    if (!customer_id || !license_plate) {
      return res.status(400).json({
        success: false,
        message: "Customer ID and license plate are required."
      });
    }

    // Check whether customer exists
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .select("id")
      .eq("id", customer_id)
      .single();

    if (customerError || !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    // Check duplicate vehicle
    const { data: existingVehicle, error: existingVehicleError } =
      await supabase
        .from("vehicles")
        .select("id")
        .eq("license_plate", license_plate.trim().toUpperCase())
        .maybeSingle();

    if (existingVehicleError) {
      console.error(
        "Check existing vehicle error:",
        existingVehicleError
      );

      return res.status(400).json({
        success: false,
        message: existingVehicleError.message
      });
    }

    if (existingVehicle) {
      return res.status(409).json({
        success: false,
        message: "A vehicle with this license plate already exists.",
        vehicle_id: existingVehicle.id
      });
    }

    // Create vehicle
    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .insert([
        {
          customer_id,
          license_plate: license_plate.trim().toUpperCase(),
          make: make?.trim() || null,
          model: model?.trim() || null,
          color: color?.trim() || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Create vehicle error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Vehicle created successfully.",
      vehicle
    });

  } catch (error) {
    console.error("Create vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create vehicle."
    });
  }
};


// ============================================================
// GET VEHICLES
// ============================================================

const getVehicles = async (req, res) => {
  try {
    const { search } = req.query;

    let query = supabase
      .from("vehicles")
      .select(`
        id,
        customer_id,
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
      `)
      .order("license_plate", { ascending: true });

    const { data: vehicles, error } = await query;

    if (error) {
      console.error("Get vehicles error:", error);

      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    let result = vehicles || [];

    if (search) {
      const searchTerm = search.toLowerCase();

      result = result.filter((vehicle) => {
        const plate =
          vehicle.license_plate?.toLowerCase() || "";

        const make =
          vehicle.make?.toLowerCase() || "";

        const model =
          vehicle.model?.toLowerCase() || "";

        const customer =
          vehicle.customer?.name?.toLowerCase() || "";

        const phone =
          vehicle.customer?.phone?.toLowerCase() || "";

        return (
          plate.includes(searchTerm) ||
          make.includes(searchTerm) ||
          model.includes(searchTerm) ||
          customer.includes(searchTerm) ||
          phone.includes(searchTerm)
        );
      });
    }

    return res.status(200).json({
      success: true,
      count: result.length,
      vehicles: result
    });

  } catch (error) {
    console.error("Get vehicles error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicles."
    });
  }
};


// ============================================================
// GET VEHICLE BY ID
// ============================================================

const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: vehicle, error } = await supabase
      .from("vehicles")
      .select(`
        id,
        customer_id,
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
      `)
      .eq("id", id)
      .single();

    if (error || !vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found."
      });
    }

    return res.status(200).json({
      success: true,
      vehicle
    });

  } catch (error) {
    console.error("Get vehicle error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch vehicle."
    });
  }
};


module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById
};