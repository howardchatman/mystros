import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, CheckCircle, XCircle, Users } from "lucide-react";
import { AttendanceManager } from "./attendance-manager";

export const metadata = {
  title: "Attendance | Admin Dashboard",
  description: "Manage student attendance records",
};

export default async function AttendancePage() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  // Get current user role
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role, campus_id")
    .eq("id", user?.id ?? "")
    .single();

  const userRole = profile?.role || "instructor";

  // Get campuses
  const { data: campuses } = await supabase
    .from("campuses")
    .select("id, name")
    .order("name");

  // Get today's attendance summary
  const { data: todayRecords } = await supabase
    .from("attendance_records")
    .select("id, status, clock_out_time")
    .eq("attendance_date", today);

  const records = todayRecords || [];
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const activeCount = records.filter((r) => !r.clock_out_time && r.status === "present").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Attendance</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-brand-accent/10">
                <Users className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{records.length}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-red-500/10">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-500/10">
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Clocked In</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive attendance manager */}
      <AttendanceManager
        campuses={campuses || []}
        initialCampusId={profile?.campus_id || undefined}
        userRole={userRole}
      />
    </div>
  );
}
