import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

console.log("URL:", supabaseUrl ? "Found" : "Missing");
console.log("Key:", serviceRoleKey ? "Found" : "Missing");

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const demoUsers = [
  {
    email: "student@demo.com",
    password: "Demo123!",
    firstName: "Demo",
    lastName: "Student",
    role: "student" as const,
  },
  {
    email: "admin@demo.com",
    password: "Demo123!",
    firstName: "Demo",
    lastName: "Admin",
    role: "superadmin" as const,
  },
];

async function seedDemoUsers() {
  console.log("Seeding demo users...\n");

  for (const user of demoUsers) {
    console.log(`Creating ${user.email}...`);

    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      });

    if (authError) {
      if (authError.message.includes("already been registered")) {
        console.log(`  - User already exists, skipping auth creation`);

        // Get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === user.email);

        if (existingUser) {
          // Update or create profile
          const { error: profileError } = await supabase
            .from("user_profiles")
            .upsert({
              id: existingUser.id,
              email: user.email,
              first_name: user.firstName,
              last_name: user.lastName,
              role: user.role,
              is_active: true,
            });

          if (profileError) {
            console.log(`  - Profile error: ${profileError.message}`);
          } else {
            console.log(`  - Profile updated`);
          }
        }
        continue;
      }
      console.error(`  - Auth error: ${authError.message}`);
      continue;
    }

    console.log(`  - Auth user created: ${authData.user.id}`);

    // Create user profile
    const { error: profileError } = await supabase.from("user_profiles").insert({
      id: authData.user.id,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      role: user.role,
      is_active: true,
    });

    if (profileError) {
      console.error(`  - Profile error: ${profileError.message}`);
    } else {
      console.log(`  - Profile created`);
    }
  }

  console.log("\nDone! Demo accounts:");
  console.log("  - student@demo.com / Demo123!");
  console.log("  - admin@demo.com / Demo123!");
}

seedDemoUsers().catch(console.error);
