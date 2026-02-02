"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface Student {
  id: string;
  student_number: string;
  first_name: string;
  last_name: string;
  status: string;
  total_hours_completed: number | null;
  current_sap_status: string | null;
  program: { name: string } | null;
  campus: { name: string } | null;
}

interface StudentListProps {
  students: Student[];
  campuses: { id: string; name: string }[];
  programs: { id: string; name: string }[];
}

export function StudentList({ students, campuses, programs }: StudentListProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = students.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.student_number.toLowerCase().includes(q)
    );
  });

  function sapVariant(status: string | null): "default" | "outline" | "destructive" {
    if (!status || status === "satisfactory") return "default";
    if (status === "warning") return "outline";
    return "destructive";
  }

  function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
    if (status === "active" || status === "enrolled") return "default";
    if (status === "graduated") return "secondary";
    if (status === "loa") return "outline";
    return "destructive";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Students ({filtered.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Search</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Name or student number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-8"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="enrolled">Enrolled</option>
              <option value="graduated">Graduated</option>
              <option value="loa">Leave of Absence</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Student #</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Name</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Program</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Campus</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">SAP</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Hours</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-muted-foreground">
                    No students found.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-border hover:bg-muted/50 cursor-pointer"
                    onClick={() => router.push(`/admin/auditor/students/${s.id}`)}
                  >
                    <td className="py-3 px-4 text-sm font-mono">{s.student_number}</td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">
                      {s.first_name} {s.last_name}
                    </td>
                    <td className="py-3 px-4 text-sm">{s.program?.name || "—"}</td>
                    <td className="py-3 px-4 text-sm">{s.campus?.name || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusVariant(s.status)} className="capitalize text-xs">
                        {s.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={sapVariant(s.current_sap_status)} className="capitalize text-xs">
                        {(s.current_sap_status || "N/A").replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-medium">
                      {(s.total_hours_completed || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
