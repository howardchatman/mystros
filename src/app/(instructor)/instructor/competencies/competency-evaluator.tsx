"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Award, Search, CheckCircle, ChevronDown, ChevronRight } from "lucide-react";
import { markCompetencyComplete } from "@/lib/actions/competencies";

interface CompetencyDef {
  id: string;
  name: string;
  category: string;
  sort_order: number;
  program_id: string;
}

interface StudentWithCompetencies {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  program_id: string;
  program: any;
  totalCompetencies: number;
  completedCompetencies: number;
  pendingCompetencies: CompetencyDef[];
}

interface Props {
  students: StudentWithCompetencies[];
}

export function CompetencyEvaluator({ students }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    return (
      s.first_name.toLowerCase().includes(q) ||
      s.last_name.toLowerCase().includes(q) ||
      s.student_number.toLowerCase().includes(q)
    );
  });

  const handleMarkComplete = (studentId: string, definitionId: string) => {
    const key = `${studentId}:${definitionId}`;
    setActionId(key);
    startTransition(async () => {
      const result = await markCompetencyComplete(studentId, definitionId);
      if (result.error) {
        alert(result.error);
      }
      setActionId(null);
      router.refresh();
    });
  };

  const programName = (student: StudentWithCompetencies) => {
    const p = student.program as { name?: string } | { name?: string }[] | null;
    return (Array.isArray(p) ? p[0]?.name : p?.name) || "—";
  };

  // Group pending competencies by category
  const groupByCategory = (comps: CompetencyDef[]) => {
    const groups = new Map<string, CompetencyDef[]>();
    for (const c of comps) {
      const cat = c.category || "General";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(c);
    }
    return groups;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Competency Evaluation</h1>
        <p className="text-muted-foreground">Evaluate and sign off on student competencies</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Student list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center py-8 text-muted-foreground">
              {search ? "No students match your search." : "No students with pending competencies."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => {
            const isExpanded = expandedStudent === student.id;
            const percent = student.totalCompetencies > 0
              ? Math.round((student.completedCompetencies / student.totalCompetencies) * 100)
              : 100;
            const categories = groupByCategory(student.pendingCompetencies);

            return (
              <Card key={student.id}>
                <CardHeader className="pb-3">
                  <button
                    className="flex items-center justify-between w-full text-left"
                    onClick={() => setExpandedStudent(isExpanded ? null : student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
                        <span className="text-sm font-medium text-brand-accent">
                          {student.first_name[0]}{student.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {student.first_name} {student.last_name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-mono text-muted-foreground">{student.student_number}</span>
                          <span className="text-xs text-muted-foreground">· {programName(student)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <div className="flex items-center gap-2">
                          <Progress value={percent} className="h-2 w-20" />
                          <span className="text-xs font-medium">{percent}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {student.completedCompetencies}/{student.totalCompetencies} complete
                        </p>
                      </div>
                      {student.pendingCompetencies.length > 0 && (
                        <Badge variant="secondary">{student.pendingCompetencies.length} pending</Badge>
                      )}
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                </CardHeader>
                {isExpanded && (
                  <CardContent>
                    {student.pendingCompetencies.length === 0 ? (
                      <div className="text-center py-4 text-green-500 flex items-center justify-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        All competencies completed!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Array.from(categories.entries()).map(([category, comps]) => (
                          <div key={category}>
                            <h4 className="text-sm font-semibold text-foreground mb-2 capitalize">{category}</h4>
                            <div className="space-y-2">
                              {comps.map((comp) => {
                                const key = `${student.id}:${comp.id}`;
                                return (
                                  <div
                                    key={comp.id}
                                    className="flex items-center justify-between p-2.5 rounded-lg border border-border hover:bg-muted/50"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Award className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-sm">{comp.name}</span>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleMarkComplete(student.id, comp.id)}
                                      isLoading={isPending && actionId === key}
                                      disabled={isPending}
                                    >
                                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                                      Complete
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
