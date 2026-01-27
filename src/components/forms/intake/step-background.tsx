"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  backgroundSchema,
  type BackgroundData,
} from "@/lib/validations/application";

interface StepBackgroundProps {
  defaultValues: Record<string, any>;
  onSubmit: (data: BackgroundData) => void;
  isSubmitting: boolean;
}

export function StepBackground({
  defaultValues,
  onSubmit,
  isSubmitting,
}: StepBackgroundProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BackgroundData>({
    resolver: zodResolver(backgroundSchema),
    defaultValues: {
      hasFelonyConviction: defaultValues["hasFelonyConviction"] ?? false,
      felonyExplanation: defaultValues["felonyExplanation"] || "",
      previousBarberTraining: defaultValues["previousBarberTraining"] ?? false,
      previousTrainingDetails: defaultValues["previousTrainingDetails"] || "",
    },
  });

  const hasFelony = watch("hasFelonyConviction");
  const hasPreviousTraining = watch("previousBarberTraining");

  return (
    <form
      id="intake-step-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Felony Question */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-brand-text">
          Have you ever been convicted of a felony? *
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register("hasFelonyConviction", { setValueAs: (v) => v === "true" })}
              value="true"
              className="w-4 h-4 text-brand-accent bg-brand-elevated border-white/20 focus:ring-brand-accent"
              disabled={isSubmitting}
            />
            <span className="text-sm text-brand-text">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register("hasFelonyConviction", { setValueAs: (v) => v === "true" })}
              value="false"
              className="w-4 h-4 text-brand-accent bg-brand-elevated border-white/20 focus:ring-brand-accent"
              disabled={isSubmitting}
            />
            <span className="text-sm text-brand-text">No</span>
          </label>
        </div>
        {errors.hasFelonyConviction && (
          <p className="text-xs text-red-400">
            {errors.hasFelonyConviction.message}
          </p>
        )}
      </div>

      {/* Felony Explanation */}
      {hasFelony && (
        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-brand-text">
            Please explain the circumstances
          </label>
          <textarea
            {...register("felonyExplanation")}
            rows={4}
            className="flex w-full rounded-lg border bg-brand-elevated px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted border-white/10 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20 resize-none"
            placeholder="Please provide details about the conviction..."
            disabled={isSubmitting}
          />
          {errors.felonyExplanation && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.felonyExplanation.message}
            </p>
          )}
        </div>
      )}

      {/* Previous Training Question */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-brand-text">
          Have you had any previous barber or cosmetology training? *
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register("previousBarberTraining", { setValueAs: (v) => v === "true" })}
              value="true"
              className="w-4 h-4 text-brand-accent bg-brand-elevated border-white/20 focus:ring-brand-accent"
              disabled={isSubmitting}
            />
            <span className="text-sm text-brand-text">Yes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              {...register("previousBarberTraining", { setValueAs: (v) => v === "true" })}
              value="false"
              className="w-4 h-4 text-brand-accent bg-brand-elevated border-white/20 focus:ring-brand-accent"
              disabled={isSubmitting}
            />
            <span className="text-sm text-brand-text">No</span>
          </label>
        </div>
        {errors.previousBarberTraining && (
          <p className="text-xs text-red-400">
            {errors.previousBarberTraining.message}
          </p>
        )}
      </div>

      {/* Previous Training Details */}
      {hasPreviousTraining && (
        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-brand-text">
            Please describe your previous training
          </label>
          <textarea
            {...register("previousTrainingDetails")}
            rows={4}
            className="flex w-full rounded-lg border bg-brand-elevated px-4 py-3 text-sm text-brand-text placeholder:text-brand-muted border-white/10 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20 resize-none"
            placeholder="School name, hours completed, dates attended..."
            disabled={isSubmitting}
          />
          {errors.previousTrainingDetails && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.previousTrainingDetails.message}
            </p>
          )}
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-lg bg-brand-gold/10 border border-brand-gold/20">
        <p className="text-sm text-brand-muted">
          <strong className="text-brand-gold">Important:</strong> By submitting
          this application, you certify that all information provided is true
          and accurate to the best of your knowledge. Providing false information
          may result in denial of admission or dismissal from the program.
        </p>
      </div>
    </form>
  );
}
