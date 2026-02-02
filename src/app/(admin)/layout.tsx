import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { AdminSidebar } from "@/components/layout/admin-sidebar";

const adminRoles = [
  "superadmin",
  "campus_admin",
  "admissions",
  "financial_aid",
  "instructor",
  "registrar",
  "auditor",
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getUser();
  } catch (error: any) {
    // Re-throw Next.js internal errors (DYNAMIC_SERVER_USAGE, redirects, etc.)
    if (error?.digest) {
      throw error;
    }
    redirect("/login");
  }

  if (!user) {
    redirect("/login");
  }

  // Only admin roles can access admin routes
  if (!adminRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="relative flex">
        {/* Sidebar */}
        <AdminSidebar user={user} />

        {/* Main content - light theme overrides */}
        <main className="flex-1 lg:ml-64 admin-content min-w-0">
          <div className="pt-16 px-4 pb-4 sm:px-6 sm:pb-6 lg:pt-8 lg:px-8 lg:pb-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
