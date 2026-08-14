const supabase = require("../config/supabase");

const createStaff = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const allowedRoles = [
      "parking_admin",
      "reception_security",
      "valet",
      "cashier"
    ];

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and role are required."
      });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid staff role."
      });
    }

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: authError.message
      });
    }

    const { data: user, error: userError } = await supabase
      .from("users")
      .insert([
        {
          auth_user_id: authData.user.id,
          name,
          email,
          role
        }
      ])
      .select()
      .single();

    if (userError) {
      return res.status(400).json({
        success: false,
        message: userError.message
      });
    }

    return res.status(201).json({
      success: true,
      message: "Staff member created successfully.",
      user
    });

  } catch (error) {
    console.error("Create staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};


const getAllStaff = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at, auth_user_id, is_active")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error("Get staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

const getStaffById = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: user, error } = await supabase
      .from("users")
      .select("id, name, email, role, created_at, auth_user_id, is_active")
      .eq("id", id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found."
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Get staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .update({ name, role })
      .eq("id", id)
      .select()
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Staff updated successfully.",
      user
    });

  } catch (error) {
    console.error("Update staff error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

const updateStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    const { data: user, error } = await supabase
      .from("users")
      .update({ is_active })
      .eq("id", id)
      .select()
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        message: "Staff member not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: `Staff ${is_active ? "activated" : "deactivated"} successfully.`,
      user
    });

  } catch (error) {
    console.error("Update staff status error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

module.exports = {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  updateStaffStatus
};