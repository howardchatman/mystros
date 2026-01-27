import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env["NEXT_PUBLIC_SUPABASE_URL"]!;
const anonKey = process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!;

console.log("URL:", supabaseUrl);
console.log("Key:", anonKey ? "Present" : "Missing");

const supabase = createClient(supabaseUrl, anonKey);

async function testLogin() {
  console.log("\n--- Testing Login with anon key ---\n");

  const { data, error } = await supabase.auth.signInWithPassword({
    email: "admin@mystros.com",
    password: "Mystros2024!",
  });

  if (error) {
    console.log("Login Error:", error.message);
    console.log("Full error:", JSON.stringify(error, null, 2));
  } else {
    console.log("Login SUCCESS!");
    console.log("User ID:", data.user?.id);
    console.log("Email:", data.user?.email);

    // Check profile
    const { data: profile, error: profileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", data.user!.id)
      .single();

    if (profileError) {
      console.log("Profile Error:", profileError.message);
    } else {
      console.log("Profile:", profile);
    }
  }
}

testLogin().catch(console.error);
