import { getUser } from "@/lib/actions/auth";
import {
  getAdminDashboardKPIs,
  getStudentRoster,
  getPendingApplications,
  getTodayAttendanceSummary,
} from "@/lib/actions/admin-dashboard";
import { KPICard } from "@/components/admin/kpi-card";
import { PendingApplicationsList } from "@/components/admin/pending-applications-list";
import { StudentRosterTable } from "@/components/admin/student-roster-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, FileText, DollarSign, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Admin Dashboard",
  description: "Mystros Barber Academy Admin Dashboard",
};

export default async function AdminDashboardPage() {
  const user = await getUser();

  // Fetch all dashboard data in parallel — each function handles its own errors
  const [kpis, roster, applications, attendance] = await Promise.all([
    getAdminDashboardKPIs().catch(() => ({ totalActiveStudents: 0, todayAttendanceRate: 0, pendingApplications: 0, totalOutstandingBalance: 0 })),
    getStudentRoster(undefined, 5).catch(() => ({ students: [], total: 0 })),
    getPendingApplications(undefined, 5).catch(() => ({ applications: [] })),
    getTodayAttendanceSummary().catch(() => ({ present: 0, absent: 0, tardy: 0, records: [] })),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">
          Welcome back, {user?.first_name}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening at Mystros Barber Academy
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Active Students"
          value={kpis.totalActiveStudents}
          icon={Users}
          href="/admin/students"
          color="default"
        />
        <KPICard
          label="Today's Attendance"
          value={`${kpis.todayAttendanceRate.toFixed(0)}%`}
          icon={Clock}
          href="/admin/attendance"
          color={kpis.todayAttendanceRate >= 80 ? "success" : kpis.todayAttendanceRate >= 60 ? "warning" : "danger"}
        />
        <KPICard
          label="Pending Applications"
          value={kpis.pendingApplications}
          icon={FileText}
          href="/admin/admissions/applications"
          color={kpis.pendingApplications > 5 ? "warning" : "default"}
        />
        <KPICard
          label="Outstanding Balance"
          value={`$${kpis.totalOutstandingBalance.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}`}
          icon={DollarSign}
          href="/admin/financial-aid"
          color={kpis.totalOutstandingBalance > 50000 ? "danger" : "default"}
        />
      </div>

      {/* Today's Attendance Summary */}
      <Link href="/admin/attendance" className="block">
        <Card className="transition-colors hover:bg-muted/50 cursor-pointer">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Today&apos;s Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-green-500">{attendance.present}</p>
                  <p className="text-sm text-muted-foreground">Present</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold text-red-500">{attendance.absent}</p>
                  <p className="text-sm text-muted-foreground">Absent</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-500/10">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold text-yellow-500">{attendance.tardy}</p>
                  <p className="text-sm text-muted-foreground">Tardy</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Two-column layout for tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Applications */}
        <PendingApplicationsList applications={applications.applications} />

        {/* Student Roster */}
        <StudentRosterTable students={roster.students} total={roster.total} />
      </div>
    </div>
  );
}
