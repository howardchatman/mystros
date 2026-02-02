import { createClient } from "@/lib/supabase/server";
import {
  getEnrollmentReport,
  getAttendanceReport,
  getFinancialReport,
  getApplicationsReport,
  getSapReport,
  getCompletionReport,
  getRetentionReport,
  getHoursReport,
} from "@/lib/actions/reports";
import { ReportDashboard } from "./report-dashboard";

export const metadata = {
  title: "Reports | Admin Dashboard",
  description: "View academy reports and analytics",
};

export default async function ReportsPage() {
  const supabase = await createClient();

  const [
    { data: campuses },
    enrollment,
    attendance,
    financial,
    applications,
    sap,
    completion,
    retention,
    hours,
  ] = await Promise.all([
    supabase.from("campuses").select("id, name").eq("is_active", true).order("name"),
    getEnrollmentReport(),
    getAttendanceReport(),
    getFinancialReport(),
    getApplicationsReport(),
    getSapReport(),
    getCompletionReport(),
    getRetentionReport(),
    getHoursReport(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Reports</h1>
        <p className="text-muted-foreground">Academy-wide reports and analytics</p>
      </div>

      <ReportDashboard
        campuses={(campuses || []).map((c) => ({ id: c.id, name: c.name }))}
        initialEnrollment={enrollment.data || { total: 0, statusCounts: {}, totalHours: 0 }}
        initialAttendance={attendance.data || { total: 0, present: 0, absent: 0, tardy: 0, totalHours: 0, rate: 0 }}
        initialFinancial={financial.data || { totalCharges: 0, totalPayments: 0, totalAid: 0, totalBalance: 0, count: 0 }}
        initialApplications={applications.data || { total: 0, statusCounts: {} }}
        initialSap={sap.data || { total: 0, sapCounts: {}, totalHours: 0 }}
        initialCompletion={completion.data || { total: 0, graduated: 0, rate: 0, byProgram: {} }}
        initialRetention={retention.data || { total: 0, retained: 0, withdrawn: 0, rate: 0 }}
        initialHours={hours.data || { totalScheduled: 0, totalActual: 0, variance: 0, rate: 0, recordCount: 0 }}
      />
    </div>
  );
}
