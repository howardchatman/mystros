import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function checkUsers() {
  // List all auth users
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    console.log("Auth error:", authError.message);
    return;
  }

  console.log("Auth users:");
  authUsers?.users.forEach(u => {
    console.log(`  - ${u.email} (${u.id})`);
  });

  // List all profiles
  const { data: profiles, error: profileError } = await supabase
    .from("user_profiles")
    .select("id, email, first_name, last_name, role");

  if (profileError) {
    console.log("\nProfiles error:", profileError.message);
    return;
  }

  console.log("\nUser profiles:");
  profiles?.forEach(p => {
    console.log(`  - ${p.email} (${p.role}) - ${p.id}`);
  });
}

checkUsers();
