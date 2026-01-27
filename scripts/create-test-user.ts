import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function createTestUser() {
  // Try a completely new email
  const email = "test123@demo.com";
  console.log(`Creating ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: "Demo123!",
    email_confirm: true,
  });

  if (error) {
    console.log("Error:", error.message);
    return;
  }

  console.log("Created auth user:", data.user.id);

  // Create profile
  const { error: profileError } = await supabase.from("user_profiles").insert({
    id: data.user.id,
    email,
    first_name: "Test",
    last_name: "User",
    role: "student",
    is_active: true,
  });

  if (profileError) {
    console.log("Profile error:", profileError.message);
  } else {
    console.log("Profile created!");
    console.log(`\nYou can login with: ${email} / Demo123!`);
  }
}

createTestUser();
