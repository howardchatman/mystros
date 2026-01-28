import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Creates a Supabase client for use in browser/client components.
 * This client uses the anon key and respects RLS policies.
 */
export function createClient() {
  return createSupabaseClient<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        storageKey: "mystros-auth",
      },
    }
  );
}
