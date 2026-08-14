const supabase = require("../config/supabase");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required."
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
  console.log("SUPABASE LOGIN ERROR:", error);

  return res.status(401).json({
    success: false,
    message: error.message
  });
}

    const authUser = data.user;

    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, name, email, role")
      .eq("auth_user_id", authUser.id)
      .single();

    if (userError || !user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user,
      session: data.session
    });

  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

module.exports = {
  login
};