"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, DollarSign, TrendingUp, FileText } from "lucide-react";
import { ReportFilters } from "./report-filters";
import { BarChart } from "./bar-chart";
import { CsvExport } from "./csv-export";
import {
  getEnrollmentReport,
  getAttendanceReport,
  getFinancialReport,
  getApplicationsReport,
  getSapReport,
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
}

function fmt(amount: number) {
  return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function ReportDashboard({
  campuses, initialEnrollment, initialAttendance, initialFinancial, initialApplications, initialSap,
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

  const applyFilters = () => {
    const filters = {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      campusId: campusId || undefined,
    };
    startTransition(async () => {
      const [enr, att, fin, app, sapRes] = await Promise.all([
        getEnrollmentReport(filters),
        getAttendanceReport(filters),
        getFinancialReport(filters),
        getApplicationsReport(filters),
        getSapReport(filters),
      ]);
      if (enr.data) setEnrollment(enr.data);
      if (att.data) setAttendance(att.data);
      if (fin.data) setFinancial(fin.data);
      if (app.data) setApplications(app.data);
      if (sapRes.data) setSap(sapRes.data);
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
    </div>
  );
}
