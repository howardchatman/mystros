"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ─── Get Competency Definitions ───────────────────────────

export async function getCompetencyDefinitions(programId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("competency_definitions")
    .select("*")
    .eq("program_id", programId)
    .eq("is_active", true)
    .order("category")
    .order("sort_order");

  if (error) {
    console.error("[getCompetencyDefinitions] error:", error.message);
    return [];
  }

  return data || [];
}

// ─── Get Student Competencies ─────────────────────────────

export async function getStudentCompetencies(
  studentId: string,
  programId: string
) {
  const supabase = await createClient();

  // Get all definitions for the program
  const { data: definitions } = await supabase
    .from("competency_definitions")
    .select("id, category, name, sort_order, milestone_hours, is_required")
    .eq("program_id", programId)
    .eq("is_active", true)
    .order("category")
    .order("sort_order");

  // Get student's progress
  const { data: progress } = await supabase
    .from("student_competencies")
    .select("competency_definition_id, completed_at")
    .eq("student_id", studentId);

  return {
    definitions: definitions || [],
    progress: progress || [],
  };
}

// ─── Mark Competency Complete ─────────────────────────────

export async function markCompetencyComplete(
  studentId: string,
  definitionId: string,
  notes?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("student_competencies").upsert(
    {
      student_id: studentId,
      competency_definition_id: definitionId,
      completed_at: new Date().toISOString(),
      evaluated_by: user.id,
      notes: notes || null,
    },
    { onConflict: "student_id,competency_definition_id" }
  );

  if (error) {
    console.error("[markCompetencyComplete] error:", error.message);
    return { error: error.message };
  }

  revalidatePath(`/admin/students/${studentId}`);
  return { success: true };
}

// ─── Unmark Competency ────────────────────────────────────

export async function unmarkCompetency(
  studentId: string,
  definitionId: string
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("student_competencies")
    .update({
      completed_at: null,
      evaluated_by: null,
      notes: null,
    })
    .eq("student_id", studentId)
    .eq("competency_definition_id", definitionId);

  if (error) {
    console.error("[unmarkCompetency] error:", error.message);
    return { error: error.message };
  }

  revalidatePath(`/admin/students/${studentId}`);
  return { success: true };
}

// ─── Get Student Milestones ───────────────────────────────

export async function getStudentMilestones(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("student_milestones")
    .select("*")
    .eq("student_id", studentId)
    .order("achieved_at", { ascending: false });

  if (error) {
    console.error("[getStudentMilestones] error:", error.message);
    return [];
  }

  return data || [];
}

// ─── Record Milestone ─────────────────────────────────────

export async function recordMilestone(
  studentId: string,
  type: string,
  name: string,
  notes?: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("student_milestones").upsert(
    {
      student_id: studentId,
      milestone_type: type,
      milestone_name: name,
      recorded_by: user.id,
      notes: notes || null,
    },
    { onConflict: "student_id,milestone_type" }
  );

  if (error) {
    console.error("[recordMilestone] error:", error.message);
    return { error: error.message };
  }

  revalidatePath(`/admin/students/${studentId}`);
  return { success: true };
}
