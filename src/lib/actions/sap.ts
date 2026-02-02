"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { SapStatus } from "@/types/database";
import { notifySapAlert } from "@/lib/actions/notifications";
import { logAudit } from "@/lib/actions/audit";

// ─── Check if SAP Evaluation is Due ───────────────────────

export async function checkSapEvaluationDue(studentId: string): Promise<boolean> {
  const supabase = await createClient();

  // Get student with program
  const { data: student } = await supabase
    .from("students")
    .select("total_hours_completed, program_id")
    .eq("id", studentId)
    .single();

  if (!student) return false;

  // Get SAP config for program
  const { data: config } = await supabase
    .from("sap_configurations")
    .select("evaluation_interval_hours")
    .eq("program_id", student.program_id)
    .eq("is_active", true)
    .single();

  if (!config) return false;

  const interval = config.evaluation_interval_hours;
  const totalHours = student.total_hours_completed || 0;

  // Get last evaluation
  const { data: lastEval } = await supabase
    .from("sap_evaluations")
    .select("hours_completed")
    .eq("student_id", studentId)
    .order("evaluation_date", { ascending: false })
    .limit(1)
    .single();

  const lastEvalHours = lastEval?.hours_completed || 0;

  // Due if hours since last eval >= interval
  return totalHours - lastEvalHours >= interval;
}

// ─── Calculate SAP ────────────────────────────────────────

export async function calculateSap(studentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Get student + program
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(`
      id,
      total_hours_completed,
      total_hours_scheduled,
      current_sap_status,
      program:programs(
        id,
        total_hours,
        theory_hours,
        practical_hours
      )
    `)
    .eq("id", studentId)
    .single();

  if (studentError || !student) {
    return { error: studentError?.message || "Student not found" };
  }

  const program = student.program
    ? Array.isArray(student.program)
      ? student.program[0]
      : student.program
    : null;

  if (!program) {
    return { error: "Student has no program assigned" };
  }

  // Get SAP config
  const { data: config } = await supabase
    .from("sap_configurations")
    .select("*")
    .eq("program_id", program.id)
    .eq("is_active", true)
    .single();

  const minCompletionRate = config?.min_completion_rate ?? 67;
  const maxTimeframePercent = config?.max_timeframe_percentage ?? 150;

  // Calculate metrics
  const hoursCompleted = student.total_hours_completed || 0;
  const hoursScheduled = student.total_hours_scheduled || hoursCompleted;
  const hoursAttempted = Math.max(hoursScheduled, hoursCompleted);

  const completionRate =
    hoursAttempted > 0
      ? Math.round((hoursCompleted / hoursAttempted) * 10000) / 100
      : 100;

  const maxTimeframeHours = program.total_hours * (maxTimeframePercent / 100);
  const maxTimeframeActual =
    program.total_hours > 0
      ? Math.round((hoursAttempted / program.total_hours) * 10000) / 100
      : 0;
  const isWithinMaxTimeframe = hoursAttempted <= maxTimeframeHours;

  // Determine new status based on progression rules
  const previousStatus = student.current_sap_status || "satisfactory";
  const meetsCompletionRate = completionRate >= minCompletionRate;
  const passing = meetsCompletionRate && isWithinMaxTimeframe;

  let newStatus: SapStatus;
  let academicPlanRequired = false;

  if (passing) {
    newStatus = "satisfactory";
  } else {
    // Failed — determine progression
    switch (previousStatus) {
      case "satisfactory":
        newStatus = "warning";
        break;
      case "warning":
        newStatus = "probation";
        academicPlanRequired = true;
        break;
      case "probation":
        newStatus = "suspension";
        break;
      case "appeal_approved":
        // Was on appeal probation, failed again
        newStatus = "suspension";
        break;
      default:
        // Already suspended or other state
        newStatus = "suspension";
        break;
    }
  }

  // Determine evaluation point label
  const evalInterval = config?.evaluation_interval_hours || 450;
  const evalNumber = Math.ceil(hoursCompleted / evalInterval);
  const evaluationPoint = `${evalInterval * evalNumber} Hour Checkpoint`;

  // Insert SAP evaluation record
  const { data: evaluation, error: insertError } = await supabase
    .from("sap_evaluations")
    .insert({
      student_id: studentId,
      evaluation_date: new Date().toISOString().split("T")[0],
      evaluation_point: evaluationPoint,
      hours_attempted: hoursAttempted,
      hours_completed: hoursCompleted,
      completion_rate: completionRate,
      max_timeframe_percentage: maxTimeframeActual,
      is_within_max_timeframe: isWithinMaxTimeframe,
      status: newStatus,
      previous_status: previousStatus,
      academic_plan_required: academicPlanRequired,
      evaluated_by: user.id,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[calculateSap] insert error:", insertError.message);
    return { error: insertError.message };
  }

  // Update student's current SAP status
  await supabase
    .from("students")
    .update({ current_sap_status: newStatus })
    .eq("id", studentId);

  logAudit({
    table_name: "sap_evaluations",
    record_id: evaluation.id,
    action: "create",
    new_data: { student_id: studentId, status: newStatus, previous_status: previousStatus, completion_rate: completionRate },
  }).catch(() => {});

  // Notify student of SAP status change
  if (newStatus !== previousStatus) {
    await notifySapAlert(studentId, newStatus).catch(() => {});
  }

  revalidatePath(`/admin/students/${studentId}`);
  revalidatePath("/admin/students");

  return {
    data: {
      evaluation,
      status: newStatus,
      completionRate,
      isWithinMaxTimeframe,
      academicPlanRequired,
    },
  };
}

// ─── Get SAP History ──────────────────────────────────────

export async function getSapHistory(studentId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("sap_evaluations")
    .select(`
      *,
      evaluator:user_profiles!evaluated_by(first_name, last_name)
    `)
    .eq("student_id", studentId)
    .order("evaluation_date", { ascending: false });

  if (error) {
    console.error("[getSapHistory] error:", error.message);
    return [];
  }

  return data || [];
}

// ─── Trigger SAP Evaluation (admin-facing) ────────────────

export async function triggerSapEvaluation(studentId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check role
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (
    !profile ||
    !["superadmin", "campus_admin", "registrar"].includes(profile.role)
  ) {
    return { error: "Insufficient permissions to run SAP evaluations" };
  }

  return calculateSap(studentId);
}
