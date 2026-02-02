"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { getAuditLogs, exportAuditLogs } from "@/lib/actions/audit";
import type { AuditLogFilters } from "@/lib/actions/audit";

interface AuditLogEntry {
  id: string;
  table_name: string | null;
  record_id: string | null;
  action: string | null;
  user_email: string | null;
  user_role: string | null;
  changed_fields: string[] | null;
  created_at: string;
}

interface AuditLogViewerProps {
  initialLogs: AuditLogEntry[];
  initialTotal: number;
}

const actionOptions = [
  { value: "", label: "All Actions" },
  { value: "create", label: "Create" },
  { value: "update", label: "Update" },
  { value: "delete", label: "Delete" },
  { value: "status_change", label: "Status Change" },
  { value: "login", label: "Login" },
  { value: "export", label: "Export" },
];

const tableOptions = [
  { value: "", label: "All Tables" },
  { value: "students", label: "Students" },
  { value: "user_profiles", label: "User Profiles" },
  { value: "applications", label: "Applications" },
  { value: "financial_aid_records", label: "Financial Aid" },
  { value: "payments", label: "Payments" },
  { value: "attendance_records", label: "Attendance" },
  { value: "documents", label: "Documents" },
  { value: "program_schedules", label: "Schedules" },
  { value: "competency_records", label: "Competencies" },
];

export function AuditLogViewer({ initialLogs, initialTotal }: AuditLogViewerProps) {
  const [isPending, startTransition] = useTransition();
  const [logs, setLogs] = useState(initialLogs);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(Math.ceil(initialTotal / 50));

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [action, setAction] = useState("");
  const [tableName, setTableName] = useState("");

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showFB(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4000);
  }

  const applyFilters = (newPage = 1) => {
    const filters: AuditLogFilters = {
      search: search || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      action: action || undefined,
      tableName: tableName || undefined,
      page: newPage,
      limit: 50,
    };

    startTransition(async () => {
      const result = await getAuditLogs(filters);
      if (result.error) {
        showFB("error", result.error);
      } else if (result.data) {
        setLogs(result.data.logs);
        setTotal(result.data.total);
        setPage(result.data.page);
        setTotalPages(result.data.totalPages);
      }
    });
  };

  const handleExport = () => {
    const filters: AuditLogFilters = {
      search: search || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      action: action || undefined,
      tableName: tableName || undefined,
    };

    startTransition(async () => {
      const result = await exportAuditLogs(filters);
      if (result.error) {
        showFB("error", result.error);
      } else if (result.data) {
        const blob = new Blob([result.data], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        showFB("success", "Audit log exported");
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Audit Log</CardTitle>
          <Button size="sm" variant="outline" onClick={handleExport} disabled={isPending}>
            <Download className="w-4 h-4 mr-1" /> Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {feedback && (
          <div
            className={`rounded-md px-3 py-2 text-sm mb-4 ${
              feedback.type === "success"
                ? "bg-green-500/10 text-green-600"
                : "bg-red-500/10 text-red-600"
            }`}
          >
            {feedback.text}
          </div>
        )}

        {/* Filters */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Search</label>
              <Input
                placeholder="Email or Record ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-9"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Action</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                {actionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Table</label>
              <select
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
              >
                {tableOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <Button size="sm" onClick={() => applyFilters(1)} disabled={isPending}>
            <Search className="w-4 h-4 mr-1" /> Apply Filters
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto mb-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Date/Time</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Action</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Table</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Record ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-muted-foreground">Changes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-muted-foreground">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("en-US", {
                        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-sm font-medium text-foreground">{log.user_email || "System"}</p>
                      {log.user_role && (
                        <p className="text-xs text-muted-foreground capitalize">{log.user_role.replace(/_/g, " ")}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="capitalize text-xs">
                        {log.action?.replace(/_/g, " ") || "—"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm">{log.table_name || "—"}</td>
                    <td className="py-3 px-4 text-xs font-mono text-muted-foreground">
                      {log.record_id ? `${log.record_id.substring(0, 8)}...` : "—"}
                    </td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {log.changed_fields && log.changed_fields.length > 0
                        ? log.changed_fields.join(", ")
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {logs.length > 0 ? (page - 1) * 50 + 1 : 0} to{" "}
            {Math.min(page * 50, total)} of {total} entries
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyFilters(page - 1)}
              disabled={page <= 1 || isPending}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-foreground">
              Page {page} of {totalPages || 1}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => applyFilters(page + 1)}
              disabled={page >= totalPages || isPending}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
