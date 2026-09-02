const supabase = require("../config/supabase");

const createCustomer = async (req, res) => {
  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required."
      });
    }

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("phone", phone)
      .maybeSingle();

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer with this phone number already exists."
      });
    }

    const { data: customer, error } = await supabase
      .from("customers")
      .insert([
        {
          name,
          phone,
          email: email || null
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
      message: "Customer registered successfully.",
      customer
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: customer, error } = await supabase
      .from("customers")
      .select("id, name, phone, email, created_at")
      .eq("id", id)
      .single();

    if (error || !customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found."
      });
    }

    return res.status(200).json({
      success: true,
      customer
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

module.exports = {
  createCustomer,
  getCustomerById
};