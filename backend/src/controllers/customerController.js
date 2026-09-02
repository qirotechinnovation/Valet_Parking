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

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
};