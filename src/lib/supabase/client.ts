import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Creates a Supabase client for use in browser/client components.
 * This client uses the anon key and respects RLS policies.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      auth: {
        // Disable lock to prevent AbortError on some browsers
        lock: false,
        // Don't auto-refresh on page load
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    }
  );
}
