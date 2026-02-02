import { getFinancialAidRecord } from "@/lib/actions/financial-aid";
import { notFound } from "next/navigation";
import { AidRecordDetail } from "./aid-record-detail";

export const metadata = {
  title: "Financial Aid Record | Admin Dashboard",
};

export default async function FinancialAidRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getFinancialAidRecord(id);

  if (result.error || !result.data) {
    notFound();
  }

  const { record, awards, disbursements, account, charges, payments } = result.data;

  const student = record.student as unknown as {
    id: string;
    first_name: string;
    last_name: string;
    student_number: string;
    email: string;
    program: { id: string; name: string; total_hours: number } | { id: string; name: string; total_hours: number }[];
  } | null;

  const program = student?.program
    ? Array.isArray(student.program)
      ? student.program[0] || null
      : student.program
    : null;

  return (
    <AidRecordDetail
      record={record as any}
      student={student ? { ...student, program } as any : null}
      awards={awards as any[]}
      disbursements={disbursements as any[]}
      account={account as any}
      charges={charges as any[]}
      payments={payments as any[]}
    />
  );
}
