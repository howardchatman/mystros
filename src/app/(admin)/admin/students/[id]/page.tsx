import { notFound } from "next/navigation";
import { getStudentById } from "@/lib/actions/admin-students";
import { getSapHistory } from "@/lib/actions/sap";
import { StudentDetailClient } from "./student-detail-client";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { student } = await getStudentById(id);
  if (!student) return { title: "Student Not Found" };
  return {
    title: `${student.first_name} ${student.last_name} | Student Profile`,
  };
}

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { student, error } = await getStudentById(id);

  if (error || !student) {
    notFound();
  }

  const sapHistory = await getSapHistory(id);

  return <StudentDetailClient student={student} sapHistory={sapHistory} />;
}
