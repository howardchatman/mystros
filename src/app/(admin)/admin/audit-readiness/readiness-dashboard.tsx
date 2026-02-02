"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Search, Download, FileArchive, ArrowUpDown } from "lucide-react";
import { getAuditReadinessData, generateSchoolAuditPacket } from "@/lib/actions/audit-readiness";
import type { StudentReadiness } from "@/lib/actions/audit-readiness";
import { AuditPacketGenerator } from "./audit-packet-generator";

interface ReadinessDashboardProps {
  initialStudents: StudentReadiness[];
  campuses: { id: string; name: string }[];
  programs: { id: string; name: string }[];
}

type SortField = "name" | "score" | "docs" | "hours" | "sap";
type SortDir = "asc" | "desc";

export function ReadinessDashboard({ initialStudents, campuses, programs }: ReadinessDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [campusId, setCampusId] = useState("");
  const [programId, setProgramId] = useState("");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showFB(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  }

  const applyFilters = () => {
    startTransition(async () => {
      const result = await getAuditReadinessData({
        campusId: campusId || undefined,
        programId: programId || undefined,
      });
      if (result.error) {
        showFB("error", result.error);
      } else if (result.data) {
        setStudents(result.data.students);
      }
    });
  };

  const handleSchoolPacket = () => {
    startTransition(async () => {
      const result = await generateSchoolAuditPacket({
        campusId: campusId || undefined,
        programId: programId || undefined,
      });
      if (result.error) {
        showFB("error", result.error);
        return;
      }
      if (result.data) {
        // Download each file
        Object.entries(result.data.files).forEach(([filename, csv]) => {
          const blob = new Blob([csv], { type: "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename.replace(".csv", "")}-${new Date().toISOString().split("T")[0]}.csv`;
          a.click();
          URL.revokeObjectURL(url);
        });
        showFB("success", "School audit packet downloaded");
      }
    });
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  // Filter by search text
  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.studentNumber.toLowerCase().includes(q)
    );
  });

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case "name":
        cmp = a.lastName.localeCompare(b.lastName);
        break;
      case "score":
        cmp = a.overallScore - b.overallScore;
        break;
      case "docs":
        cmp = a.docs.approved - b.docs.approved;
        break;
      case "hours":
        cmp = a.hours.actual - b.hours.actual;
        break;
      case "sap":
        cmp = a.sapScore - b.sapScore;
        break;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  function scoreColor(score: number) {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  }

  function sapBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
    if (status === "satisfactory") return "default";
    if (status === "warning") return "outline";
    return "destructive";
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <CardTitle>Student Readiness</CardTitle>
          <Button size="sm" variant="outline" onClick={handleSchoolPacket} disabled={isPending}>
            <FileArchive className="w-4 h-4 mr-1" /> Export School Packet
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {feedback && (
          <div
            className={`rounded-md px-3 py-2 text-sm mb-4 ${
              feedback.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Search</label>
              <Input
                placeholder="Name or student number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Campus</label>
              <select
                value={campusId}
                onChange={(e) => setCampusId(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="">All Campuses</option>
                {campuses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Program</label>
              <select
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                <option value="">All Programs</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button size="sm" onClick={applyFilters} disabled={isPending}>
                <Search className="w-4 h-4 mr-1" /> Apply
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th
                  className="text-left py-3 px-4 text-xs font-medium text-muted-foreground cursor-pointer select-none"
                  onClick={() => toggleSort("name")}
                >
                  <span className="inline-flex items-center gap-1">Student <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Program</th>
                <th
                  className="text-left py-3 px-4 text-xs font-medium text-muted-foreground cursor-pointer select-none"
                  onClick={() => toggleSort("score")}
                >
                  <span className="inline-flex items-center gap-1">Readiness <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-medium text-muted-foreground cursor-pointer select-none"
                  onClick={() => toggleSort("docs")}
                >
                  <span className="inline-flex items-center gap-1">Documents <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-medium text-muted-foreground cursor-pointer select-none"
                  onClick={() => toggleSort("hours")}
                >
                  <span className="inline-flex items-center gap-1">Hours <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th
                  className="text-left py-3 px-4 text-xs font-medium text-muted-foreground cursor-pointer select-none"
                  onClick={() => toggleSort("sap")}
                >
                  <span className="inline-flex items-center gap-1">SAP <ArrowUpDown className="w-3 h-3" /></span>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Financial</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-muted-foreground">Packet</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-muted-foreground">
                    No students found.
                  </td>
                </tr>
              ) : (
                sorted.map((s) => (
                  <tr key={s.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground text-sm">{s.firstName} {s.lastName}</p>
                      <p className="text-xs text-muted-foreground font-mono">{s.studentNumber}</p>
                    </td>
                    <td className="py-3 px-4 text-sm">{s.program}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Progress value={s.overallScore} className="h-2 w-16" />
                        <span className={`text-sm font-bold ${scoreColor(s.overallScore)}`}>
                          {s.overallScore}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs space-y-0.5">
                        <span className="text-green-500 font-medium">{s.docs.approved}</span>
                        <span className="text-muted-foreground">/{s.docs.required}</span>
                        {s.docs.missing > 0 && (
                          <span className="text-red-500 ml-1">({s.docs.missing} missing)</span>
                        )}
                        {s.docs.expired > 0 && (
                          <span className="text-yellow-500 ml-1">({s.docs.expired} expired)</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs">
                        <span className="font-medium text-foreground">{s.hours.actual.toLocaleString()}</span>
                        <span className="text-muted-foreground">/{s.hours.programTotal.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={sapBadgeVariant(s.sap.status)} className="capitalize text-xs">
                        {s.sap.status.replace(/_/g, " ")}
                      </Badge>
                      {s.sap.isOverdue && (
                        <p className="text-[10px] text-red-500 mt-0.5">Eval overdue</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {s.financial.verificationRequired ? (
                        <Badge
                          variant={s.financial.verificationComplete ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {s.financial.verificationComplete ? "Verified" : "Pending"}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <AuditPacketGenerator studentId={s.id} studentNumber={s.studentNumber} />
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
