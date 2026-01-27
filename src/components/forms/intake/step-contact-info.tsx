"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import {
  contactInfoSchema,
  type ContactInfoData,
} from "@/lib/validations/application";

interface StepContactInfoProps {
  defaultValues: Record<string, any>;
  onSubmit: (data: ContactInfoData) => void;
  isSubmitting: boolean;
}

export function StepContactInfo({
  defaultValues,
  onSubmit,
  isSubmitting,
}: StepContactInfoProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInfoData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: defaultValues["email"] || "",
      phone: defaultValues["phone"] || "",
      addressLine1: defaultValues["addressLine1"] || "",
      addressLine2: defaultValues["addressLine2"] || "",
      city: defaultValues["city"] || "",
      state: defaultValues["state"] || "",
      zip: defaultValues["zip"] || "",
      emergencyContactName: defaultValues["emergencyContactName"] || "",
      emergencyContactPhone: defaultValues["emergencyContactPhone"] || "",
      emergencyContactRelationship:
        defaultValues["emergencyContactRelationship"] || "",
    },
  });

  return (
    <form
      id="intake-step-form"
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6"
    >
      {/* Contact Information */}
      <div>
        <h3 className="text-sm font-medium text-brand-muted mb-3">
          Contact Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            {...register("email")}
            type="email"
            label="Email Address *"
            placeholder="john@example.com"
            error={errors.email?.message}
            disabled={isSubmitting}
          />

          <Input
            {...register("phone")}
            type="tel"
            label="Phone Number *"
            placeholder="8325551234"
            error={errors.phone?.message}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-sm font-medium text-brand-muted mb-3">
          Mailing Address
        </h3>
        <div className="space-y-4">
          <Input
            {...register("addressLine1")}
            label="Street Address *"
            placeholder="123 Main St"
            error={errors.addressLine1?.message}
            disabled={isSubmitting}
          />

          <Input
            {...register("addressLine2")}
            label="Apt, Suite, Unit (Optional)"
            placeholder="Apt 4B"
            error={errors.addressLine2?.message}
            disabled={isSubmitting}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="col-span-2">
              <Input
                {...register("city")}
                label="City *"
                placeholder="Houston"
                error={errors.city?.message}
                disabled={isSubmitting}
              />
            </div>

            <Input
              {...register("state")}
              label="State *"
              placeholder="TX"
              maxLength={2}
              error={errors.state?.message}
              disabled={isSubmitting}
            />

            <Input
              {...register("zip")}
              label="ZIP *"
              placeholder="77001"
              error={errors.zip?.message}
              disabled={isSubmitting}
            />
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-sm font-medium text-brand-muted mb-3">
          Emergency Contact
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            {...register("emergencyContactName")}
            label="Contact Name *"
            placeholder="Jane Doe"
            error={errors.emergencyContactName?.message}
            disabled={isSubmitting}
          />

          <Input
            {...register("emergencyContactPhone")}
            type="tel"
            label="Contact Phone *"
            placeholder="8325551234"
            error={errors.emergencyContactPhone?.message}
            disabled={isSubmitting}
          />

          <Input
            {...register("emergencyContactRelationship")}
            label="Relationship *"
            placeholder="Mother"
            error={errors.emergencyContactRelationship?.message}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </form>
  );
}
