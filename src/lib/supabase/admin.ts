import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client with the service role key.
 * This client bypasses RLS and should ONLY be used server-side for trusted operations.
 *
 * Use cases:
 * - Creating user profiles after signup
 * - Admin operations that need to bypass RLS
 * - Automated background jobs
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["SUPABASE_SERVICE_ROLE_KEY"]!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
