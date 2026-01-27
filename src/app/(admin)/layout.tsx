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
  const user = await getUser();

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

        {/* Main content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
