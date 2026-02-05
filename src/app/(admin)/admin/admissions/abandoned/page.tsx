import { Suspense } from "react";
import Link from "next/link";
import { getAbandonedApplications } from "@/lib/actions/enrollment-funnel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, Mail, ChevronRight, AlertTriangle, Send } from "lucide-react";
import { AbandonedActions } from "./abandoned-actions";

export const metadata = {
  title: "Abandoned Applications | Admin Dashboard",
  description: "Follow up on incomplete applications",
};

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

async function AbandonedTable() {
  const apps = await getAbandonedApplications(48);

  if (apps.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Abandoned Applications</h3>
        <p className="text-muted-foreground">
          All recent applications have been submitted. Great job keeping up with follow-ups!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Applicant</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Last Activity</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Inactive</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {apps.map((app) => {
            const daysInactive = app.daysInactive;
            const isUrgent = daysInactive > 7;

            return (
              <tr key={app.id} className="border-b border-border hover:bg-muted/50">
                <td className="py-3 px-4">
                  <p className="font-medium text-foreground">
                    {app.firstName} {app.lastName}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{app.email}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm">{app.programName || "Not selected"}</span>
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm text-muted-foreground">
                    {formatDate(app.lastActivityAt)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={isUrgent ? "destructive" : "outline"}>
                    <Clock className="w-3 h-3 mr-1" />
                    {daysInactive}d
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <AbandonedActions
                      applicationId={app.id}
                      email={app.email}
                      firstName={app.firstName}
                    />
                    <Link href={`/admin/admissions/applications/${app.id}`}>
                      <Button variant="ghost" size="sm">
                        View <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default async function AbandonedApplicationsPage() {
  const apps = await getAbandonedApplications(48);

  const urgentCount = apps.filter((a) => a.daysInactive > 7).length;
  const recentCount = apps.filter((a) => a.daysInactive <= 7).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Abandoned Applications</h1>
        <p className="text-muted-foreground">
          Follow up on applications that haven't been completed within 48 hours
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{apps.length}</p>
                <p className="text-sm text-muted-foreground">Total Abandoned</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{recentCount}</p>
                <p className="text-sm text-muted-foreground">2-7 Days Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{urgentCount}</p>
                <p className="text-sm text-muted-foreground">7+ Days Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Box */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Send className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Automated Reminders Active</p>
              <p className="text-sm text-muted-foreground">
                The system automatically enrolls abandoned applications in the reminder email sequence
                after 48 hours of inactivity. You can also manually send reminders using the button below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Abandoned Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Applications Needing Follow-Up
          </CardTitle>
          <CardDescription>
            These applications haven't been submitted and the applicant has been inactive for more than 48 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <AbandonedTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
