import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { getStudentCompetencies } from "@/lib/actions/competencies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, CheckCircle, Circle } from "lucide-react";

export const metadata = {
  title: "Skills Progress | Student Portal",
};

export default async function CompetenciesPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: student } = await supabase
    .from("students")
    .select("id, program_id")
    .eq("user_id", user.id)
    .single();

  if (!student?.program_id) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Skills Progress</h1>
          <p className="text-muted-foreground">Track your competency development</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No program assigned yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { definitions, progress } = await getStudentCompetencies(
    student.id,
    student.program_id
  );

  const completedIds = new Set(progress.map((p) => p.competency_definition_id));

  // Group by category
  const categories: Record<string, { total: number; completed: number; items: typeof definitions }> = {};
  for (const def of definitions) {
    const cat = def.category || "General";
    if (!categories[cat]) {
      categories[cat] = { total: 0, completed: 0, items: [] };
    }
    categories[cat]!.total++;
    if (completedIds.has(def.id)) categories[cat]!.completed++;
    categories[cat]!.items.push(def);
  }

  const totalCompleted = progress.length;
  const totalDefs = definitions.length;
  const overallPercent = totalDefs > 0 ? Math.round((totalCompleted / totalDefs) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Skills Progress</h1>
        <p className="text-muted-foreground">Track your competency development</p>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Overall Progress</span>
            <span className="text-sm font-medium text-foreground">
              {totalCompleted} / {totalDefs} skills ({overallPercent}%)
            </span>
          </div>
          <Progress value={overallPercent} className="h-3" />
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(categories).map(([category, data]) => {
          const catPercent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{category}</CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {data.completed}/{data.total} ({catPercent}%)
                  </span>
                </div>
                <Progress value={catPercent} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {data.items.map((item) => {
                    const done = completedIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                          done ? "bg-green-500/10" : "bg-muted/50"
                        }`}
                      >
                        {done ? (
                          <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                        )}
                        <span className={done ? "text-foreground" : "text-muted-foreground"}>
                          {item.name}
                        </span>
                        {item.is_required && !done && (
                          <span className="text-xs text-yellow-500 ml-auto">Required</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
