import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { getStudentDashboardData } from "@/lib/actions/student-dashboard";
import { checkIntakeStatus } from "@/lib/actions/applications";
import { HoursProgressCard } from "@/components/student/hours-progress-card";
import { AttendanceSummaryCard } from "@/components/student/attendance-summary-card";
import { FinancialSummaryCard } from "@/components/student/financial-summary-card";
import { FinancialAidStatusCard } from "@/components/student/financial-aid-status-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, MapPin, Calendar } from "lucide-react";
import { format, parseISO } from "date-fns";

export const metadata = {
  title: "Dashboard",
  description: "Your student dashboard at Mystros Barber Academy",
};

export default async function StudentDashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if student needs to complete intake
  const { needsIntake } = await checkIntakeStatus();

  if (needsIntake) {
    redirect("/intake");
  }

  // Get dashboard data
  const { student, recentAttendance, financialAccount, financialAid, program } =
    await getStudentDashboardData();

  // If no student record found (shouldn't happen but handle gracefully)
  if (!student) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-display font-bold text-brand-text mb-4">
          Welcome to Mystros Barber Academy
        </h1>
        <p className="text-brand-muted">
          Your student record is being set up. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-brand-text">
            Welcome back, {student.first_name}!
          </h1>
          <p className="text-brand-muted">
            Here&apos;s an overview of your progress
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-elevated border border-white/10">
          <span className="text-xs text-brand-muted">Student ID:</span>
          <span className="text-sm font-mono text-brand-accent">
            {student.student_number}
          </span>
        </div>
      </div>

      {/* Student Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-accent/10">
                <GraduationCap className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-xs text-brand-muted">Program</p>
                <p className="text-sm font-medium text-brand-text">
                  {program?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-accent/10">
                <MapPin className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-xs text-brand-muted">Campus</p>
                <p className="text-sm font-medium text-brand-text">
                  {student.campus?.name || "N/A"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-brand-accent/10">
                <Calendar className="w-5 h-5 text-brand-accent" />
              </div>
              <div>
                <p className="text-xs text-brand-muted">Expected Graduation</p>
                <p className="text-sm font-medium text-brand-text">
                  {student.expected_graduation_date
                    ? format(parseISO(student.expected_graduation_date), "MMM d, yyyy")
                    : "TBD"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hours Progress */}
        {program && (
          <HoursProgressCard
            student={{
              total_hours_completed: student.total_hours_completed || 0,
              theory_hours_completed: student.theory_hours_completed || 0,
              practical_hours_completed: student.practical_hours_completed || 0,
            }}
            program={{
              total_hours: program.total_hours,
              theory_hours: program.theory_hours,
              practical_hours: program.practical_hours,
            }}
          />
        )}

        {/* Attendance Summary */}
        <AttendanceSummaryCard attendance={recentAttendance} />

        {/* Financial Summary */}
        <FinancialSummaryCard account={financialAccount} />

        {/* Financial Aid Status */}
        <FinancialAidStatusCard financialAid={financialAid} />
      </div>

      {/* SAP Status (if applicable) */}
      {student.current_sap_status && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">
              Satisfactory Academic Progress (SAP)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  student.current_sap_status === "satisfactory"
                    ? "bg-green-500/10 text-green-400"
                    : student.current_sap_status === "warning"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {student.current_sap_status.charAt(0).toUpperCase() +
                  student.current_sap_status.slice(1).replace("_", " ")}
              </div>
              {student.last_sap_evaluation_date && (
                <span className="text-sm text-brand-muted">
                  Last evaluated:{" "}
                  {format(parseISO(student.last_sap_evaluation_date), "MMM d, yyyy")}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
