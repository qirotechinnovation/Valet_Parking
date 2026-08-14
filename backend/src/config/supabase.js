const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

console.log("SUPABASE URL:", process.env.SUPABASE_URL);
console.log(
  "SERVICE KEY EXISTS:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabase;