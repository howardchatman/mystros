import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const serviceRoleKey = process.env["SUPABASE_SERVICE_ROLE_KEY"]!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE_URL or SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

const testUsers: TestUser[] = [
  {
    email: "admin@mystros.com",
    password: "Mystros2024!",
    firstName: "Test",
    lastName: "Admin",
    role: "superadmin",
  },
  {
    email: "student@mystros.com",
    password: "Mystros2024!",
    firstName: "Test",
    lastName: "Student",
    role: "student",
  },
];

async function deleteExistingUser(email: string) {
  // Find user by email
  const { data: users } = await supabase.auth.admin.listUsers();
  const existingUser = users?.users?.find((u) => u.email === email);

  if (existingUser) {
    console.log(`  Deleting existing user: ${email}`);
    // Delete profile first
    await supabase.from("user_profiles").delete().eq("id", existingUser.id);
    // Delete auth user
    await supabase.auth.admin.deleteUser(existingUser.id);
  }
}

async function createTestUser(user: TestUser) {
  console.log(`\nCreating: ${user.email} (${user.role})`);

  // Delete if exists
  await deleteExistingUser(user.email);

  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: user.email,
    password: user.password,
    email_confirm: true,
    user_metadata: {
      first_name: user.firstName,
      last_name: user.lastName,
    },
  });

  if (authError) {
    console.error(`  Auth Error: ${authError.message}`);
    return false;
  }

  if (!authData.user) {
    console.error("  No user returned from createUser");
    return false;
  }

  console.log(`  Auth user created: ${authData.user.id}`);

  // Create profile
  const { error: profileError } = await supabase.from("user_profiles").insert({
    id: authData.user.id,
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    role: user.role,
    is_active: true,
  });

  if (profileError) {
    console.error(`  Profile Error: ${profileError.message}`);
    // Cleanup auth user
    await supabase.auth.admin.deleteUser(authData.user.id);
    return false;
  }

  console.log(`  Profile created successfully!`);
  return true;
}

async function main() {
  console.log("=".repeat(50));
  console.log("Mystros Test User Setup");
  console.log("=".repeat(50));

  let allSuccess = true;

  for (const user of testUsers) {
    const success = await createTestUser(user);
    if (!success) allSuccess = false;
  }

  console.log("\n" + "=".repeat(50));
  if (allSuccess) {
    console.log("All test users created successfully!");
    console.log("\nLogin Credentials:");
    console.log("-".repeat(50));
    for (const user of testUsers) {
      console.log(`${user.role.toUpperCase()}: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Redirects to: ${user.role === "student" ? "/dashboard" : "/admin/dashboard"}`);
      console.log("");
    }
  } else {
    console.log("Some users failed to create. Check errors above.");
  }
  console.log("=".repeat(50));
}

main().catch(console.error);
