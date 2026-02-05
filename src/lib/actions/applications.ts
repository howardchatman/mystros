"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { ApplicationFormData } from "@/lib/validations/application";

export type ApplicationResult = {
  success: boolean;
  error?: string;
  applicationId?: string;
};

/**
 * Get or create an application for the current user
 */
export async function getOrCreateApplication(): Promise<{
  application: any | null;
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { application: null, error: "Not authenticated" };
  }

  // Check for existing application
  const { data: existing } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return { application: existing };
  }

  // Get user profile for initial data
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Create new application
  const { data: newApplication, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      email: profile?.email || user.email || "",
      phone: profile?.phone || "",
      status: "applicant",
    })
    .select()
    .single();

  if (error) {
    return { application: null, error: error.message };
  }

  return { application: newApplication };
}

/**
 * Update application with step data
 */
export async function updateApplicationStep(
  applicationId: string,
  stepData: Partial<ApplicationFormData>
): Promise<ApplicationResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  // Convert camelCase to snake_case for database
  const dbData: Record<string, any> = {};

  const fieldMapping: Record<string, string> = {
    firstName: "first_name",
    middleName: "middle_name",
    lastName: "last_name",
    preferredName: "preferred_name",
    dateOfBirth: "date_of_birth",
    addressLine1: "address_line1",
    addressLine2: "address_line2",
    emergencyContactName: "emergency_contact_name",
    emergencyContactPhone: "emergency_contact_phone",
    emergencyContactRelationship: "emergency_contact_relationship",
    highSchoolName: "high_school_name",
    highSchoolCity: "high_school_city",
    highSchoolState: "high_school_state",
    graduationYear: "graduation_year",
    gedCompletionDate: "ged_completion_date",
    highestEducation: "highest_education",
    campusId: "campus_id",
    programId: "program_id",
    scheduleId: "schedule_id",
    desiredStartDate: "desired_start_date",
    hasFelonyConviction: "has_felony_conviction",
    felonyExplanation: "felony_explanation",
    previousBarberTraining: "previous_barber_training",
    previousTrainingDetails: "previous_training_details",
  };

  for (const [key, value] of Object.entries(stepData)) {
    const dbKey = fieldMapping[key] || key;
    dbData[dbKey] = value;
  }

  const now = new Date().toISOString();
  dbData["updated_at"] = now;
  dbData["last_activity_at"] = now;

  const { error } = await supabase
    .from("applications")
    .update(dbData)
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/intake");
  return { success: true, applicationId };
}

/**
 * Submit the completed application
 */
export async function submitApplication(
  applicationId: string
): Promise<ApplicationResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("applications")
    .update({
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", applicationId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/intake");
  revalidatePath("/dashboard");
  return { success: true, applicationId };
}

/**
 * Get campuses for selection
 */
export async function getCampuses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campuses")
    .select("id, name, code, city")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return { campuses: [], error: error.message };
  }

  return { campuses: data || [] };
}

/**
 * Get programs for selection
 */
export async function getPrograms() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("programs")
    .select("id, name, code, total_hours, tuition_amount")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return { programs: [], error: error.message };
  }

  return { programs: data || [] };
}

/**
 * Get schedules for a program
 */
export async function getSchedules(programId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("program_schedules")
    .select("id, name, hours_per_week, days_per_week, start_time, end_time")
    .eq("program_id", programId)
    .eq("is_active", true)
    .order("name");

  if (error) {
    return { schedules: [], error: error.message };
  }

  return { schedules: data || [] };
}

/**
 * Check if user needs to complete intake
 */
export async function checkIntakeStatus(): Promise<{
  needsIntake: boolean;
  applicationId?: string;
  currentStep?: number;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { needsIntake: false };
  }

  const { data: application } = await supabase
    .from("applications")
    .select("id, submitted_at, first_name, campus_id, has_felony_conviction")
    .eq("user_id", user.id)
    .single();

  if (!application) {
    return { needsIntake: true, currentStep: 0 };
  }

  if (application.submitted_at) {
    return { needsIntake: false, applicationId: application.id };
  }

  // Determine current step based on filled fields
  let currentStep = 0;

  if (application.first_name) currentStep = 1;
  if (application.campus_id) currentStep = 4;
  if (application.has_felony_conviction !== null) currentStep = 5;

  return {
    needsIntake: true,
    applicationId: application.id,
    currentStep,
  };
}
