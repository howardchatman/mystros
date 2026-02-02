import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getCompetenciesByStudent } from "@/lib/actions/instructor";
import { CompetencyEvaluator } from "./competency-evaluator";

export const metadata = {
  title: "Competencies | Instructor Portal",
  description: "Evaluate student competencies",
};

export default async function InstructorCompetenciesPage() {
  const user = await getUser();
  if (!user || user.role !== "instructor") redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("campus_id")
    .eq("id", user.id)
    .single();
  const campusId = (profile as any)?.campus_id as string;
  if (!campusId) redirect("/login");

  const studentsWithCompetencies = await getCompetenciesByStudent(campusId);

  return (
    <CompetencyEvaluator students={studentsWithCompetencies} />
  );
}
