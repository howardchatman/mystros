import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkAndFixUsers() {
  console.log("Checking users...\n");

  // List all auth users
  const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error("Error listing users:", listError.message);
    return;
  }

  console.log(`Found ${authUsers.users.length} auth users:\n`);

  for (const user of authUsers.users) {
    console.log(`Email: ${user.email}`);
    console.log(`  ID: ${user.id}`);
    console.log(`  Confirmed: ${user.email_confirmed_at ? "Yes" : "No"}`);

    // Check for profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.log(`  Profile: MISSING - Creating...`);

      // Determine role from email
      const role = user.email?.includes("admin") ? "superadmin" : "student";
      const firstName = user.email?.includes("admin") ? "Test" : "Test";
      const lastName = user.email?.includes("admin") ? "Admin" : "Student";

      const { error: insertError } = await supabase.from("user_profiles").insert({
        id: user.id,
        email: user.email!,
        first_name: firstName,
        last_name: lastName,
        role: role,
        is_active: true,
      });

      if (insertError) {
        console.log(`  Profile Creation Failed: ${insertError.message}`);
      } else {
        console.log(`  Profile Created: ${role}`);
      }
    } else {
      console.log(`  Profile: ${profile.role} (${profile.first_name} ${profile.last_name})`);
    }
    console.log("");
  }

  // Test login
  console.log("\n--- Testing Login ---\n");

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: "admin@mystros.com",
    password: "Mystros2024!",
  });

  if (loginError) {
    console.log(`Admin login FAILED: ${loginError.message}`);
  } else {
    console.log(`Admin login SUCCESS: ${loginData.user?.id}`);
  }

  const { data: studentLogin, error: studentError } = await supabase.auth.signInWithPassword({
    email: "student@mystros.com",
    password: "Mystros2024!",
  });

  if (studentError) {
    console.log(`Student login FAILED: ${studentError.message}`);
  } else {
    console.log(`Student login SUCCESS: ${studentLogin.user?.id}`);
  }
}

checkAndFixUsers().catch(console.error);
