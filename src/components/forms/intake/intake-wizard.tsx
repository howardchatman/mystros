"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import { stepNames } from "@/lib/validations/application";
import {
  updateApplicationStep,
  submitApplication,
} from "@/lib/actions/applications";

import { StepPersonalInfo } from "./step-personal-info";
import { StepContactInfo } from "./step-contact-info";
import { StepEducation } from "./step-education";
import { StepProgramSelection } from "./step-program-selection";
import { StepBackground } from "./step-background";

interface IntakeWizardProps {
  application: any;
  campuses: any[];
  programs: any[];
}

export function IntakeWizard({
  application,
  campuses,
  programs,
}: IntakeWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data from existing application
  useEffect(() => {
    if (application) {
      setFormData({
        firstName: application.first_name || "",
        middleName: application.middle_name || "",
        lastName: application.last_name || "",
        preferredName: application.preferred_name || "",
        dateOfBirth: application.date_of_birth || "",
        gender: application.gender || undefined,
        email: application.email || "",
        phone: application.phone || "",
        addressLine1: application.address_line1 || "",
        addressLine2: application.address_line2 || "",
        city: application.city || "",
        state: application.state || "",
        zip: application.zip || "",
        emergencyContactName: application.emergency_contact_name || "",
        emergencyContactPhone: application.emergency_contact_phone || "",
        emergencyContactRelationship:
          application.emergency_contact_relationship || "",
        highSchoolName: application.high_school_name || "",
        highSchoolCity: application.high_school_city || "",
        highSchoolState: application.high_school_state || "",
        graduationYear: application.graduation_year || null,
        gedCompletionDate: application.ged_completion_date || "",
        highestEducation: application.highest_education || "high_school",
        campusId: application.campus_id || "",
        programId: application.program_id || "",
        scheduleId: application.schedule_id || "",
        desiredStartDate: application.desired_start_date || "",
        hasFelonyConviction: application.has_felony_conviction ?? false,
        felonyExplanation: application.felony_explanation || "",
        previousBarberTraining: application.previous_barber_training ?? false,
        previousTrainingDetails: application.previous_training_details || "",
      });
    }
  }, [application]);

  const handleStepSubmit = async (stepData: Record<string, any>) => {
    // Merge step data with existing form data
    const newFormData = { ...formData, ...stepData };
    setFormData(newFormData);

    // Save to database
    setIsSubmitting(true);
    try {
      const result = await updateApplicationStep(application.id, stepData);

      if (!result.success) {
        toast.error(result.error || "Failed to save. Please try again.");
        return;
      }

      // Move to next step or submit
      if (currentStep < stepNames.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final step - submit the application
        const submitResult = await submitApplication(application.id);

        if (!submitResult.success) {
          toast.error(submitResult.error || "Failed to submit. Please try again.");
          return;
        }

        toast.success("Application submitted successfully!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    const commonProps = {
      defaultValues: formData,
      onSubmit: handleStepSubmit,
      isSubmitting,
    };

    switch (currentStep) {
      case 0:
        return <StepPersonalInfo {...commonProps} />;
      case 1:
        return <StepContactInfo {...commonProps} />;
      case 2:
        return <StepEducation {...commonProps} />;
      case 3:
        return (
          <StepProgramSelection
            {...commonProps}
            campuses={campuses}
            programs={programs}
          />
        );
      case 4:
        return <StepBackground {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {stepNames.map((name, index) => (
          <div key={name} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  index < currentStep
                    ? "bg-green-500 text-white"
                    : index === currentStep
                    ? "bg-brand-accent text-white"
                    : "bg-brand-elevated text-brand-muted border border-white/10"
                )}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs hidden sm:block",
                  index === currentStep
                    ? "text-brand-text font-medium"
                    : "text-brand-muted"
                )}
              >
                {name}
              </span>
            </div>

            {index < stepNames.length - 1 && (
              <div
                className={cn(
                  "w-12 sm:w-20 h-0.5 mx-2",
                  index < currentStep ? "bg-green-500" : "bg-white/10"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <Card>
        <CardHeader>
          <CardTitle>{stepNames[currentStep]}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStep()}

          {/* Navigation buttons */}
          <div className="flex justify-between mt-6 pt-6 border-t border-white/10">
            <Button
              type="button"
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0 || isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <Button
              type="submit"
              form="intake-step-form"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : currentStep === stepNames.length - 1 ? (
                "Submit Application"
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
