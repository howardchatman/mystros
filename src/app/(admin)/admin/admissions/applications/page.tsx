import { Suspense } from "react";
import Link from "next/link";
import { getApplications, getCampuses } from "@/lib/actions/admin-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { ApplicationFilters } from "./application-filters";

export const metadata = {
  title: "Applications | Admin Dashboard",
  description: "Review and manage student applications",
};

function getStatusBadge(status: string) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof CheckCircle }> = {
    applicant: { variant: "outline", icon: Clock },
    accepted: { variant: "default", icon: CheckCircle },
    denied: { variant: "destructive", icon: XCircle },
    enrolled: { variant: "secondary", icon: CheckCircle },
  };

  const { variant, icon: Icon } = config[status] || { variant: "outline" as const, icon: AlertCircle };

  return (
    <Badge variant={variant} className="capitalize gap-1">
      <Icon className="w-3 h-3" />
      {status.replace("_", " ")}
    </Badge>
  );
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeAgo(dateString: string | null) {
  if (!dateString) return "Not submitted";
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return formatDate(dateString);
}

interface PageProps {
  searchParams: Promise<{
    status?: string;
    campus?: string;
    submitted?: string;
    page?: string;
  }>;
}

async function ApplicationsTable({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 25;
  const offset = (page - 1) * limit;

  const { applications, total } = await getApplications(
    {
      status: params.status as never,
      campusId: params.campus,
      submitted: params.submitted === "true" ? true : params.submitted === "false" ? false : undefined,
    },
    limit,
    offset
  );

  const totalPages = Math.ceil(total / limit);

  if (applications.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Applications Found</h3>
        <p className="text-muted-foreground">
          {params.status || params.campus
            ? "Try adjusting your filters"
            : "Applications will appear here when students apply"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Applicant</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Campus</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Desired Start</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Submitted</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => {
              const campus = app.campus as { name?: string } | null;
              const program = app.program as { name?: string } | null;

              return (
                <tr key={app.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {app.first_name} {app.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{app.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{program?.name || "—"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{campus?.name || "—"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{formatDate(app.desired_start_date)}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(app.submitted_at)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(app.status)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/admin/admissions/applications/${app.id}`}>
                      <Button variant="ghost" size="sm">
                        Review <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} applications
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={{ query: { ...params, page: page - 1 } }}>
                <Button variant="outline" size="sm">Previous</Button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={{ query: { ...params, page: page + 1 } }}>
                <Button variant="outline" size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function ApplicationsPage({ searchParams }: PageProps) {
  const { campuses } = await getCampuses();

  // Get counts for summary cards
  const [pendingResult, acceptedResult, deniedResult] = await Promise.all([
    getApplications({ status: "applicant" as never, submitted: true }, 1, 0),
    getApplications({ status: "accepted" as never }, 1, 0),
    getApplications({ status: "denied" as never }, 1, 0),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Applications</h1>
        <p className="text-muted-foreground">Review and process student applications</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingResult.total}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{acceptedResult.total}</p>
                <p className="text-sm text-muted-foreground">Accepted</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-500/10 border-red-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{deniedResult.total}</p>
                <p className="text-sm text-muted-foreground">Denied</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <ApplicationFilters campuses={campuses} />

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            All Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            <ApplicationsTable searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
