"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { ClipboardCheck } from "lucide-react";
import {
  getStudentCompetencies,
  markCompetencyComplete,
  unmarkCompetency,
} from "@/lib/actions/competencies";

interface CompetencyDef {
  id: string;
  category: string;
  name: string;
  sort_order: number;
  milestone_hours: number | null;
  is_required: boolean;
}

interface StudentComp {
  competency_definition_id: string;
  completed_at: string | null;
}

interface StudentCompetenciesSectionProps {
  studentId: string;
  programId?: string;
}

export function StudentCompetenciesSection({
  studentId,
  programId,
}: StudentCompetenciesSectionProps) {
  const [definitions, setDefinitions] = useState<CompetencyDef[]>([]);
  const [progress, setProgress] = useState<StudentComp[]>([]);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (!programId) return;
    let cancelled = false;
    getStudentCompetencies(studentId, programId).then((data) => {
      if (!cancelled) {
        setDefinitions(data.definitions);
        setProgress(data.progress);
      }
    });
    return () => { cancelled = true; };
  }, [studentId, programId]);

  if (!programId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No program assigned — cannot show competencies
        </CardContent>
      </Card>
    );
  }

  // Group by category
  const categories = new Map<string, CompetencyDef[]>();
  for (const def of definitions) {
    const list = categories.get(def.category) || [];
    list.push(def);
    categories.set(def.category, list);
  }

  const completedIds = new Set(
    progress.filter((p) => p.completed_at).map((p) => p.competency_definition_id)
  );

  const totalRequired = definitions.filter((d) => d.is_required).length;
  const completedRequired = definitions.filter(
    (d) => d.is_required && completedIds.has(d.id)
  ).length;
  const overallProgress =
    totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;

  const handleToggle = (defId: string, isCompleted: boolean) => {
    setPendingId(defId);
    startTransition(async () => {
      if (isCompleted) {
        await unmarkCompetency(studentId, defId);
      } else {
        await markCompetencyComplete(studentId, defId);
      }
      // Refresh
      const data = await getStudentCompetencies(studentId, programId);
      setProgress(data.progress);
      setPendingId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Overall progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Overall Competency Progress</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {completedRequired} / {totalRequired} required skills
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
          <p className="text-right text-xs text-muted-foreground mt-1">
            {overallProgress.toFixed(0)}% complete
          </p>
        </CardContent>
      </Card>

      {/* Categories */}
      {Array.from(categories.entries()).map(([category, defs]) => {
        const catCompleted = defs.filter((d) => completedIds.has(d.id)).length;
        const catProgress = defs.length > 0 ? (catCompleted / defs.length) * 100 : 0;

        return (
          <Card key={category}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{category}</CardTitle>
                <span className="text-xs text-muted-foreground">
                  {catCompleted}/{defs.length} ({catProgress.toFixed(0)}%)
                </span>
              </div>
              <Progress value={catProgress} className="h-1.5" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {defs
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((def) => {
                    const isCompleted = completedIds.has(def.id);
                    const isLoading = isPending && pendingId === def.id;

                    return (
                      <button
                        key={def.id}
                        onClick={() => handleToggle(def.id, isCompleted)}
                        disabled={isLoading}
                        className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-colors ${
                          isCompleted
                            ? "bg-green-500/5 hover:bg-green-500/10"
                            : "hover:bg-muted/50"
                        } ${isLoading ? "opacity-50" : ""}`}
                      >
                        <Checkbox checked={isCompleted} />
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              isCompleted
                                ? "text-muted-foreground line-through"
                                : "text-foreground"
                            }`}
                          >
                            {def.name}
                          </p>
                          {def.milestone_hours && (
                            <p className="text-xs text-muted-foreground">
                              Target: {def.milestone_hours} hrs
                            </p>
                          )}
                        </div>
                        {def.is_required && !isCompleted && (
                          <span className="text-xs text-red-500 font-medium">Required</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
