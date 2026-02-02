"use server";

import { createClient } from "@/lib/supabase/server";
import { logAudit } from "@/lib/actions/audit";

export interface ImportError {
  row: number;
  field?: string;
  error: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: ImportError[];
}

// ─── Student Import ─────────────────────────────────────────────

interface StudentRow {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  program_code: string;
  campus_code: string;
  student_number?: string;
  enrollment_date?: string;
  status?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VALID_STUDENT_STATUSES = ["enrolled", "active", "withdrawn", "graduated", "suspended", "dismissed"];

export async function importStudents(rows: StudentRow[]): Promise<ImportResult> {
  const supabase = await createClient();
  const errors: ImportError[] = [];
  let imported = 0;

  // Pre-fetch lookups
  const { data: programs } = await supabase.from("programs").select("id, code").eq("is_active", true);
  const { data: campuses } = await supabase.from("campuses").select("id, code").eq("is_active", true);
  const { data: existingStudents } = await supabase.from("students").select("email, student_number");

  const programMap = new Map((programs || []).map((p) => [p.code.toLowerCase(), p.id]));
  const campusMap = new Map((campuses || []).map((c) => [c.code.toLowerCase(), c.id]));
  const existingEmails = new Set((existingStudents || []).map((s) => s.email?.toLowerCase()));
  const existingNumbers = new Set((existingStudents || []).map((s) => s.student_number?.toLowerCase()));

  // Get next student number sequence
  const { count: studentCount } = await supabase.from("students").select("id", { count: "exact" });
  let sequence = (studentCount || 0) + 1;
  const year = new Date().getFullYear().toString().slice(-2);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const rowNum = i + 2; // 1-indexed + header row

    // Validate required fields
    if (!row.first_name?.trim()) {
      errors.push({ row: rowNum, field: "first_name", error: "First name is required" });
      continue;
    }
    if (!row.last_name?.trim()) {
      errors.push({ row: rowNum, field: "last_name", error: "Last name is required" });
      continue;
    }
    if (!row.email?.trim() || !EMAIL_RE.test(row.email)) {
      errors.push({ row: rowNum, field: "email", error: "Valid email is required" });
      continue;
    }
    if (!row.program_code?.trim()) {
      errors.push({ row: rowNum, field: "program_code", error: "Program code is required" });
      continue;
    }
    if (!row.campus_code?.trim()) {
      errors.push({ row: rowNum, field: "campus_code", error: "Campus code is required" });
      continue;
    }

    // Validate foreign keys
    const programId = programMap.get(row.program_code.trim().toLowerCase());
    if (!programId) {
      errors.push({ row: rowNum, field: "program_code", error: `Program "${row.program_code}" not found` });
      continue;
    }

    const campusId = campusMap.get(row.campus_code.trim().toLowerCase());
    if (!campusId) {
      errors.push({ row: rowNum, field: "campus_code", error: `Campus "${row.campus_code}" not found` });
      continue;
    }

    // Check duplicate email
    if (existingEmails.has(row.email.trim().toLowerCase())) {
      errors.push({ row: rowNum, field: "email", error: `Email "${row.email}" already exists` });
      continue;
    }

    // Check duplicate student number
    if (row.student_number && existingNumbers.has(row.student_number.trim().toLowerCase())) {
      errors.push({ row: rowNum, field: "student_number", error: `Student number "${row.student_number}" already exists` });
      continue;
    }

    // Validate status
    const status = row.status?.trim().toLowerCase() || "enrolled";
    if (!VALID_STUDENT_STATUSES.includes(status)) {
      errors.push({ row: rowNum, field: "status", error: `Invalid status "${row.status}". Valid: ${VALID_STUDENT_STATUSES.join(", ")}` });
      continue;
    }

    // Generate student number if not provided
    const studentNumber = row.student_number?.trim() || `MBA${year}${String(sequence).padStart(4, "0")}`;

    const enrollmentDate = row.enrollment_date?.trim() || new Date().toISOString().split("T")[0];

    const { data: student, error: insertError } = await supabase
      .from("students")
      .insert({
        first_name: row.first_name.trim(),
        last_name: row.last_name.trim(),
        email: row.email.trim().toLowerCase(),
        phone: row.phone?.trim() || null,
        program_id: programId,
        campus_id: campusId,
        student_number: studentNumber,
        enrollment_date: enrollmentDate,
        start_date: enrollmentDate,
        status: status as any,
      })
      .select("id")
      .single();

    if (insertError) {
      errors.push({ row: rowNum, error: insertError.message });
      continue;
    }

    // Create student account
    await supabase.from("student_accounts").insert({
      student_id: student.id,
      total_charges: 0,
      total_payments: 0,
      total_aid_posted: 0,
      current_balance: 0,
    });

    logAudit({
      table_name: "students",
      record_id: student.id,
      action: "create",
      new_data: { student_number: studentNumber, source: "csv_import" },
    }).catch(() => {});

    existingEmails.add(row.email.trim().toLowerCase());
    existingNumbers.add(studentNumber.toLowerCase());
    sequence++;
    imported++;
  }

  return {
    success: errors.length === 0,
    imported,
    failed: errors.length,
    errors,
  };
}

// ─── Attendance Import ──────────────────────────────────────────

interface AttendanceRow {
  student_number: string;
  date: string;
  clock_in: string;
  clock_out: string;
  hours?: string;
  type?: string;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function importAttendance(rows: AttendanceRow[]): Promise<ImportResult> {
  const supabase = await createClient();
  const errors: ImportError[] = [];
  let imported = 0;

  const userId = (await supabase.auth.getUser()).data.user?.id ?? null;

  // Pre-fetch student lookup
  const { data: students } = await supabase
    .from("students")
    .select("id, student_number, campus_id, program:programs(total_hours, theory_hours, practical_hours)")
    .in("status", ["enrolled", "active"]);

  const studentMap = new Map(
    (students || []).map((s) => [s.student_number.toLowerCase(), s])
  );

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!;
    const rowNum = i + 2;

    if (!row.student_number?.trim()) {
      errors.push({ row: rowNum, field: "student_number", error: "Student number is required" });
      continue;
    }
    if (!row.date?.trim() || !DATE_RE.test(row.date.trim())) {
      errors.push({ row: rowNum, field: "date", error: "Date must be YYYY-MM-DD format" });
      continue;
    }
    if (!row.clock_in?.trim()) {
      errors.push({ row: rowNum, field: "clock_in", error: "Clock-in time is required" });
      continue;
    }
    if (!row.clock_out?.trim()) {
      errors.push({ row: rowNum, field: "clock_out", error: "Clock-out time is required" });
      continue;
    }

    const student = studentMap.get(row.student_number.trim().toLowerCase());
    if (!student) {
      errors.push({ row: rowNum, field: "student_number", error: `Student "${row.student_number}" not found or not active` });
      continue;
    }

    // Calculate hours
    const clockIn = `${row.date.trim()}T${row.clock_in.trim()}`;
    const clockOut = `${row.date.trim()}T${row.clock_out.trim()}`;
    const ms = new Date(clockOut).getTime() - new Date(clockIn).getTime();
    if (ms <= 0) {
      errors.push({ row: rowNum, error: "Clock-out must be after clock-in" });
      continue;
    }

    const actualHours = row.hours ? parseFloat(row.hours) : Math.round((ms / 3_600_000) * 100) / 100;
    if (isNaN(actualHours) || actualHours <= 0) {
      errors.push({ row: rowNum, field: "hours", error: "Invalid hours value" });
      continue;
    }

    // Calculate theory/practical split
    const program = student.program
      ? Array.isArray(student.program)
        ? (student.program as any[])[0]
        : student.program
      : null;

    let theoryHours: number;
    let practicalHours: number;

    if (row.type?.trim().toLowerCase() === "theory") {
      theoryHours = actualHours;
      practicalHours = 0;
    } else if (row.type?.trim().toLowerCase() === "practical") {
      theoryHours = 0;
      practicalHours = actualHours;
    } else {
      // Split based on program ratio
      const theoryPercent =
        program && program.total_hours > 0
          ? program.theory_hours / program.total_hours
          : 0.3;
      theoryHours = Math.round(actualHours * theoryPercent * 100) / 100;
      practicalHours = Math.round((actualHours - theoryHours) * 100) / 100;
    }

    const { data: record, error: insertError } = await supabase
      .from("attendance_records")
      .insert({
        student_id: student.id,
        campus_id: student.campus_id,
        attendance_date: row.date.trim(),
        clock_in_time: new Date(clockIn).toISOString(),
        clock_out_time: new Date(clockOut).toISOString(),
        actual_hours: actualHours,
        theory_hours: theoryHours,
        practical_hours: practicalHours,
        status: "present",
        is_correction: false,
        recorded_by: userId,
        approved_by: userId,
        approved_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (insertError) {
      errors.push({ row: rowNum, error: insertError.message });
      continue;
    }

    // Update student hour totals
    await supabase.rpc("increment_student_hours", {
      p_student_id: student.id,
      p_total: actualHours,
      p_theory: theoryHours,
      p_practical: practicalHours,
    }).then(null, async () => {
      // Fallback if RPC doesn't exist: manual update
      const { data: s } = await supabase
        .from("students")
        .select("total_hours_completed, theory_hours_completed, practical_hours_completed")
        .eq("id", student.id)
        .single();
      if (s) {
        await supabase
          .from("students")
          .update({
            total_hours_completed: (s.total_hours_completed || 0) + actualHours,
            theory_hours_completed: (s.theory_hours_completed || 0) + theoryHours,
            practical_hours_completed: (s.practical_hours_completed || 0) + practicalHours,
          })
          .eq("id", student.id);
      }
    });

    logAudit({
      table_name: "attendance_records",
      record_id: record.id,
      action: "create",
      new_data: { student_id: student.id, date: row.date, hours: actualHours, source: "csv_import" },
    }).catch(() => {});

    imported++;
  }

  return {
    success: errors.length === 0,
    imported,
    failed: errors.length,
    errors,
  };
}
