import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Creates a Supabase client for use in browser/client components.
 * Uses @supabase/ssr to sync sessions to cookies so the server can read them.
 * Navigator locks are disabled to prevent signInWithPassword from hanging.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      auth: {
        flowType: "pkce",
        // Disable navigator.locks which can hang indefinitely in some browsers
        lock: async (_name: string, _acquireTimeout: number, fn: () => Promise<any>) => {
          return await fn();
        },
      },
    }
  );
}
