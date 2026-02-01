import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { StudentSidebar } from "@/components/layout/student-sidebar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user;
  try {
    user = await getUser();
  } catch (error: any) {
    if (error?.digest) throw error;
    redirect("/login");
  }

  if (!user) {
    redirect("/login");
  }

  // Only students can access student routes
  if (user.role !== "student") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="relative flex">
        {/* Sidebar */}
        <StudentSidebar user={user} />

        {/* Main content */}
        <main className="flex-1 lg:ml-64">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
