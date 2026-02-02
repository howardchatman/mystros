import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, CheckCircle, Circle, Star } from "lucide-react";

export const metadata = {
  title: "Milestones | Student Portal",
};

const HOUR_MILESTONES = [
  { hours: 100, name: "100 Hour Mark", description: "First major milestone" },
  { hours: 250, name: "250 Hour Mark", description: "Quarter way through many programs" },
  { hours: 500, name: "500 Hour Mark", description: "Significant progress" },
  { hours: 750, name: "750 Hour Mark", description: "Well on your way" },
  { hours: 1000, name: "1,000 Hour Mark", description: "Major achievement" },
  { hours: 1250, name: "1,250 Hour Mark", description: "Nearing completion" },
  { hours: 1500, name: "1,500 Hour Mark", description: "Program completion goal" },
];

export default async function MilestonesPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("id, total_hours_completed, program:programs(total_hours)")
    .eq("user_id", user.id)
    .single();

  if (!student) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Milestones</h1>
          <p className="text-muted-foreground">Track your achievements</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No student record found.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get recorded milestones
  const { data: recordedMilestones } = await supabase
    .from("student_milestones")
    .select("*")
    .eq("student_id", student.id)
    .order("achieved_at", { ascending: false });

  const achievedNames = new Set((recordedMilestones || []).map((m) => m.name));
  const totalHours = student.total_hours_completed || 0;
  const program = student.program as { total_hours?: number } | { total_hours?: number }[] | null;
  const programHours = Array.isArray(program) ? program[0]?.total_hours : program?.total_hours;

  // Filter milestones relevant to this program
  const relevantMilestones = HOUR_MILESTONES.filter(
    (m) => !programHours || m.hours <= programHours
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Milestones</h1>
        <p className="text-muted-foreground">
          Track your achievements and upcoming goals
        </p>
      </div>

      {/* Progress Summary */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-brand-accent/10">
              <Trophy className="w-8 h-8 text-brand-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {relevantMilestones.filter((m) => totalHours >= m.hours).length} / {relevantMilestones.length}
              </p>
              <p className="text-sm text-muted-foreground">Milestones achieved</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Milestone Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hour Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-6">
              {relevantMilestones.map((milestone) => {
                const achieved = totalHours >= milestone.hours;
                const isNext = !achieved && totalHours < milestone.hours;
                const progress = Math.min(
                  Math.round((totalHours / milestone.hours) * 100),
                  100
                );

                return (
                  <div key={milestone.hours} className="relative flex items-start gap-4 pl-2">
                    <div
                      className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${
                        achieved
                          ? "bg-green-500"
                          : isNext
                          ? "bg-brand-accent/20 border-2 border-brand-accent"
                          : "bg-muted border-2 border-border"
                      }`}
                    >
                      {achieved ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : isNext ? (
                        <Star className="w-4 h-4 text-brand-accent" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium ${achieved ? "text-foreground" : "text-muted-foreground"}`}>
                          {milestone.name}
                        </p>
                        {achieved && (
                          <Badge variant="default" className="text-xs">Achieved</Badge>
                        )}
                        {isNext && (
                          <Badge variant="outline" className="text-xs text-brand-accent">
                            Next — {milestone.hours - totalHours} hrs to go
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{milestone.description}</p>
                      {!achieved && (
                        <div className="mt-1 w-full max-w-xs bg-muted rounded-full h-1.5">
                          <div
                            className="bg-brand-accent h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other Achievements */}
      {recordedMilestones && recordedMilestones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Achievement Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recordedMilestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-3 py-2 rounded-md bg-green-500/5"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    {m.description && (
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(m.achieved_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
