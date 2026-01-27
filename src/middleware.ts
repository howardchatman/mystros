import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/middleware";

// Routes that don't require authentication
const publicRoutes = [
  "/",
  "/programs",
  "/contact",
  "/apply",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

// Routes that require admin roles
const adminRoutes = ["/admin"];

// Admin roles that can access admin routes
const adminRoles = [
  "superadmin",
  "campus_admin",
  "admissions",
  "financial_aid",
  "instructor",
  "registrar",
  "auditor",
];

function isPublicRoute(pathname: string): boolean {
  // Check exact matches
  if (publicRoutes.includes(pathname)) return true;

  // Check prefix matches (e.g., /programs/class-a-barber)
  const publicPrefixes = ["/programs/", "/api/", "/_next/", "/textures/"];
  return publicPrefixes.some((prefix) => pathname.startsWith(prefix));
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") // Static files
  ) {
    return NextResponse.next();
  }

  // Create Supabase client and refresh session
  const { supabase, response, user } = await createClient(request);

  // Public routes - allow access
  if (isPublicRoute(pathname)) {
    // If user is logged in and tries to access login page, redirect to dashboard
    if (user && pathname === "/login") {
      // Fetch user profile to determine redirect
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const redirectUrl =
        profile?.role && adminRoles.includes(profile.role)
          ? "/admin/dashboard"
          : "/dashboard";

      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return response;
  }

  // Protected routes - require authentication
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin routes - require admin role
  if (isAdminRoute(pathname)) {
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || !adminRoles.includes(profile.role)) {
      // Non-admin trying to access admin routes - redirect to student dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Note: Intake redirect is disabled for now - dashboard will show
  // application prompt to students without a submitted application
  //
  // To re-enable: Uncomment the block below
  // if (pathname.startsWith("/dashboard") || pathname.startsWith("/hours") ||
  //     pathname.startsWith("/documents") || pathname.startsWith("/financial-aid") ||
  //     pathname.startsWith("/profile")) {
  //   const { data: profile } = await supabase
  //     .from("user_profiles")
  //     .select("role")
  //     .eq("id", user.id)
  //     .single();
  //
  //   if (profile?.role === "student" && !pathname.startsWith("/intake")) {
  //     const { data: application } = await supabase
  //       .from("applications")
  //       .select("id, submitted_at")
  //       .eq("user_id", user.id)
  //       .single();
  //
  //     if (!application || !application.submitted_at) {
  //       return NextResponse.redirect(new URL("/intake", request.url));
  //     }
  //   }
  // }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
