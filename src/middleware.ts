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

  // Allow all routes - auth is handled client-side in page components
  // This avoids the localStorage/cookie mismatch between client and server
  return NextResponse.next();
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
