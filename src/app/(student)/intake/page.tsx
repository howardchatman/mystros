import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import {
  getOrCreateApplication,
  getCampuses,
  getPrograms,
} from "@/lib/actions/applications";
import { IntakeWizard } from "@/components/forms/intake/intake-wizard";

export const metadata = {
  title: "Complete Your Application",
  description: "Complete your enrollment application for Mystros Barber Academy",
};

export default async function IntakePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  // Get or create application
  const { application, error: appError } = await getOrCreateApplication();

  if (appError || !application) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-display font-bold text-brand-text mb-4">
          Something went wrong
        </h1>
        <p className="text-brand-muted">
          {appError || "Unable to load your application. Please try again."}
        </p>
      </div>
    );
  }

  // If application is already submitted, redirect to dashboard
  if (application.submitted_at) {
    redirect("/dashboard");
  }

  // Get campuses and programs for the form
  const [{ campuses }, { programs }] = await Promise.all([
    getCampuses(),
    getPrograms(),
  ]);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-brand-text mb-2">
          Complete Your Application
        </h1>
        <p className="text-brand-muted">
          Please fill out the following information to complete your enrollment
          application. Your progress is saved automatically.
        </p>
      </div>

      <IntakeWizard
        application={application}
        campuses={campuses}
        programs={programs}
      />
    </div>
  );
}
