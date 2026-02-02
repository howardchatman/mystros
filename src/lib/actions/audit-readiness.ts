"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/actions/audit";

// ─── Types ───────────────────────────────────────────────

export interface ReadinessFilters {
  campusId?: string;
  programId?: string;
}

export interface StudentReadiness {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  program: string;
  campus: string;
  overallScore: number;
  documentScore: number;
  attendanceScore: number;
  sapScore: number;
  financialScore: number;
  docs: { required: number; approved: number; pending: number; missing: number; expired: number };
  hours: { actual: number; expected: number; programTotal: number };
  sap: { status: string; lastEvalDate: string | null; isOverdue: boolean };
  financial: { verificationRequired: boolean; verificationComplete: boolean; status: string };
}

export interface ReadinessData {
  students: StudentReadiness[];
  summary: { total: number; ready: number; attention: number; critical: number };
}

// ─── Get Audit Readiness Data ────────────────────────────

export async function getAuditReadinessData(
  filters?: ReadinessFilters
): Promise<{ data?: ReadinessData; error?: string }> {
  const supabase = await createClient();

  // 1. Get required document types
  const { data: requiredDocTypes } = await supabase
    .from("document_types")
    .select("id")
    .eq("is_required", true)
    .eq("is_active", true);
  const requiredCount = requiredDocTypes?.length || 0;

  // 2. Get active/enrolled students
  let studentQuery = supabase
    .from("students")
    .select(`
      id,
      student_number,
      first_name,
      last_name,
      start_date,
      total_hours_completed,
      current_sap_status,
      program_id,
      campus_id,
      program:programs(id, name, total_hours, duration_weeks),
      campus:campuses(name)
    `)
    .in("status", ["active", "enrolled"])
    .order("last_name");

  if (filters?.campusId) studentQuery = studentQuery.eq("campus_id", filters.campusId);
  if (filters?.programId) studentQuery = studentQuery.eq("program_id", filters.programId);

  const { data: students, error } = await studentQuery;
  if (error) return { error: error.message };

  // 3. Batch fetch all documents for these students
  const studentIds = (students || []).map((s) => s.id);
  if (studentIds.length === 0) {
    return { data: { students: [], summary: { total: 0, ready: 0, attention: 0, critical: 0 } } };
  }

  const [
    { data: allDocs },
    { data: allSapEvals },
    { data: allFinAid },
    { data: allSapConfigs },
  ] = await Promise.all([
    supabase
      .from("documents")
      .select("student_id, document_type_id, status, expires_at")
      .in("student_id", studentIds),
    supabase
      .from("sap_evaluations")
      .select("student_id, evaluation_date, hours_completed")
      .in("student_id", studentIds)
      .order("evaluation_date", { ascending: false }),
    supabase
      .from("financial_aid_records")
      .select("student_id, verification_required, verification_status, status")
      .in("student_id", studentIds)
      .order("academic_year", { ascending: false }),
    supabase
      .from("sap_configurations")
      .select("program_id, evaluation_interval_hours")
      .eq("is_active", true),
  ]);

  const docsMap = new Map<string, typeof allDocs>();
  (allDocs || []).forEach((d) => {
    const arr = docsMap.get(d.student_id) || [];
    arr.push(d);
    docsMap.set(d.student_id, arr);
  });

  // For SAP evals, only keep the most recent per student
  const sapEvalMap = new Map<string, { evaluation_date: string; hours_completed: number }>();
  (allSapEvals || []).forEach((e) => {
    if (!sapEvalMap.has(e.student_id)) {
      sapEvalMap.set(e.student_id, { evaluation_date: e.evaluation_date, hours_completed: e.hours_completed || 0 });
    }
  });

  // For financial aid, only keep the most recent per student
  const finAidMap = new Map<string, { verification_required: boolean; verification_status: string | null; status: string }>();
  (allFinAid || []).forEach((f) => {
    if (!finAidMap.has(f.student_id)) {
      finAidMap.set(f.student_id, {
        verification_required: f.verification_required || false,
        verification_status: f.verification_status,
        status: f.status,
      });
    }
  });

  const sapConfigMap = new Map<string, number>();
  (allSapConfigs || []).forEach((c) => {
    sapConfigMap.set(c.program_id, c.evaluation_interval_hours);
  });

  const now = Date.now();

  // 4. Calculate readiness per student
  const readinessStudents: StudentReadiness[] = (students || []).map((student) => {
    const program = Array.isArray(student.program) ? student.program[0] : student.program;
    const campus = Array.isArray(student.campus) ? student.campus[0] : student.campus;
    const programName = program?.name || "Unknown";
    const campusName = campus?.name || "Unknown";
    const programTotal = program?.total_hours || 1500;
    const durationWeeks = program?.duration_weeks || 52;

    // ── Document Score (40%) ──
    const studentDocs = docsMap.get(student.id) || [];
    const approvedNotExpired = studentDocs.filter(
      (d) => d.status === "approved" && (!d.expires_at || new Date(d.expires_at).getTime() > now)
    ).length;
    const pendingDocs = studentDocs.filter((d) =>
      ["uploaded", "under_review"].includes(d.status || "")
    ).length;
    const expiredDocs = studentDocs.filter(
      (d) => d.status === "approved" && d.expires_at && new Date(d.expires_at).getTime() <= now
    ).length;
    const missingDocs = Math.max(0, requiredCount - studentDocs.length);
    const docPct = requiredCount > 0 ? (approvedNotExpired / requiredCount) * 100 : 100;
    const documentScore = Math.round(Math.min(100, docPct) * 0.4);

    // ── Attendance Score (20%) ──
    const startDate = student.start_date ? new Date(student.start_date).getTime() : now;
    const daysSinceStart = Math.max(1, Math.floor((now - startDate) / (1000 * 60 * 60 * 24)));
    const avgHoursPerDay = programTotal / (durationWeeks * 5);
    const expectedHours = Math.min(daysSinceStart * avgHoursPerDay, programTotal);
    const actualHours = student.total_hours_completed || 0;
    const hoursPct = expectedHours > 0 ? (actualHours / expectedHours) * 100 : 100;
    const attendanceScore = Math.round(Math.min(100, hoursPct) * 0.2);

    // ── SAP Score (20%) ──
    const sapStatus = student.current_sap_status || "satisfactory";
    let sapBase = 100;
    if (sapStatus === "warning") sapBase = 75;
    else if (sapStatus === "probation" || sapStatus === "appeal_approved" || sapStatus === "appeal_pending") sapBase = 50;
    else if (sapStatus === "suspension" || sapStatus === "appeal_denied") sapBase = 0;

    const lastEval = sapEvalMap.get(student.id);
    const interval = sapConfigMap.get(student.program_id) || 450;
    const lastEvalHours = lastEval?.hours_completed || 0;
    const isOverdue = actualHours - lastEvalHours >= interval;
    if (isOverdue) sapBase = Math.max(0, sapBase - 15);
    const sapScore = Math.round(sapBase * 0.2);

    // ── Financial Score (20%) ──
    const finAid = finAidMap.get(student.id);
    let finBase = 100;
    if (finAid?.verification_required) {
      if (finAid.verification_status === "complete") finBase = 100;
      else if (finAid.verification_status === "in_progress") finBase = 50;
      else finBase = 0;
    }
    const financialScore = Math.round(finBase * 0.2);

    const overallScore = documentScore + attendanceScore + sapScore + financialScore;

    return {
      id: student.id,
      studentNumber: student.student_number,
      firstName: student.first_name,
      lastName: student.last_name,
      program: programName,
      campus: campusName,
      overallScore,
      documentScore,
      attendanceScore,
      sapScore,
      financialScore,
      docs: {
        required: requiredCount,
        approved: approvedNotExpired,
        pending: pendingDocs,
        missing: missingDocs,
        expired: expiredDocs,
      },
      hours: {
        actual: Math.round(actualHours),
        expected: Math.round(expectedHours),
        programTotal,
      },
      sap: {
        status: sapStatus,
        lastEvalDate: lastEval?.evaluation_date || null,
        isOverdue,
      },
      financial: {
        verificationRequired: finAid?.verification_required || false,
        verificationComplete: finAid?.verification_status === "complete",
        status: finAid?.status || "n/a",
      },
    };
  });

  const ready = readinessStudents.filter((s) => s.overallScore >= 90).length;
  const attention = readinessStudents.filter((s) => s.overallScore >= 70 && s.overallScore < 90).length;
  const critical = readinessStudents.filter((s) => s.overallScore < 70).length;

  return {
    data: {
      students: readinessStudents,
      summary: { total: readinessStudents.length, ready, attention, critical },
    },
  };
}

// ─── Generate Student Audit Packet ───────────────────────

function csvRow(cells: (string | number | boolean | null | undefined)[]): string {
  return cells.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",");
}

export async function generateStudentAuditPacket(studentId: string) {
  const supabase = await createClient();

  // Fetch all data in parallel
  const [
    { data: student },
    { data: docs },
    { data: attendance },
    { data: sapEvals },
    { data: account },
    { data: charges },
    { data: payments },
    { data: disbursements },
    { data: auditLogs },
  ] = await Promise.all([
    supabase
      .from("students")
      .select(`
        *,
        campus:campuses(name, code, city, state),
        program:programs(name, code, total_hours),
        schedule:program_schedules(name, hours_per_week)
      `)
      .eq("id", studentId)
      .single(),
    supabase
      .from("documents")
      .select("*, document_type:document_types(name, category, is_required)")
      .eq("student_id", studentId)
      .order("created_at", { ascending: false }),
    supabase
      .from("attendance_records")
      .select("attendance_date, status, scheduled_hours, actual_hours, theory_hours, practical_hours, clock_in_time, clock_out_time")
      .eq("student_id", studentId)
      .order("attendance_date", { ascending: false }),
    supabase
      .from("sap_evaluations")
      .select("evaluation_date, evaluation_point, status, hours_attempted, hours_completed, completion_rate, is_within_max_timeframe")
      .eq("student_id", studentId)
      .order("evaluation_date", { ascending: false }),
    supabase
      .from("student_accounts")
      .select("total_charges, total_payments, total_aid_posted, current_balance")
      .eq("student_id", studentId)
      .single(),
    supabase
      .from("charges")
      .select("charge_date, charge_type, description, amount, is_voided")
      .eq("student_id", studentId)
      .order("charge_date", { ascending: false }),
    supabase
      .from("payments")
      .select("payment_date, amount, payment_method, status, is_refund")
      .eq("student_id", studentId)
      .order("payment_date", { ascending: false }),
    supabase
      .from("disbursements")
      .select("disbursement_number, scheduled_date, scheduled_amount, actual_date, actual_amount, status")
      .eq("student_id", studentId)
      .order("scheduled_date", { ascending: false }),
    supabase
      .from("audit_log")
      .select("created_at, user_email, action, table_name, changed_fields")
      .eq("record_id", studentId)
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  if (!student) return { error: "Student not found" };

  const prog = Array.isArray(student.program) ? student.program[0] : student.program;
  const camp = Array.isArray(student.campus) ? student.campus[0] : student.campus;
  const sched = Array.isArray(student.schedule) ? student.schedule[0] : student.schedule;

  // 1. Student Info CSV
  const studentInfoCsv = [
    csvRow(["Field", "Value"]),
    csvRow(["Student Number", student.student_number]),
    csvRow(["First Name", student.first_name]),
    csvRow(["Last Name", student.last_name]),
    csvRow(["Email", student.email]),
    csvRow(["Phone", student.phone]),
    csvRow(["Date of Birth", student.date_of_birth]),
    csvRow(["Status", student.status]),
    csvRow(["Program", prog?.name]),
    csvRow(["Campus", camp?.name]),
    csvRow(["Schedule", sched?.name]),
    csvRow(["Enrollment Date", student.enrollment_date]),
    csvRow(["Start Date", student.start_date]),
    csvRow(["Expected Graduation", student.expected_graduation_date]),
    csvRow(["Actual Graduation", student.actual_graduation_date]),
    csvRow(["Total Hours Completed", student.total_hours_completed]),
    csvRow(["Theory Hours", student.theory_hours_completed]),
    csvRow(["Practical Hours", student.practical_hours_completed]),
    csvRow(["Program Total Hours", prog?.total_hours]),
    csvRow(["SAP Status", student.current_sap_status]),
    csvRow(["Transfer Student", student.is_transfer_student]),
    csvRow(["Transfer Hours", student.transfer_hours_accepted]),
  ].join("\n");

  // 2. Documents CSV
  const documentsCsv = [
    csvRow(["Document Type", "Category", "Required", "File Name", "Status", "Uploaded", "Reviewed", "Expires"]),
    ...(docs || []).map((d) => {
      const dt = Array.isArray(d.document_type) ? d.document_type[0] : d.document_type;
      return csvRow([
        dt?.name, dt?.category, dt?.is_required ? "Yes" : "No",
        d.file_name, d.status, d.created_at, d.reviewed_at, d.expires_at,
      ]);
    }),
  ].join("\n");

  // 3. Attendance CSV
  const attendanceCsv = [
    csvRow(["Date", "Status", "Clock In", "Clock Out", "Scheduled Hours", "Actual Hours", "Theory", "Practical"]),
    ...(attendance || []).map((a) =>
      csvRow([a.attendance_date, a.status, a.clock_in_time, a.clock_out_time, a.scheduled_hours, a.actual_hours, a.theory_hours, a.practical_hours])
    ),
  ].join("\n");

  // 4. SAP CSV
  const sapCsv = [
    csvRow(["Evaluation Date", "Evaluation Point", "Status", "Hours Attempted", "Hours Completed", "Completion Rate %", "Within Timeframe"]),
    ...(sapEvals || []).map((e) =>
      csvRow([e.evaluation_date, e.evaluation_point, e.status, e.hours_attempted, e.hours_completed, e.completion_rate, e.is_within_max_timeframe ? "Yes" : "No"])
    ),
  ].join("\n");

  // 5. Financial CSV
  const financialCsv = [
    csvRow(["ACCOUNT SUMMARY", ""]),
    csvRow(["Total Charges", account?.total_charges || 0]),
    csvRow(["Total Payments", account?.total_payments || 0]),
    csvRow(["Total Aid Posted", account?.total_aid_posted || 0]),
    csvRow(["Current Balance", account?.current_balance || 0]),
    "",
    csvRow(["CHARGES", "", "", ""]),
    csvRow(["Date", "Type", "Description", "Amount", "Voided"]),
    ...(charges || []).map((c) => csvRow([c.charge_date, c.charge_type, c.description, c.amount, c.is_voided ? "Yes" : "No"])),
    "",
    csvRow(["PAYMENTS", "", "", ""]),
    csvRow(["Date", "Amount", "Method", "Status", "Refund"]),
    ...(payments || []).map((p) => csvRow([p.payment_date, p.amount, p.payment_method, p.status, p.is_refund ? "Yes" : "No"])),
    "",
    csvRow(["DISBURSEMENTS", "", "", "", ""]),
    csvRow(["#", "Scheduled Date", "Scheduled Amount", "Actual Date", "Actual Amount", "Status"]),
    ...(disbursements || []).map((d) => csvRow([d.disbursement_number, d.scheduled_date, d.scheduled_amount, d.actual_date, d.actual_amount, d.status])),
  ].join("\n");

  // 6. Audit Log CSV
  const auditLogCsv = [
    csvRow(["Date", "User", "Action", "Table", "Changed Fields"]),
    ...(auditLogs || []).map((l) =>
      csvRow([new Date(l.created_at).toLocaleString(), l.user_email || "System", l.action, l.table_name, l.changed_fields?.join(", ")])
    ),
  ].join("\n");

  // Log the export
  logAudit({
    table_name: "students",
    record_id: studentId,
    action: "export",
    new_data: { export_type: "audit_packet", student_number: student.student_number },
  }).catch(() => {});

  return {
    data: {
      studentNumber: student.student_number,
      studentName: `${student.first_name} ${student.last_name}`,
      files: {
        "student-info.csv": studentInfoCsv,
        "documents.csv": documentsCsv,
        "attendance.csv": attendanceCsv,
        "sap-evaluations.csv": sapCsv,
        "financial-summary.csv": financialCsv,
        "audit-log.csv": auditLogCsv,
      },
    },
  };
}

// ─── Generate School-Wide Audit Packet ───────────────────

export async function generateSchoolAuditPacket(filters?: ReadinessFilters) {
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select(`
      id, student_number, first_name, last_name, email, phone, date_of_birth,
      status, enrollment_date, start_date, expected_graduation_date, actual_graduation_date,
      total_hours_completed, theory_hours_completed, practical_hours_completed,
      current_sap_status, is_transfer_student, transfer_hours_accepted,
      program:programs(name, code, total_hours),
      campus:campuses(name, code)
    `)
    .in("status", ["active", "enrolled"])
    .order("last_name");

  if (filters?.campusId) query = query.eq("campus_id", filters.campusId);
  if (filters?.programId) query = query.eq("program_id", filters.programId);

  const { data: students, error } = await query;
  if (error) return { error: error.message };

  // Build a roster CSV
  const rosterCsv = [
    csvRow(["Student Number", "First Name", "Last Name", "Email", "Phone", "DOB", "Status", "Program", "Campus",
      "Enrollment Date", "Start Date", "Expected Graduation", "Hours Completed", "Theory Hours", "Practical Hours",
      "SAP Status", "Transfer Student", "Transfer Hours"]),
    ...(students || []).map((s) => {
      const prog = Array.isArray(s.program) ? s.program[0] : s.program;
      const camp = Array.isArray(s.campus) ? s.campus[0] : s.campus;
      return csvRow([
        s.student_number, s.first_name, s.last_name, s.email, s.phone, s.date_of_birth,
        s.status, prog?.name, camp?.name, s.enrollment_date, s.start_date,
        s.expected_graduation_date, s.total_hours_completed, s.theory_hours_completed,
        s.practical_hours_completed, s.current_sap_status,
        s.is_transfer_student ? "Yes" : "No", s.transfer_hours_accepted,
      ]);
    }),
  ].join("\n");

  // Get readiness data for summary
  const readiness = await getAuditReadinessData(filters);
  const readinessCsv = [
    csvRow(["Student Number", "Name", "Program", "Overall Score", "Document Score", "Attendance Score", "SAP Score", "Financial Score",
      "Docs Required", "Docs Approved", "Docs Missing", "Docs Expired",
      "Hours Actual", "Hours Expected", "SAP Status", "SAP Overdue",
      "Verification Required", "Verification Complete"]),
    ...(readiness.data?.students || []).map((s) =>
      csvRow([
        s.studentNumber, `${s.firstName} ${s.lastName}`, s.program,
        s.overallScore, s.documentScore, s.attendanceScore, s.sapScore, s.financialScore,
        s.docs.required, s.docs.approved, s.docs.missing, s.docs.expired,
        s.hours.actual, s.hours.expected, s.sap.status, s.sap.isOverdue ? "Yes" : "No",
        s.financial.verificationRequired ? "Yes" : "No", s.financial.verificationComplete ? "Yes" : "No",
      ])
    ),
  ].join("\n");

  logAudit({
    table_name: "students",
    record_id: "school-wide",
    action: "export",
    new_data: { export_type: "school_audit_packet", student_count: students?.length },
  }).catch(() => {});

  return {
    data: {
      files: {
        "student-roster.csv": rosterCsv,
        "audit-readiness-summary.csv": readinessCsv,
      },
    },
  };
}
