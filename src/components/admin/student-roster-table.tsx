"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface Student {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  total_hours_completed: number;
  campus?: { name: string }[] | { name: string } | null;
  program?: { name: string; total_hours: number }[] | { name: string; total_hours: number } | null;
}

// Helper to get value from Supabase relation (handles both array and object)
function getRelation<T>(rel: T[] | T | null | undefined): T | undefined {
  if (!rel) return undefined;
  return Array.isArray(rel) ? rel[0] : rel;
}

interface StudentRosterTableProps {
  students: Student[];
  total: number;
}

const statusStyles: Record<string, string> = {
  active: "bg-green-500/10 text-green-400",
  enrolled: "bg-blue-500/10 text-blue-400",
  graduated: "bg-purple-500/10 text-purple-400",
  withdrawn: "bg-red-500/10 text-red-400",
  loa: "bg-yellow-500/10 text-yellow-400",
};

export function StudentRosterTable({ students, total }: StudentRosterTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-medium">Student Roster</CardTitle>
          <p className="text-sm text-brand-muted">{total} total students</p>
        </div>
        <Link href="/admin/students">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-sm text-brand-muted text-center py-6">
            No students found
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs font-medium text-brand-muted uppercase tracking-wider py-3 px-2">
                    Student
                  </th>
                  <th className="text-left text-xs font-medium text-brand-muted uppercase tracking-wider py-3 px-2">
                    Program
                  </th>
                  <th className="text-left text-xs font-medium text-brand-muted uppercase tracking-wider py-3 px-2">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-brand-muted uppercase tracking-wider py-3 px-2">
                    Progress
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.map((student) => {
                  const program = getRelation(student.program);
                  const campus = getRelation(student.campus);
                  const progress = program?.total_hours
                    ? (student.total_hours_completed / program.total_hours) * 100
                    : 0;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <div>
                          <p className="text-sm font-medium text-brand-text">
                            {student.first_name} {student.last_name}
                          </p>
                          <p className="text-xs text-brand-muted font-mono">
                            {student.student_number}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <p className="text-sm text-brand-text">
                          {program?.name || "N/A"}
                        </p>
                        <p className="text-xs text-brand-muted">
                          {campus?.name || "N/A"}
                        </p>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize",
                            statusStyles[student.status] || "bg-gray-500/10 text-gray-400"
                          )}
                        >
                          {student.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="w-full max-w-[120px]">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-brand-muted">
                              {student.total_hours_completed.toFixed(0)} hrs
                            </span>
                            <span className="text-brand-text">
                              {progress.toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-brand-bg rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand-accent rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
