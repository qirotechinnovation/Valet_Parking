const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// console.log("SUPABASE URL:", process.env.SUPABASE_URL);
// console.log(
//   "SERVICE KEY EXISTS:",
//   !!process.env.SUPABASE_SERVICE_ROLE_KEY
// );



if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "⚠️ Warning: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. Ensure .env is configured."
  );
}

const supabase = createClient(
  process.env.SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key"
);

module.exports = supabase;