import { Suspense } from "react";
import Link from "next/link";
import { getStudents, getCampuses, getPrograms } from "@/lib/actions/admin-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Search, Filter, Plus, ChevronRight } from "lucide-react";
import { StudentFilters } from "./student-filters";
import { BulkStatusUpdate } from "./bulk-status-update";

export const metadata = {
  title: "Students | Admin Dashboard",
  description: "Manage enrolled students",
};

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    active: "default",
    enrolled: "default",
    graduated: "secondary",
    withdrawn: "destructive",
    loa: "outline",
  };
  return (
    <Badge variant={variants[status] || "outline"} className="capitalize">
      {status.replace("_", " ")}
    </Badge>
  );
}

function getSapBadge(status: string) {
  const colors: Record<string, string> = {
    satisfactory: "bg-green-500/20 text-green-400",
    warning: "bg-yellow-500/20 text-yellow-400",
    probation: "bg-orange-500/20 text-orange-400",
    suspension: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${colors[status] || "bg-gray-500/20 text-gray-400"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{
    status?: string;
    campus?: string;
    program?: string;
    search?: string;
    page?: string;
  }>;
}

async function StudentTable({ searchParams }: { searchParams: PageProps["searchParams"] }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = 25;
  const offset = (page - 1) * limit;

  const { students, total } = await getStudents(
    {
      status: params.status as never,
      campusId: params.campus,
      programId: params.program,
      search: params.search,
    },
    limit,
    offset
  );

  const totalPages = Math.ceil(total / limit);

  if (students.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Students Found</h3>
        <p className="text-muted-foreground">
          {params.search || params.status || params.campus
            ? "Try adjusting your filters"
            : "Students will appear here once enrolled"}
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
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">SAP</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const program = student.program as { name?: string; total_hours?: number } | null;
              const progressPercent = program?.total_hours
                ? Math.round((student.total_hours_completed / program.total_hours) * 100)
                : 0;

              return (
                <tr key={student.id} className="border-b border-border hover:bg-muted/50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-foreground">
                        {student.first_name} {student.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm">{student.student_number || "—"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm">{program?.name || "—"}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(progressPercent, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {student.total_hours_completed}/{program?.total_hours || 0}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {getSapBadge(student.current_sap_status)}
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(student.status)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link href={`/admin/students/${student.id}`}>
                      <Button variant="ghost" size="sm">
                        View <ChevronRight className="w-4 h-4 ml-1" />
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
            Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} students
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={{
                  query: { ...params, page: page - 1 },
                }}
              >
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={{
                  query: { ...params, page: page + 1 },
                }}
              >
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function StudentsPage({ searchParams }: PageProps) {
  const [{ campuses }, { programs }] = await Promise.all([
    getCampuses(),
    getPrograms(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground">Manage enrolled students and their records</p>
        </div>
        <Link href="/admin/admissions/applications">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Enroll Student
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <StudentFilters campuses={campuses} programs={programs} />

      {/* Student Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Student Roster
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
            <StudentTable searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Bulk Status Update */}
      <BulkStatusUpdate />
    </div>
  );
}
