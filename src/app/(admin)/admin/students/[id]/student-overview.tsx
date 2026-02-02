"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Calendar,
  MapPin,
  GraduationCap,
  Clock,
  BookOpen,
  Wrench,
} from "lucide-react";

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-600 border-green-500/30",
  enrolled: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  graduated: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  withdrawn: "bg-red-500/10 text-red-600 border-red-500/30",
  loa: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30",
};

interface StudentOverviewProps {
  student: any;
}

export function StudentOverview({ student }: StudentOverviewProps) {
  const program = student.program
    ? Array.isArray(student.program)
      ? student.program[0]
      : student.program
    : null;
  const campus = student.campus
    ? Array.isArray(student.campus)
      ? student.campus[0]
      : student.campus
    : null;

  const totalHours = student.total_hours_completed || 0;
  const programHours = program?.total_hours || 0;
  const progress = programHours > 0 ? (totalHours / programHours) * 100 : 0;

  const sapStatusColors: Record<string, string> = {
    satisfactory: "bg-green-500/10 text-green-600",
    warning: "bg-yellow-500/10 text-yellow-600",
    probation: "bg-orange-500/10 text-orange-600",
    suspension: "bg-red-500/10 text-red-600",
  };

  return (
    <div className="space-y-6">
      {/* Info cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="w-4 h-4" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Name" value={`${student.first_name} ${student.last_name}`} />
            <InfoRow label="Student ID" value={student.student_number} mono />
            <InfoRow label="Email" value={student.email} />
            <InfoRow label="Phone" value={student.phone || "—"} />
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize border ${
                  statusColors[student.status] || "bg-gray-500/10 text-gray-600 border-gray-500/30"
                }`}
              >
                {student.status?.replace("_", " ")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">SAP Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  sapStatusColors[student.current_sap_status] || "bg-gray-500/10 text-gray-600"
                }`}
              >
                {student.current_sap_status?.replace("_", " ") || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Program Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="w-4 h-4" />
              Program & Enrollment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Program" value={program?.name || "N/A"} />
            <InfoRow label="Campus" value={campus?.name || "N/A"} />
            <InfoRow
              label="Enrolled"
              value={
                student.enrollment_date
                  ? new Date(student.enrollment_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <InfoRow
              label="Expected Completion"
              value={
                student.expected_completion_date
                  ? new Date(student.expected_completion_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "—"
              }
            />
            <InfoRow
              label="Program Hours"
              value={programHours > 0 ? `${programHours} hrs` : "N/A"}
            />
          </CardContent>
        </Card>
      </div>

      {/* Hours Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="w-4 h-4" />
            Hours Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Total Hours</span>
              <span className="text-sm text-muted-foreground">
                {totalHours.toFixed(1)} / {programHours} hrs ({progress.toFixed(0)}%)
              </span>
            </div>
            <Progress value={Math.min(progress, 100)} className="h-3" />
          </div>

          {/* Theory / Practical breakdown */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-foreground">Theory</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {(student.theory_hours_completed || 0).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">
                of {program?.theory_hours || 0} hrs
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-foreground">Practical</span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {(student.practical_hours_completed || 0).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">
                of {program?.practical_hours || 0} hrs
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );
}
