import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Creates a Supabase client for use in Next.js middleware.
 * Handles session refresh and cookie updates on every request.
 */
export async function createClient(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env["NEXT_PUBLIC_SUPABASE_URL"]!,
    process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              path: "/",
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              httpOnly: true,
            })
          );
        },
      },
    }
  );

  // Refresh the session to keep it active.
  // Wrapped in try-catch because getUser() can throw AbortError on Edge Runtime.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (error) {
    // Session refresh failed — continue without user.
    // The page-level auth checks will handle the redirect.
  }

  return { supabase, response, user };
}
