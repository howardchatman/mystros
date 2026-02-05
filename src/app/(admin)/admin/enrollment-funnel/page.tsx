import { getFunnelMetrics, getLeadSourceBreakdown, getRecentFunnelActivity, getAbandonedApplications } from "@/lib/actions/enrollment-funnel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, CheckCircle, GraduationCap } from "lucide-react";
import { FunnelDashboard } from "./funnel-dashboard";

export const metadata = {
  title: "Enrollment Funnel | Admin",
  description: "Track lead-to-enrollment conversion metrics",
};

export default async function EnrollmentFunnelPage() {
  const [metrics, sourceBreakdown, recentActivity, abandonedApps] = await Promise.all([
    getFunnelMetrics(),
    getLeadSourceBreakdown(),
    getRecentFunnelActivity(20),
    getAbandonedApplications(48),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Enrollment Funnel</h1>
        <p className="text-muted-foreground">Track conversion from leads to enrolled students</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Leads</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" />
              {metrics.leads}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Prospective students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Applicants</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-500" />
              {metrics.applicants}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {metrics.leadToApplicant}% of leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Accepted</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              {metrics.accepted}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {metrics.applicantToAccepted}% of applicants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Enrolled</CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-500" />
              {metrics.enrolled}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {metrics.acceptedToEnrolled}% of accepted
            </p>
          </CardContent>
        </Card>
      </div>

      <FunnelDashboard
        metrics={metrics}
        sourceBreakdown={sourceBreakdown}
        recentActivity={recentActivity}
        abandonedApps={abandonedApps}
      />
    </div>
  );
}
