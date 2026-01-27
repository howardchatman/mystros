import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createStudent() {
  console.log("Creating student@demo.com...");

  // Try to create the auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email: "student@demo.com",
    password: "Demo123!",
    email_confirm: true,
    user_metadata: {
      first_name: "Demo",
      last_name: "Student",
    },
  });

  if (error) {
    console.log("Error:", error.message);
    console.log("Full error:", JSON.stringify(error, null, 2));
    return;
  }

  console.log("Created auth user:", data.user.id);

  // Create profile
  const { error: profileError } = await supabase.from("user_profiles").insert({
    id: data.user.id,
    email: "student@demo.com",
    first_name: "Demo",
    last_name: "Student",
    role: "student",
    is_active: true,
  });

  if (profileError) {
    console.log("Profile error:", profileError.message);
  } else {
    console.log("Profile created!");
  }
}

createStudent();
