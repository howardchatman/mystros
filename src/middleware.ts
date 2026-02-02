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
  "/admissions",
  "/about",
  "/financial-aid",
  "/privacy",
  "/terms",
  "/consumer-disclosures",
  "/student-resources",
  "/community",
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

  // Refresh the session on every request so cookies stay in sync.
  // Auth checks are still handled in page layouts — middleware only keeps
  // the cookie-based session alive.
  try {
    const { response } = await createClient(request);
    return response;
  } catch {
    // If middleware Supabase call fails, let the request through.
    // Page-level auth checks will handle protection.
    return NextResponse.next();
  }
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
