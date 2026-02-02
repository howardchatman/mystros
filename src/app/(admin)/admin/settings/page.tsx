import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users } from "lucide-react";
import { AddUserForm } from "./add-user-form";
import { AdminUsersTable } from "./admin-users-table";
import { CampusManager } from "./campus-manager";
import { ProgramManager } from "./program-manager";
import { ScheduleManager } from "./schedule-manager";
import { DocumentTypeManager } from "./document-type-manager";

export const metadata = {
  title: "Settings | Admin Dashboard",
  description: "Academy configuration and settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const [
    { data: campuses },
    { data: programs },
    { data: schedules },
    { data: documentTypes },
    { data: adminUsers },
    { data: { user: currentAuthUser } },
  ] = await Promise.all([
    supabase.from("campuses").select("*").order("name"),
    supabase.from("programs").select("*").order("name"),
    supabase.from("program_schedules").select("*, program:programs(name)").order("name"),
    supabase.from("document_types").select("*").order("category, name"),
    supabase.from("user_profiles").select("*").neq("role", "student").eq("is_active", true).order("last_name"),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage academy configuration</p>
      </div>

      <CampusManager campuses={(campuses || []) as any[]} />
      <ProgramManager programs={(programs || []) as any[]} />
      <ScheduleManager schedules={(schedules || []) as any[]} programs={(programs || []).map((p: any) => ({ id: p.id, name: p.name }))} />
      <DocumentTypeManager documentTypes={(documentTypes || []) as any[]} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Users
          </CardTitle>
          <CardDescription>Staff and administrator accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <AddUserForm />
          <AdminUsersTable
            adminUsers={adminUsers || []}
            currentUserId={currentAuthUser?.id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
