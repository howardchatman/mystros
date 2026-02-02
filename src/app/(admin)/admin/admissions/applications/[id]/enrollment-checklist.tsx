"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, CheckCircle, Circle } from "lucide-react";

interface DocType {
  id: string;
  name: string;
  code: string;
}

interface EnrollmentChecklistProps {
  requiredDocuments: DocType[];
  applicantName: string;
}

export function EnrollmentChecklist({ requiredDocuments, applicantName }: EnrollmentChecklistProps) {
  const items = [
    ...requiredDocuments.map((d) => ({ id: `doc-${d.id}`, label: `${d.name} received` })),
    { id: "enrollment-agreement", label: "Enrollment agreement signed" },
    { id: "orientation-scheduled", label: "Orientation scheduled" },
  ];

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const completed = Object.values(checked).filter(Boolean).length;
  const allDone = completed === items.length && items.length > 0;

  return (
    <Card className={allDone ? "border-green-500/50" : ""}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          Enrollment Checklist
        </CardTitle>
        <Badge variant={allDone ? "default" : "outline"}>
          {completed}/{items.length} complete
        </Badge>
      </CardHeader>
      <CardContent>
        {allDone && (
          <div className="mb-4 rounded-md px-3 py-2 text-sm bg-green-500/10 text-green-600 font-medium">
            {applicantName} is ready to enroll — all checklist items complete.
          </div>
        )}
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              {checked[item.id] ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-muted-foreground shrink-0" />
              )}
              <span className={`text-sm ${checked[item.id] ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
