"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  programSelectionSchema,
  type ProgramSelectionData,
} from "@/lib/validations/application";
import { getSchedules } from "@/lib/actions/applications";

interface StepProgramSelectionProps {
  defaultValues: Record<string, any>;
  onSubmit: (data: ProgramSelectionData) => void;
  isSubmitting: boolean;
  campuses: any[];
  programs: any[];
}

export function StepProgramSelection({
  defaultValues,
  onSubmit,
  isSubmitting,
  campuses,
  programs,
}: StepProgramSelectionProps) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProgramSelectionData>({
    resolver: zodResolver(programSelectionSchema),
    defaultValues: {
      campusId: defaultValues["campusId"] || "",
      programId: defaultValues["programId"] || "",
      scheduleId: defaultValues["scheduleId"] || "",
      desiredStartDate: defaultValues["desiredStartDate"] || "",
    },
  });

  const selectedProgramId = watch("programId");

  // Load schedules when program changes
  useEffect(() => {
    if (selectedProgramId) {
      setLoadingSchedules(true);
      getSchedules(selectedProgramId)
        .then(({ schedules: data }) => {
          setSchedules(data);
          // Reset schedule selection if current one is not valid
          if (!data.find((s: any) => s.id === defaultValues["scheduleId"])) {
            setValue("scheduleId", "");
          }
        })
        .finally(() => setLoadingSchedules(false));
    } else {
      setSchedules([]);
    }
  }, [selectedProgramId, defaultValues["scheduleId"], setValue]);

  const selectedProgram = programs.find((p) => p.id === selectedProgramId);

  return (
    <form
      id="intake-step-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Campus Selection */}
      <div className="w-full">
        <label className="mb-2 block text-sm font-medium text-brand-text">
          Campus Location *
        </label>
        <select
          {...register("campusId")}
          className="flex h-11 w-full rounded-lg border bg-brand-elevated px-4 py-2 text-sm text-brand-text border-white/10 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          disabled={isSubmitting}
        >
          <option value="">Select a campus</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.name} - {campus.city}
            </option>
          ))}
        </select>
        {errors.campusId && (
          <p className="mt-1.5 text-xs text-red-400">{errors.campusId.message}</p>
        )}
      </div>

      {/* Program Selection */}
      <div className="w-full">
        <label className="mb-2 block text-sm font-medium text-brand-text">
          Program *
        </label>
        <select
          {...register("programId")}
          className="flex h-11 w-full rounded-lg border bg-brand-elevated px-4 py-2 text-sm text-brand-text border-white/10 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          disabled={isSubmitting}
        >
          <option value="">Select a program</option>
          {programs.map((program) => (
            <option key={program.id} value={program.id}>
              {program.name} ({program.total_hours} hours)
            </option>
          ))}
        </select>
        {errors.programId && (
          <p className="mt-1.5 text-xs text-red-400">{errors.programId.message}</p>
        )}
      </div>

      {/* Program Details */}
      {selectedProgram && (
        <div className="p-4 rounded-lg bg-brand-primary/20 border border-brand-accent/20">
          <h4 className="text-sm font-medium text-brand-text mb-2">
            Program Details
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-brand-muted">Total Hours:</span>{" "}
              <span className="text-brand-text">{selectedProgram.total_hours}</span>
            </div>
            <div>
              <span className="text-brand-muted">Tuition:</span>{" "}
              <span className="text-brand-text">
                ${selectedProgram.tuition_amount?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Selection */}
      <div className="w-full">
        <label className="mb-2 block text-sm font-medium text-brand-text">
          Schedule *
        </label>
        <select
          {...register("scheduleId")}
          className="flex h-11 w-full rounded-lg border bg-brand-elevated px-4 py-2 text-sm text-brand-text border-white/10 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20 disabled:opacity-50"
          disabled={isSubmitting || !selectedProgramId || loadingSchedules}
        >
          <option value="">
            {loadingSchedules
              ? "Loading schedules..."
              : !selectedProgramId
              ? "Select a program first"
              : "Select a schedule"}
          </option>
          {schedules.map((schedule) => (
            <option key={schedule.id} value={schedule.id}>
              {schedule.name} ({schedule.hours_per_week} hrs/week,{" "}
              {schedule.days_per_week} days)
            </option>
          ))}
        </select>
        {errors.scheduleId && (
          <p className="mt-1.5 text-xs text-red-400">{errors.scheduleId.message}</p>
        )}
      </div>

      {/* Start Date */}
      <Input
        {...register("desiredStartDate")}
        type="date"
        label="Desired Start Date *"
        min={new Date().toISOString().split("T")[0]}
        error={errors.desiredStartDate?.message}
        disabled={isSubmitting}
      />
    </form>
  );
}
