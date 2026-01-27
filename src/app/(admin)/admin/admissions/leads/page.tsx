import { Suspense } from "react";
import Link from "next/link";
import { getLeads, getCampuses } from "@/lib/actions/admin-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Phone, Mail, Plus, ChevronRight } from "lucide-react";

export const metadata = {
  title: "Leads | Admin Dashboard",
  description: "Manage prospective student leads",
};

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    lead: "outline",
    applicant: "default",
    lost: "destructive",
  };
  return (
    <Badge variant={variants[status] || "outline"} className="capitalize">
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

interface PageProps {
  searchParams: Promise<{
    status?: string;
    campus?: string;
    source?: string;
    page?: string;
  }>;
}

async function LeadsTable({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 25;
  const offset = (page - 1) * limit;

  const { leads, total } = await getLeads(
    {
      status: params.status as never,
      campusId: params.campus,
      source: params.source,
    },
    limit,
    offset
  );

  const totalPages = Math.ceil(total / limit);

  if (leads.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Leads Found</h3>
        <p className="text-muted-foreground">
          Leads will appear here as they come in from your website and campaigns
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
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Contact</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Source</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Created</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => {
              const program = lead.program as { name?: string } | null;

              return (
                <tr key={lead.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-foreground">
                      {lead.first_name} {lead.last_name}
                    </p>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <span className="text-muted-foreground">{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{program?.name || "—"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm capitalize">{lead.source || "Direct"}</span>
                    {lead.source_detail && (
                      <p className="text-xs text-muted-foreground">{lead.source_detail}</p>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-muted-foreground">{formatDate(lead.created_at)}</span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(lead.status)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Button variant="ghost" size="sm">
                      View <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
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
            Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} leads
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

export default async function LeadsPage({ searchParams }: PageProps) {
  // Get counts for summary
  const [allResult, newResult, convertedResult] = await Promise.all([
    getLeads({}, 1, 0),
    getLeads({ status: "lead" as never }, 1, 0),
    getLeads({ status: "applicant" as never }, 1, 0),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Leads</h1>
          <p className="text-muted-foreground">Manage prospective students and track conversions</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Lead
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{allResult.total}</p>
                <p className="text-sm text-muted-foreground">Total Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{newResult.total}</p>
                <p className="text-sm text-muted-foreground">New Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">{convertedResult.total}</p>
                <p className="text-sm text-muted-foreground">Converted to Applicant</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            All Leads
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
            <LeadsTable searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
