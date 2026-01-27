"use client";

import { Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface HoursProgressCardProps {
  student: {
    total_hours_completed: number;
    theory_hours_completed: number;
    practical_hours_completed: number;
  };
  program: {
    total_hours: number;
    theory_hours: number;
    practical_hours: number;
  };
}

export function HoursProgressCard({ student, program }: HoursProgressCardProps) {
  const totalProgress = Math.min(
    (student.total_hours_completed / program.total_hours) * 100,
    100
  );
  const theoryProgress = Math.min(
    (student.theory_hours_completed / program.theory_hours) * 100,
    100
  );
  const practicalProgress = Math.min(
    (student.practical_hours_completed / program.practical_hours) * 100,
    100
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Clock Hours Progress</CardTitle>
        <Clock className="h-5 w-5 text-brand-accent" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Hours */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-brand-muted">Total Hours</span>
            <span className="text-brand-text font-medium">
              {student.total_hours_completed.toFixed(1)} / {program.total_hours}
            </span>
          </div>
          <div className="h-3 bg-brand-bg rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-accent to-brand-accent2 rounded-full transition-all duration-500"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <p className="text-xs text-brand-muted mt-1">
            {totalProgress.toFixed(1)}% complete
          </p>
        </div>

        {/* Theory vs Practical breakdown */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-brand-muted">Theory</span>
              <span className="text-brand-text">
                {student.theory_hours_completed.toFixed(1)} / {program.theory_hours}
              </span>
            </div>
            <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${theoryProgress}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-brand-muted">Practical</span>
              <span className="text-brand-text">
                {student.practical_hours_completed.toFixed(1)} / {program.practical_hours}
              </span>
            </div>
            <div className="h-2 bg-brand-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${practicalProgress}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
