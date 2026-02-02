"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { StudentStatus } from "@/types/database";
import { notifyApplicationStatus } from "@/lib/actions/notifications";

export interface StudentFilters {
  status?: StudentStatus;
  campusId?: string;
  programId?: string;
  search?: string;
}

/**
 * Get all students with filtering and pagination
 */
export async function getStudents(
  filters: StudentFilters = {},
  limit = 25,
  offset = 0
) {
  const supabase = await createClient();

  let query = supabase
    .from("students")
    .select(
      `
      id,
      student_number,
      first_name,
      last_name,
      email,
      phone,
      status,
      enrollment_date,
      start_date,
      expected_graduation_date,
      total_hours_completed,
      current_sap_status,
      campus:campuses(id, name, code),
      program:programs(id, name, code, total_hours)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.campusId) {
    query = query.eq("campus_id", filters.campusId);
  }
  if (filters.programId) {
    query = query.eq("program_id", filters.programId);
  }
  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,student_number.ilike.%${filters.search}%`
    );
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching students:", error);
    return { students: [], total: 0, error: error.message };
  }

  return { students: data || [], total: count || 0 };
}

/**
 * Get a single student by ID with all related data
 */
export async function getStudentById(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("students")
    .select(
      `
      *,
      campus:campuses(*),
      program:programs(*),
      schedule:program_schedules(*),
      application:applications(*),
      account:student_accounts(*),
      documents:documents(
        id,
        file_name,
        status,
        created_at,
        document_type:document_types(name, code, category)
      ),
      attendance:attendance_records(
        id,
        attendance_date,
        status,
        actual_hours,
        theory_hours,
        practical_hours
      ),
      financial_aid:financial_aid_records(
        *,
        awards:financial_aid_awards(*)
      )
    `
    )
    .eq("id", studentId)
    .single();

  if (error) {
    console.error("Error fetching student:", error);
    return { student: null, error: error.message };
  }

  return { student: data };
}

/**
 * Update student status
 */
export async function updateStudentStatus(
  studentId: string,
  status: StudentStatus,
  reason?: string
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  // Set additional fields based on status
  if (status === "withdrawn") {
    updateData["withdrawal_date"] = new Date().toISOString().split("T")[0];
  } else if (status === "graduated") {
    updateData["actual_graduation_date"] = new Date().toISOString().split("T")[0];
  }

  const { error } = await supabase
    .from("students")
    .update(updateData)
    .eq("id", studentId);

  if (error) {
    console.error("Error updating student status:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/students");
  revalidatePath(`/admin/students/${studentId}`);
  return { success: true };
}

/**
 * Get all applications with filtering
 */
export async function getApplications(
  filters: {
    status?: StudentStatus;
    campusId?: string;
    submitted?: boolean;
  } = {},
  limit = 25,
  offset = 0
) {
  const supabase = await createClient();

  let query = supabase
    .from("applications")
    .select(
      `
      id,
      first_name,
      middle_name,
      last_name,
      email,
      phone,
      status,
      submitted_at,
      reviewed_at,
      desired_start_date,
      has_felony_conviction,
      previous_barber_training,
      campus:campuses(id, name, code),
      program:programs(id, name, code)
    `,
      { count: "exact" }
    )
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.campusId) {
    query = query.eq("campus_id", filters.campusId);
  }
  if (filters.submitted === true) {
    query = query.not("submitted_at", "is", null);
  } else if (filters.submitted === false) {
    query = query.is("submitted_at", null);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching applications:", error);
    return { applications: [], total: 0, error: error.message };
  }

  return { applications: data || [], total: count || 0 };
}

/**
 * Get a single application by ID
 */
export async function getApplicationById(applicationId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      campus:campuses(*),
      program:programs(*),
      schedule:program_schedules(*)
    `
    )
    .eq("id", applicationId)
    .single();

  if (error) {
    console.error("Error fetching application:", error);
    return { application: null, error: error.message };
  }

  return { application: data };
}

/**
 * Review/decide on an application
 */
export async function reviewApplication(
  applicationId: string,
  decision: "accepted" | "denied",
  reason?: string
) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("applications")
    .update({
      status: decision,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
      decision_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  if (error) {
    console.error("Error reviewing application:", error);
    return { success: false, error: error.message };
  }

  // Send notification to applicant if they have a user_id
  const { data: app } = await supabase
    .from("applications")
    .select("user_id")
    .eq("id", applicationId)
    .single();
  if (app?.user_id) {
    await notifyApplicationStatus(app.user_id, decision);
  }

  revalidatePath("/admin/admissions/applications");
  revalidatePath(`/admin/admissions/applications/${applicationId}`);
  return { success: true };
}

/**
 * Enroll an accepted applicant as a student
 */
export async function enrollStudent(applicationId: string, startDate: string) {
  const supabase = await createClient();

  // Get the application
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select("*, campus:campuses(*), program:programs(*)")
    .eq("id", applicationId)
    .eq("status", "accepted")
    .single();

  if (appError || !application) {
    return { success: false, error: "Application not found or not accepted" };
  }

  // Generate student number (format: MBA + year + 4 digit sequence)
  const year = new Date().getFullYear().toString().slice(-2);
  const { count } = await supabase
    .from("students")
    .select("id", { count: "exact" });
  const sequence = String((count || 0) + 1).padStart(4, "0");
  const studentNumber = `MBA${year}${sequence}`;

  // Calculate expected graduation date
  const startDateObj = new Date(startDate);
  const program = application.program as { duration_weeks: number } | null;
  const weeksToAdd = program?.duration_weeks || 52;
  const expectedGraduation = new Date(startDateObj);
  expectedGraduation.setDate(expectedGraduation.getDate() + weeksToAdd * 7);

  // Create student record
  const { data: student, error: studentError } = await supabase
    .from("students")
    .insert({
      user_id: application.user_id,
      application_id: applicationId,
      student_number: studentNumber,
      first_name: application.first_name,
      last_name: application.last_name,
      email: application.email,
      phone: application.phone,
      date_of_birth: application.date_of_birth,
      campus_id: application.campus_id,
      program_id: application.program_id,
      schedule_id: application.schedule_id,
      status: "enrolled",
      enrollment_date: new Date().toISOString().split("T")[0],
      start_date: startDate,
      expected_graduation_date: expectedGraduation.toISOString().split("T")[0],
      total_hours_scheduled: (application.program as { total_hours?: number } | null)?.total_hours || 1500,
    })
    .select()
    .single();

  if (studentError) {
    console.error("Error creating student:", studentError);
    return { success: false, error: studentError.message };
  }

  // Update application status
  await supabase
    .from("applications")
    .update({
      status: "enrolled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId);

  // Create student account
  await supabase.from("student_accounts").insert({
    student_id: student.id,
    total_charges: 0,
    total_payments: 0,
    total_aid_posted: 0,
    current_balance: 0,
  });

  // Send enrollment notification
  if (application.user_id) {
    await notifyApplicationStatus(application.user_id, "enrolled");
  }

  revalidatePath("/admin/students");
  revalidatePath("/admin/admissions/applications");

  return { success: true, studentId: student.id, studentNumber };
}

/**
 * Get all leads
 */
export async function getLeads(
  filters: {
    status?: StudentStatus;
    campusId?: string;
    source?: string;
  } = {},
  limit = 25,
  offset = 0
) {
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select(
      `
      id,
      first_name,
      last_name,
      email,
      phone,
      status,
      source,
      source_detail,
      notes,
      created_at,
      converted_at,
      campus:campuses(id, name, code),
      program:programs(id, name, code),
      assigned_user:user_profiles!assigned_to(first_name, last_name)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  if (filters.campusId) {
    query = query.eq("campus_id", filters.campusId);
  }
  if (filters.source) {
    query = query.eq("source", filters.source);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error("Error fetching leads:", error);
    return { leads: [], total: 0, error: error.message };
  }

  return { leads: data || [], total: count || 0 };
}

/**
 * Get campuses for filters
 */
export async function getCampuses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campuses")
    .select("id, name, code")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return { campuses: [] };
  }

  return { campuses: data || [] };
}

/**
 * Get programs for filters
 */
export async function getPrograms() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("programs")
    .select("id, name, code, total_hours")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return { programs: [] };
  }

  return { programs: data || [] };
}

/**
 * Bulk update student status
 */
export async function bulkUpdateStudentStatus(
  studentIds: string[],
  status: StudentStatus
) {
  if (studentIds.length === 0) return { success: false, error: "No students selected" };

  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (status === "withdrawn") {
    updateData["withdrawal_date"] = new Date().toISOString().split("T")[0];
  } else if (status === "graduated") {
    updateData["actual_graduation_date"] = new Date().toISOString().split("T")[0];
  }

  const { error } = await supabase
    .from("students")
    .update(updateData)
    .in("id", studentIds);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/students");
  return { success: true, count: studentIds.length };
}

/**
 * Get a single lead by ID
 */
export async function getLeadById(leadId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      campus:campuses(id, name, code),
      program:programs(id, name, code),
      assigned_user:user_profiles!assigned_to(first_name, last_name, email)
    `)
    .eq("id", leadId)
    .single();

  if (error) return { lead: null, error: error.message };
  return { lead: data };
}

/**
 * Update lead status
 */
export async function updateLeadStatus(
  leadId: string,
  status: string,
  notes?: string
) {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (notes) {
    updateData["notes"] = notes;
  }

  if (status === "applicant") {
    updateData["converted_at"] = new Date().toISOString();
  }

  const { error } = await supabase
    .from("leads")
    .update(updateData)
    .eq("id", leadId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/admissions/leads");
  revalidatePath(`/admin/admissions/leads/${leadId}`);
  return { success: true };
}
