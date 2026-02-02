import { notFound } from "next/navigation";
import { getStudentById } from "@/lib/actions/admin-students";
import { getSapHistory } from "@/lib/actions/sap";
import { createClient } from "@/lib/supabase/server";
import { StudentDetailReadonly } from "./student-detail-readonly";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { student } = await getStudentById(id);
  if (!student) return { title: "Student Not Found" };
  return { title: `${student.first_name} ${student.last_name} | Auditor Review` };
}

export default async function AuditorStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { student, error } = await getStudentById(id);

  if (error || !student) {
    notFound();
  }

  const supabase = await createClient();

  const [
    sapHistory,
    { data: documents },
    { data: accountArr },
    { data: attendance },
    { data: charges },
    { data: payments },
    { data: aidRecords },
    { data: disbursements },
  ] = await Promise.all([
    getSapHistory(id),
    supabase
      .from("documents")
      .select("id, file_name, status, created_at, expires_at, reviewed_at, document_type:document_types(name, category, is_required)")
      .eq("student_id", id)
      .order("created_at", { ascending: false }),
    supabase
      .from("student_accounts")
      .select("*")
      .eq("student_id", id),
    supabase
      .from("attendance_records")
      .select("attendance_date, status, scheduled_hours, actual_hours, theory_hours, practical_hours, clock_in_time, clock_out_time")
      .eq("student_id", id)
      .order("attendance_date", { ascending: false })
      .limit(100),
    supabase
      .from("charges")
      .select("charge_date, charge_type, description, amount, is_voided")
      .eq("student_id", id)
      .order("charge_date", { ascending: false }),
    supabase
      .from("payments")
      .select("payment_date, amount, payment_method, status, is_refund")
      .eq("student_id", id)
      .order("payment_date", { ascending: false }),
    supabase
      .from("financial_aid_records")
      .select("id, academic_year, status, efc, verification_required, verification_status, awards:financial_aid_awards(id, award_name, award_type, offered_amount, accepted_amount, status)")
      .eq("student_id", id)
      .order("academic_year", { ascending: false }),
    supabase
      .from("disbursements")
      .select("id, disbursement_number, scheduled_date, scheduled_amount, actual_date, actual_amount, status")
      .eq("student_id", id)
      .order("scheduled_date", { ascending: true }),
  ]);

  const normalizedDocs = (documents || []).map((d: any) => ({
    ...d,
    document_type: Array.isArray(d.document_type) ? d.document_type[0] || null : d.document_type,
  }));

  const normalizedAid = (aidRecords || []).map((r: any) => ({
    ...r,
    awards: Array.isArray(r.awards) ? r.awards : [],
  }));

  const account = accountArr && accountArr.length > 0 ? accountArr[0] : null;

  return (
    <StudentDetailReadonly
      student={student}
      sapHistory={sapHistory}
      documents={normalizedDocs}
      account={account}
      attendance={attendance || []}
      charges={charges || []}
      payments={payments || []}
      aidRecords={normalizedAid}
      disbursements={disbursements || []}
    />
  );
}
