"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  personalInfoSchema,
  type PersonalInfoData,
} from "@/lib/validations/application";

interface StepPersonalInfoProps {
  defaultValues: Record<string, any>;
  onSubmit: (data: PersonalInfoData) => void;
  isSubmitting: boolean;
}

export function StepPersonalInfo({
  defaultValues,
  onSubmit,
  isSubmitting,
}: StepPersonalInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: defaultValues["firstName"] || "",
      middleName: defaultValues["middleName"] || "",
      lastName: defaultValues["lastName"] || "",
      preferredName: defaultValues["preferredName"] || "",
      dateOfBirth: defaultValues["dateOfBirth"] || "",
      gender: defaultValues["gender"] || undefined,
    },
  });

  return (
    <form
      id="intake-step-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register("firstName")}
          label="First Name *"
          placeholder="John"
          error={errors.firstName?.message}
          disabled={isSubmitting}
        />

        <Input
          {...register("middleName")}
          label="Middle Name"
          placeholder="Michael"
          error={errors.middleName?.message}
          disabled={isSubmitting}
        />

        <Input
          {...register("lastName")}
          label="Last Name *"
          placeholder="Doe"
          error={errors.lastName?.message}
          disabled={isSubmitting}
        />

        <Input
          {...register("preferredName")}
          label="Preferred Name"
          placeholder="Johnny"
          error={errors.preferredName?.message}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          {...register("dateOfBirth")}
          type="date"
          label="Date of Birth *"
          error={errors.dateOfBirth?.message}
          disabled={isSubmitting}
        />

        <div className="w-full">
          <label className="mb-2 block text-sm font-medium text-brand-text">
            Gender
          </label>
          <select
            {...register("gender")}
            className="flex h-11 w-full rounded-lg border bg-brand-elevated px-4 py-2 text-sm text-brand-text border-white/10 focus:border-brand-accent focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            disabled={isSubmitting}
          >
            <option value="">Select gender (optional)</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="non_binary">Non-binary</option>
            <option value="prefer_not_to_say">Prefer not to say</option>
          </select>
          {errors.gender && (
            <p className="mt-1.5 text-xs text-red-400">
              {errors.gender.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
