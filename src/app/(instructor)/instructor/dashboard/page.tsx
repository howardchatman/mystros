import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getInstructorDashboardStats } from "@/lib/actions/instructor";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Clock, Award, PlayCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Dashboard | Instructor Portal",
  description: "Instructor dashboard overview",
};

export default async function InstructorDashboardPage() {
  const user = await getUser();
  if (!user || user.role !== "instructor") redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("campus_id")
    .eq("id", user.id)
    .single();
  const campusId = (profile as any)?.campus_id as string;
  if (!campusId) redirect("/login");

  const stats = await getInstructorDashboardStats(campusId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome, {user.first_name}
        </h1>
        <p className="text-muted-foreground">Instructor Dashboard</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <PlayCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.activeSessions}</p>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Clock className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.completedToday}</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-brand-accent/10">
                <Users className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.studentCount}</p>
                <p className="text-sm text-muted-foreground">My Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Award className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pendingEvals}</p>
                <p className="text-sm text-muted-foreground">Pending Evaluations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link
              href="/instructor/attendance"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-foreground">Take Attendance</p>
                <p className="text-xs text-muted-foreground">Clock students in/out</p>
              </div>
            </Link>
            <Link
              href="/instructor/competencies"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Award className="w-5 h-5 text-purple-500" />
              <div>
                <p className="font-medium text-foreground">Evaluate Skills</p>
                <p className="text-xs text-muted-foreground">Sign off on competencies</p>
              </div>
            </Link>
            <Link
              href="/instructor/students"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              <Users className="w-5 h-5 text-brand-accent" />
              <div>
                <p className="font-medium text-foreground">View Students</p>
                <p className="text-xs text-muted-foreground">Student roster & progress</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
