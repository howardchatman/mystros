"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Clock, DollarSign, TrendingUp, FileText, GraduationCap, UserCheck } from "lucide-react";
import { ReportFilters } from "./report-filters";
import { BarChart } from "./bar-chart";
import { CsvExport } from "./csv-export";
import {
  getEnrollmentReport,
  getAttendanceReport,
  getFinancialReport,
  getApplicationsReport,
  getSapReport,
  getCompletionReport,
  getRetentionReport,
  getHoursReport,
} from "@/lib/actions/reports";

interface CampusOption {
  id: string;
  name: string;
}

interface ReportDashboardProps {
  campuses: CampusOption[];
  initialEnrollment: { total: number; statusCounts: Record<string, number>; totalHours: number };
  initialAttendance: { total: number; present: number; absent: number; tardy: number; totalHours: number; rate: number };
  initialFinancial: { totalCharges: number; totalPayments: number; totalAid: number; totalBalance: number; count: number };
  initialApplications: { total: number; statusCounts: Record<string, number> };
  initialSap: { total: number; sapCounts: Record<string, number>; totalHours: number };
  initialCompletion: { total: number; graduated: number; rate: number; byProgram: Record<string, any> };
  initialRetention: { total: number; retained: number; withdrawn: number; rate: number };
  initialHours: { totalScheduled: number; totalActual: number; variance: number; rate: number; recordCount: number };
}

function fmt(amount: number) {
  return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function ReportDashboard({
  campuses, initialEnrollment, initialAttendance, initialFinancial, initialApplications, initialSap,
  initialCompletion, initialRetention, initialHours,
}: ReportDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [campusId, setCampusId] = useState("");

  const [enrollment, setEnrollment] = useState(initialEnrollment);
  const [attendance, setAttendance] = useState(initialAttendance);
  const [financial, setFinancial] = useState(initialFinancial);
  const [applications, setApplications] = useState(initialApplications);
  const [sap, setSap] = useState(initialSap);
  const [completion, setCompletion] = useState(initialCompletion);
  const [retention, setRetention] = useState(initialRetention);
  const [hours, setHours] = useState(initialHours);

  const applyFilters = () => {
    const filters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      campusId: campusId || undefined,
    };
    startTransition(async () => {
      const [enr, att, fin, app, sapRes, compRes, retRes, hrsRes] = await Promise.all([
        getEnrollmentReport(filters),
        getAttendanceReport(filters),
        getFinancialReport(filters),
        getApplicationsReport(filters),
        getSapReport(filters),
        getCompletionReport(filters),
        getRetentionReport(filters),
        getHoursReport(filters),
      ]);
      if (enr.data) setEnrollment(enr.data);
      if (att.data) setAttendance(att.data);
      if (fin.data) setFinancial(fin.data);
      if (app.data) setApplications(app.data);
      if (sapRes.data) setSap(sapRes.data);
      if (compRes.data) setCompletion(compRes.data);
      if (retRes.data) setRetention(retRes.data);
      if (hrsRes.data) setHours(hrsRes.data);
    });
  };

  const enrollmentBars = [
    { label: "Active", value: enrollment.statusCounts["active"] || 0, color: "bg-green-500" },
    { label: "Enrolled", value: enrollment.statusCounts["enrolled"] || 0, color: "bg-blue-500" },
    { label: "Graduated", value: enrollment.statusCounts["graduated"] || 0, color: "bg-purple-500" },
    { label: "Withdrawn", value: enrollment.statusCounts["withdrawn"] || 0, color: "bg-red-500" },
    { label: "LOA", value: enrollment.statusCounts["loa"] || 0, color: "bg-yellow-500" },
  ];

  const sapBars = [
    { label: "Satisfactory", value: sap.sapCounts["satisfactory"] || 0, color: "bg-green-500" },
    { label: "Warning", value: sap.sapCounts["warning"] || 0, color: "bg-yellow-500" },
    { label: "Probation", value: sap.sapCounts["probation"] || 0, color: "bg-orange-500" },
    { label: "Suspension", value: sap.sapCounts["suspension"] || 0, color: "bg-red-500" },
  ];

  const appBars = [
    { label: "Draft", value: applications.statusCounts["draft"] || 0, color: "bg-gray-400" },
    { label: "Submitted", value: applications.statusCounts["submitted"] || 0, color: "bg-blue-500" },
    { label: "Under Review", value: applications.statusCounts["under_review"] || 0, color: "bg-yellow-500" },
    { label: "Accepted", value: applications.statusCounts["accepted"] || 0, color: "bg-green-500" },
    { label: "Denied", value: applications.statusCounts["denied"] || 0, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      <ReportFilters
        campuses={campuses}
        startDate={startDate}
        endDate={endDate}
        campusId={campusId}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onCampusChange={setCampusId}
        onApply={applyFilters}
        isPending={isPending}
      />

      {/* Enrollment */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" /> Enrollment Report</CardTitle>
          <CsvExport
            filename="enrollment-report"
            headers={["Status", "Count"]}
            rows={[...enrollmentBars.map((b) => [b.label, b.value]), ["Total", enrollment.total]]}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <BarChart data={enrollmentBars} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {enrollmentBars.map((b) => (
                <div key={b.label} className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{b.value}</p>
                  <p className="text-sm text-muted-foreground">{b.label}</p>
                </div>
              ))}
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">{enrollment.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SAP */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> SAP Report</CardTitle>
          <CsvExport
            filename="sap-report"
            headers={["Status", "Count"]}
            rows={[...sapBars.map((b) => [b.label, b.value]), ["Total Active Students", sap.total], ["Total Hours", sap.totalHours]]}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <BarChart data={sapBars} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {sapBars.map((b) => (
                <div key={b.label} className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{b.value}</p>
                  <p className="text-sm text-muted-foreground">{b.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 p-3 rounded-lg bg-muted/30 text-center">
            <p className="text-sm text-muted-foreground">Total Clock Hours (Active Students)</p>
            <p className="text-2xl font-bold text-foreground">{sap.totalHours.toLocaleString()} hours</p>
          </div>
        </CardContent>
      </Card>

      {/* Attendance */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Attendance Report</CardTitle>
          <CsvExport
            filename="attendance-report"
            headers={["Metric", "Value"]}
            rows={[
              ["Total Records", attendance.total],
              ["Present", attendance.present],
              ["Absent", attendance.absent],
              ["Tardy", attendance.tardy],
              ["Attendance Rate", `${attendance.rate}%`],
              ["Total Hours", attendance.totalHours],
            ]}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <BarChart data={[
                { label: "Present", value: attendance.present, color: "bg-green-500" },
                { label: "Absent", value: attendance.absent, color: "bg-red-500" },
                { label: "Tardy", value: attendance.tardy, color: "bg-yellow-500" },
              ]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Records", value: attendance.total },
                { label: "Present", value: attendance.present },
                { label: "Absent", value: attendance.absent },
                { label: "Tardy", value: attendance.tardy },
                { label: "Attendance Rate", value: `${attendance.rate}%` },
                { label: "Total Hours", value: attendance.totalHours.toLocaleString() },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><DollarSign className="w-5 h-5" /> Financial Summary</CardTitle>
          <CsvExport
            filename="financial-report"
            headers={["Metric", "Amount"]}
            rows={[
              ["Total Charges", fmt(financial.totalCharges)],
              ["Total Payments", fmt(financial.totalPayments)],
              ["Total Aid Applied", fmt(financial.totalAid)],
              ["Outstanding Balance", fmt(financial.totalBalance)],
              ["Account Count", financial.count],
            ]}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Total Charges", value: fmt(financial.totalCharges) },
              { label: "Total Payments", value: fmt(financial.totalPayments) },
              { label: "Total Aid Applied", value: fmt(financial.totalAid) },
              { label: "Outstanding Balance", value: fmt(financial.totalBalance) },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> Applications Report</CardTitle>
          <CsvExport
            filename="applications-report"
            headers={["Status", "Count"]}
            rows={[...appBars.map((b) => [b.label, b.value]), ["Total", applications.total]]}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <BarChart data={appBars} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {appBars.map((b) => (
                <div key={b.label} className="text-center p-3 rounded-lg bg-muted/30">
                  <p className="text-2xl font-bold text-foreground">{b.value}</p>
                  <p className="text-sm text-muted-foreground">{b.label}</p>
                </div>
              ))}
              <div className="text-center p-3 rounded-lg bg-muted/30">
                <p className="text-2xl font-bold text-foreground">{applications.total}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completion Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Completion Report</CardTitle>
          <CsvExport
            filename="completion-report"
            headers={["Metric", "Value"]}
            rows={[
              ["Total Students", completion.total],
              ["Graduated", completion.graduated],
              ["Completion Rate", `${completion.rate}%`],
              ...Object.entries(completion.byProgram).map(([prog, d]: [string, any]) => [prog, `${d.graduated}/${d.total} (${d.rate}%)`]),
            ]}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">{completion.total}</p>
              <p className="text-sm text-muted-foreground">Total Students</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-green-500">{completion.graduated}</p>
              <p className="text-sm text-muted-foreground">Graduated</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-blue-500">{completion.rate}%</p>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
          </div>
          {Object.keys(completion.byProgram).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">By Program</h4>
              {Object.entries(completion.byProgram).map(([program, data]: [string, any]) => (
                <div key={program} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="text-sm text-foreground">{program}</span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-muted-foreground">{data.graduated}/{data.total}</span>
                    <Badge variant={data.rate >= 75 ? "default" : data.rate >= 50 ? "secondary" : "destructive"}>
                      {data.rate}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retention Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><UserCheck className="w-5 h-5" /> Retention Report</CardTitle>
          <CsvExport
            filename="retention-report"
            headers={["Metric", "Value"]}
            rows={[
              ["Total Students", retention.total],
              ["Retained", retention.retained],
              ["Withdrawn", retention.withdrawn],
              ["Retention Rate", `${retention.rate}%`],
            ]}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">{retention.total}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-green-500">{retention.retained}</p>
              <p className="text-sm text-muted-foreground">Retained</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-red-500">{retention.withdrawn}</p>
              <p className="text-sm text-muted-foreground">Withdrawn</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-blue-500">{retention.rate}%</p>
              <p className="text-sm text-muted-foreground">Retention Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hours Report */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5" /> Hours Tracking Report</CardTitle>
          <CsvExport
            filename="hours-report"
            headers={["Metric", "Value"]}
            rows={[
              ["Scheduled Hours", hours.totalScheduled],
              ["Actual Hours", hours.totalActual],
              ["Variance", hours.variance],
              ["Completion Rate", `${hours.rate}%`],
              ["Records", hours.recordCount],
            ]}
          />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">{hours.totalScheduled.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Scheduled</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-blue-500">{hours.totalActual.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Actual</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className={`text-2xl font-bold ${hours.variance >= 0 ? "text-green-500" : "text-red-500"}`}>
                {hours.variance >= 0 ? "+" : ""}{hours.variance.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Variance</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-foreground">{hours.rate}%</p>
              <p className="text-sm text-muted-foreground">Rate</p>
            </div>
            <div className="text-center p-4 rounded-lg bg-muted/30">
              <p className="text-2xl font-bold text-muted-foreground">{hours.recordCount.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Records</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
