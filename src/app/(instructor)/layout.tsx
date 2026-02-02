import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { InstructorSidebar } from "@/components/layout/instructor-sidebar";

export default async function InstructorLayout({
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

  if (user.role !== "instructor") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="relative flex">
        <InstructorSidebar user={user} />
        <main className="flex-1 lg:ml-64 admin-content min-w-0">
          <div className="pt-16 px-4 pb-4 sm:px-6 sm:pb-6 lg:pt-8 lg:px-8 lg:pb-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
