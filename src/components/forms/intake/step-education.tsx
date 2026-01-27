"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  educationSchema,
  type EducationData,
} from "@/lib/validations/application";

interface StepEducationProps {
  defaultValues: Record<string, any>;
  onSubmit: (data: EducationData) => void;
  isSubmitting: boolean;
}

export function StepEducation({
  defaultValues,
  onSubmit,
  isSubmitting,
}: StepEducationProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<EducationData>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      highSchoolName: defaultValues["highSchoolName"] || "",
      highSchoolCity: defaultValues["highSchoolCity"] || "",
      highSchoolState: defaultValues["highSchoolState"] || "",
      graduationYear: defaultValues["graduationYear"] || null,
      gedCompletionDate: defaultValues["gedCompletionDate"] || "",
      highestEducation: defaultValues["highestEducation"] || "high_school",
    },
  });

  const highestEducation = watch("highestEducation");

  return (
    <form
      id="intake-step-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Highest Education */}
      <div className="w-full">
        <label className="mb-2 block text-sm font-medium text-brand-text">
          Highest Level of Education *
        </label>
        <select
          {...register("highestEducation")}
          className="flex h-11 w-full rounded-lg border bg-brand-elevated px-4 py-2 text-sm text-brand-text border-white/10 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
          disabled={isSubmitting}
        >
          <option value="high_school">High School Diploma</option>
          <option value="ged">GED</option>
          <option value="some_college">Some College</option>
          <option value="associates">Associate&apos;s Degree</option>
          <option value="bachelors">Bachelor&apos;s Degree</option>
          <option value="masters">Master&apos;s Degree</option>
          <option value="doctoral">Doctoral Degree</option>
        </select>
        {errors.highestEducation && (
          <p className="mt-1.5 text-xs text-red-400">
            {errors.highestEducation.message}
          </p>
        )}
      </div>

      {/* High School Information */}
      {highestEducation !== "ged" && (
        <div>
          <h3 className="text-sm font-medium text-brand-muted mb-3">
            High School Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register("highSchoolName")}
              label="High School Name"
              placeholder="Lincoln High School"
              error={errors.highSchoolName?.message}
              disabled={isSubmitting}
            />

            <Input
              {...register("graduationYear", { valueAsNumber: true })}
              type="number"
              label="Graduation Year"
              placeholder="2020"
              min={1950}
              max={2030}
              error={errors.graduationYear?.message}
              disabled={isSubmitting}
            />

            <Input
              {...register("highSchoolCity")}
              label="City"
              placeholder="Houston"
              error={errors.highSchoolCity?.message}
              disabled={isSubmitting}
            />

            <Input
              {...register("highSchoolState")}
              label="State"
              placeholder="TX"
              maxLength={2}
              error={errors.highSchoolState?.message}
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      {/* GED Information */}
      {highestEducation === "ged" && (
        <div>
          <h3 className="text-sm font-medium text-brand-muted mb-3">
            GED Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              {...register("gedCompletionDate")}
              type="date"
              label="GED Completion Date"
              error={errors.gedCompletionDate?.message}
              disabled={isSubmitting}
            />
          </div>
        </div>
      )}

      <div className="p-4 rounded-lg bg-brand-primary/20 border border-brand-accent/20">
        <p className="text-sm text-brand-muted">
          We may request official transcripts or GED certificates during the
          enrollment process. Please ensure the information provided is accurate.
        </p>
      </div>
    </form>
  );
}
