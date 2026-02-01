import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Users, Clock, DollarSign, TrendingUp, GraduationCap } from "lucide-react";

export const metadata = {
  title: "Reports | Admin Dashboard",
  description: "View academy reports and analytics",
};

export default async function ReportsPage() {
  const supabase = await createClient();

  // Get student counts by status
  const { data: allStudents } = await supabase
    .from("students")
    .select("status, total_hours_completed, current_sap_status");

  const students = allStudents || [];
  const statusCounts: Record<string, number> = {};
  const sapCounts: Record<string, number> = {};
  let totalHoursAll = 0;

  students.forEach((s) => {
    statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;
    sapCounts[s.current_sap_status] = (sapCounts[s.current_sap_status] || 0) + 1;
    totalHoursAll += s.total_hours_completed || 0;
  });

  // Get application stats
  const { data: applications } = await supabase
    .from("applications")
    .select("status");

  const appCounts: Record<string, number> = {};
  (applications || []).forEach((a) => {
    appCounts[a.status] = (appCounts[a.status] || 0) + 1;
  });

  // Get financial summary
  const { data: accounts } = await supabase
    .from("student_accounts")
    .select("current_balance, total_charges, total_payments, total_aid_applied");

  const financialSummary = (accounts || []).reduce(
    (acc, a) => ({
      totalBalance: acc.totalBalance + (a.current_balance || 0),
      totalCharges: acc.totalCharges + (a.total_charges || 0),
      totalPayments: acc.totalPayments + (a.total_payments || 0),
      totalAid: acc.totalAid + (a.total_aid_applied || 0),
    }),
    { totalBalance: 0, totalCharges: 0, totalPayments: 0, totalAid: 0 }
  );

  // Get attendance stats for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { data: attendanceRecords } = await supabase
    .from("attendance_records")
    .select("status, actual_hours")
    .gte("attendance_date", thirtyDaysAgo.toISOString().split("T")[0]);

  const attendanceStats = (attendanceRecords || []).reduce(
    (acc, r) => ({
      total: acc.total + 1,
      present: acc.present + (r.status === "present" ? 1 : 0),
      absent: acc.absent + (r.status === "absent" ? 1 : 0),
      tardy: acc.tardy + (r.status === "tardy" ? 1 : 0),
      totalHours: acc.totalHours + (r.actual_hours || 0),
    }),
    { total: 0, present: 0, absent: 0, tardy: 0, totalHours: 0 }
  );

  const attendanceRate = attendanceStats.total > 0
    ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
    : 0;

  function formatCurrency(amount: number) {
    return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Academy-wide reports and analytics</p>
      </div>

      {/* Enrollment Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Enrollment Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Active", value: statusCounts["active"] || 0, color: "text-green-500" },
              { label: "Enrolled", value: statusCounts["enrolled"] || 0, color: "text-blue-500" },
              { label: "Graduated", value: statusCounts["graduated"] || 0, color: "text-purple-500" },
              { label: "Withdrawn", value: statusCounts["withdrawn"] || 0, color: "text-red-500" },
              { label: "LOA", value: statusCounts["loa"] || 0, color: "text-yellow-500" },
              { label: "Total", value: students.length, color: "text-foreground" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/30">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* SAP Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Satisfactory Academic Progress (SAP)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Satisfactory", value: sapCounts["satisfactory"] || 0, color: "text-green-500" },
              { label: "Warning", value: sapCounts["warning"] || 0, color: "text-yellow-500" },
              { label: "Probation", value: sapCounts["probation"] || 0, color: "text-orange-500" },
              { label: "Suspension", value: sapCounts["suspension"] || 0, color: "text-red-500" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-lg bg-muted/30">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground">Total Clock Hours Completed (All Students)</p>
            <p className="text-2xl font-bold text-foreground">{totalHoursAll.toLocaleString()} hours</p>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Attendance Report (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: "Total Records", value: attendanceStats.total, color: "text-foreground" },
              { label: "Present", value: attendanceStats.present, color: "text-green-500" },
              { label: "Absent", value: attendanceStats.absent, color: "text-red-500" },
              { label: "Tardy", value: attendanceStats.tardy, color: "text-yellow-500" },
              { label: "Attendance Rate", value: `${attendanceRate}%`, color: attendanceRate >= 80 ? "text-green-500" : "text-red-500" },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/30">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground">Total Hours Logged (30 Days)</p>
            <p className="text-2xl font-bold text-foreground">{attendanceStats.totalHours.toLocaleString()} hours</p>
          </div>
        </CardContent>
      </Card>

      {/* Financial Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Financial Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Charges", value: formatCurrency(financialSummary.totalCharges) },
              { label: "Total Payments", value: formatCurrency(financialSummary.totalPayments) },
              { label: "Total Aid Applied", value: formatCurrency(financialSummary.totalAid) },
              { label: "Outstanding Balance", value: formatCurrency(financialSummary.totalBalance) },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Applications Report */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Applications Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            {[
              { label: "Total", value: applications?.length || 0 },
              { label: "Draft", value: appCounts["draft"] || 0 },
              { label: "Submitted", value: appCounts["submitted"] || 0 },
              { label: "Accepted", value: appCounts["accepted"] || 0 },
              { label: "Denied", value: appCounts["denied"] || 0 },
            ].map((stat) => (
              <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
