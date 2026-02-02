"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";
import { notifyDisbursementUpdate } from "@/lib/actions/notifications";
import { logAudit } from "@/lib/actions/audit";

type AidRecordInsert = Database["public"]["Tables"]["financial_aid_records"]["Insert"];
type AidRecordUpdate = Database["public"]["Tables"]["financial_aid_records"]["Update"];
type AwardInsert = Database["public"]["Tables"]["financial_aid_awards"]["Insert"];
type AwardUpdate = Database["public"]["Tables"]["financial_aid_awards"]["Update"];
type DisbursementInsert = Database["public"]["Tables"]["disbursements"]["Insert"];
type ChargeInsert = Database["public"]["Tables"]["charges"]["Insert"];
type PaymentInsert = Database["public"]["Tables"]["payments"]["Insert"];

// ─── Financial Aid Records ──────────────────────────────────────

export async function createFinancialAidRecord(
  data: Omit<AidRecordInsert, "id" | "created_at" | "updated_at">
) {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("financial_aid_records")
    .insert(data)
    .select()
    .single();

  if (error) return { error: error.message };
  logAudit({ table_name: "financial_aid_records", record_id: record.id, action: "create", new_data: data as Record<string, unknown> }).catch(() => {});
  revalidatePath("/admin/financial-aid");
  return { data: record };
}

export async function updateFinancialAidRecord(
  id: string,
  updates: AidRecordUpdate
) {
  const supabase = await createClient();
  const { data: record, error } = await supabase
    .from("financial_aid_records")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/financial-aid");
  revalidatePath(`/admin/financial-aid/${id}`);
  return { data: record };
}

export async function getFinancialAidRecord(id: string) {
  const supabase = await createClient();

  const { data: record, error } = await supabase
    .from("financial_aid_records")
    .select(`
      *,
      student:students(
        id, first_name, last_name, student_number, email,
        program:programs(id, name, total_hours)
      )
    `)
    .eq("id", id)
    .single();

  if (error) return { error: error.message };

  // Get awards
  const { data: awards } = await supabase
    .from("financial_aid_awards")
    .select("*")
    .eq("financial_aid_record_id", id)
    .order("created_at", { ascending: false });

  // Get disbursements for this student
  const studentId = (record as any).student_id;
  const { data: disbursements } = await supabase
    .from("disbursements")
    .select(`
      *,
      award:financial_aid_awards(award_type, award_name)
    `)
    .eq("student_id", studentId)
    .order("scheduled_date", { ascending: false });

  // Get student account
  const { data: account } = await supabase
    .from("student_accounts")
    .select("*")
    .eq("student_id", studentId)
    .single();

  // Get charges
  const { data: charges } = account
    ? await supabase
        .from("charges")
        .select("*")
        .eq("student_account_id", account.id)
        .order("charge_date", { ascending: false })
    : { data: [] };

  // Get payments
  const { data: payments } = account
    ? await supabase
        .from("payments")
        .select("*")
        .eq("student_account_id", account.id)
        .order("payment_date", { ascending: false })
    : { data: [] };

  return {
    data: {
      record,
      awards: awards || [],
      disbursements: disbursements || [],
      account,
      charges: charges || [],
      payments: payments || [],
    },
  };
}

// ─── Awards ─────────────────────────────────────────────────────

export async function createAwardPackage(
  recordId: string,
  awards: Omit<AwardInsert, "financial_aid_record_id" | "id" | "created_at" | "updated_at">[]
) {
  const supabase = await createClient();

  const inserts = awards.map((a) => ({
    ...a,
    financial_aid_record_id: recordId,
  }));

  const { data, error } = await supabase
    .from("financial_aid_awards")
    .insert(inserts)
    .select();

  if (error) return { error: error.message };

  // Update record status to packaged
  await supabase
    .from("financial_aid_records")
    .update({ status: "packaged", packaged_at: new Date().toISOString() })
    .eq("id", recordId);

  revalidatePath("/admin/financial-aid");
  return { data };
}

export async function updateAward(awardId: string, updates: AwardUpdate) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("financial_aid_awards")
    .update(updates)
    .eq("id", awardId)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/financial-aid");
  return { data };
}

// ─── Disbursements ──────────────────────────────────────────────

export async function scheduleDisbursement(
  data: Omit<DisbursementInsert, "id" | "created_at" | "updated_at">
) {
  const supabase = await createClient();
  const { data: disbursement, error } = await supabase
    .from("disbursements")
    .insert(data)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/financial-aid");
  return { data: disbursement };
}

export async function releaseDisbursement(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("disbursements")
    .update({
      status: "released",
      released_by: user?.id || null,
      released_at: new Date().toISOString(),
      actual_date: new Date().toISOString().split("T")[0],
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };

  logAudit({ table_name: "disbursements", record_id: id, action: "status_change", new_data: { status: "released" } }).catch(() => {});

  // Post the disbursement amount as a payment to the student account
  if (data) {
    const { data: account } = await supabase
      .from("student_accounts")
      .select("id")
      .eq("student_id", data.student_id)
      .single();

    if (account) {
      await supabase.from("payments").insert({
        student_account_id: account.id,
        student_id: data.student_id,
        amount: data.actual_amount || data.scheduled_amount,
        payment_method: "financial_aid",
        payment_date: new Date().toISOString().split("T")[0]!,
        disbursement_id: data.id,
        status: "completed",
      });
      await recalculateAccountBalance(account.id);
    }

    // Notify student
    await notifyDisbursementUpdate(data.student_id, "released").catch(() => {});
  }

  revalidatePath("/admin/financial-aid");
  return { data };
}

export async function holdDisbursement(id: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("disbursements")
    .update({
      status: "pending_release",
      hold_reason: reason,
      hold_placed_by: user?.id || null,
      hold_placed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/financial-aid");
  return { data };
}

// ─── Charges ────────────────────────────────────────────────────

export async function recordCharge(
  data: Omit<ChargeInsert, "id" | "created_at">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: charge, error } = await supabase
    .from("charges")
    .insert({ ...data, created_by: user?.id || null })
    .select()
    .single();

  if (error) return { error: error.message };
  logAudit({ table_name: "charges", record_id: charge.id, action: "create", new_data: data as Record<string, unknown> }).catch(() => {});
  await recalculateAccountBalance(data.student_account_id);
  revalidatePath("/admin/financial-aid");
  return { data: charge };
}

export async function voidCharge(id: string, reason: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: charge, error } = await supabase
    .from("charges")
    .update({
      is_voided: true,
      voided_reason: reason,
      voided_by: user?.id || null,
      voided_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return { error: error.message };
  logAudit({ table_name: "charges", record_id: id, action: "update", new_data: { is_voided: true, reason } }).catch(() => {});
  if (charge) {
    await recalculateAccountBalance(charge.student_account_id);
  }
  revalidatePath("/admin/financial-aid");
  return { data: charge };
}

// ─── Payments ───────────────────────────────────────────────────

export async function recordPayment(
  data: Omit<PaymentInsert, "id" | "created_at">
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({ ...data, created_by: user?.id || null })
    .select()
    .single();

  if (error) return { error: error.message };
  logAudit({ table_name: "payments", record_id: payment.id, action: "create", new_data: data as Record<string, unknown> }).catch(() => {});
  await recalculateAccountBalance(data.student_account_id);
  revalidatePath("/admin/financial-aid");
  return { data: payment };
}

// ─── Account Balance ────────────────────────────────────────────

export async function recalculateAccountBalance(accountId: string) {
  const supabase = await createClient();

  // Sum active charges
  const { data: charges } = await supabase
    .from("charges")
    .select("amount, is_voided")
    .eq("student_account_id", accountId);

  const totalCharges = (charges || [])
    .filter((c) => !c.is_voided)
    .reduce((sum, c) => sum + (c.amount || 0), 0);

  // Sum completed payments
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, status, is_refund")
    .eq("student_account_id", accountId);

  const totalPayments = (payments || [])
    .filter((p) => p.status === "completed" && !p.is_refund)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalRefunds = (payments || [])
    .filter((p) => p.status === "completed" && p.is_refund)
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const currentBalance = totalCharges - totalPayments + totalRefunds;

  await supabase
    .from("student_accounts")
    .update({
      total_charges: totalCharges,
      total_payments: totalPayments,
      current_balance: currentBalance,
    })
    .eq("id", accountId);
}

// ─── Helpers ────────────────────────────────────────────────────

export async function searchStudentsForAid(query: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("students")
    .select("id, first_name, last_name, student_number, program:programs(name)")
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,student_number.ilike.%${query}%`)
    .in("status", ["enrolled", "active"])
    .limit(10);

  return data || [];
}

export async function batchReleaseDisbursements(ids: string[]) {
  if (ids.length === 0) return { error: "No disbursements selected" };

  const supabase = await createClient();
  let released = 0;
  const errors: string[] = [];

  for (const id of ids) {
    const { data: disb, error: fetchErr } = await supabase
      .from("disbursements")
      .select("*, student:students(id, user_id), award:financial_aid_awards(student_id)")
      .eq("id", id)
      .single();

    if (fetchErr || !disb) {
      errors.push(`${id}: not found`);
      continue;
    }

    const { error: updateErr } = await supabase
      .from("disbursements")
      .update({
        status: "disbursed",
        actual_disbursement_date: new Date().toISOString().split("T")[0],
      })
      .eq("id", id);

    if (updateErr) {
      errors.push(`${id}: ${updateErr.message}`);
      continue;
    }

    released++;

    // Notify student
    const student = disb.student as { id: string; user_id?: string } | null;
    if (student?.id) {
      try {
        await notifyDisbursementUpdate(student.id, "released");
      } catch {
        // non-fatal
      }
    }
  }

  revalidatePath("/admin/financial-aid");
  if (errors.length > 0) {
    return { error: `Released ${released}, failed ${errors.length}` };
  }
  return { success: true, count: released };
}

export async function ensureStudentAccount(studentId: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("student_accounts")
    .select("id")
    .eq("student_id", studentId)
    .single();

  if (existing) return existing.id;

  const { data: created } = await supabase
    .from("student_accounts")
    .insert({ student_id: studentId })
    .select("id")
    .single();

  return created?.id || null;
}
