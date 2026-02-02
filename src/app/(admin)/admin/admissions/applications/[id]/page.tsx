import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getApplicationById } from "@/lib/actions/admin-students";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  GraduationCap,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { ApplicationActions } from "./application-actions";
import { EnrollmentChecklist } from "./enrollment-checklist";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    applicant: { variant: "outline", label: "Pending Review" },
    accepted: { variant: "default", label: "Accepted" },
    denied: { variant: "destructive", label: "Denied" },
    enrolled: { variant: "secondary", label: "Enrolled" },
  };

  const { variant, label } = config[status] || { variant: "outline" as const, label: status };

  return <Badge variant={variant}>{label}</Badge>;
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { application, error } = await getApplicationById(id);

  if (error || !application) {
    notFound();
  }

  // Fetch required documents for checklist
  let requiredDocuments: { id: string; name: string; code: string }[] = [];
  if (application.status === "accepted") {
    const supabase = await createClient();
    const { data: docs } = await supabase
      .from("document_types")
      .select("id, name, code")
      .eq("is_required", true)
      .eq("is_active", true)
      .order("name");
    requiredDocuments = (docs || []) as any[];
  }

  const campus = application.campus as { name?: string } | null;
  const program = application.program as { name?: string; total_hours?: number; tuition_amount?: number } | null;
  const schedule = application.schedule as { name?: string } | null;

  const canReview = application.status === "applicant" && application.submitted_at;
  const canEnroll = application.status === "accepted";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/admissions/applications">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {application.first_name} {application.last_name}
              </h1>
              {getStatusBadge(application.status)}
            </div>
            <p className="text-muted-foreground">
              Application submitted {formatDate(application.submitted_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions Card */}
      {(canReview || canEnroll) && (
        <ApplicationActions
          applicationId={application.id}
          status={application.status}
          applicantName={`${application.first_name} ${application.last_name}`}
        />
      )}

      {/* Enrollment Checklist for Accepted Applications */}
      {application.status === "accepted" && (
        <EnrollmentChecklist
          requiredDocuments={requiredDocuments}
          applicantName={`${application.first_name} ${application.last_name}`}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid sm:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-muted-foreground">Full Name</dt>
                  <dd className="text-foreground font-medium">
                    {application.first_name} {application.middle_name || ""} {application.last_name}
                  </dd>
                </div>
                {application.preferred_name && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Preferred Name</dt>
                    <dd className="text-foreground">{application.preferred_name}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm text-muted-foreground">Date of Birth</dt>
                  <dd className="text-foreground">{formatDate(application.date_of_birth)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">Gender</dt>
                  <dd className="text-foreground capitalize">{application.gender || "Not specified"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd className="text-foreground">{application.email}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd className="text-foreground">{application.phone}</dd>
                  </div>
                </div>
                <div className="sm:col-span-2 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Address</dt>
                    <dd className="text-foreground">
                      {application.address_line1}
                      {application.address_line2 && <>, {application.address_line2}</>}
                      <br />
                      {application.city}, {application.state} {application.zip}
                    </dd>
                  </div>
                </div>
              </dl>

              {/* Emergency Contact */}
              {application.emergency_contact_name && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Emergency Contact</h4>
                  <dl className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <dt className="text-sm text-muted-foreground">Name</dt>
                      <dd className="text-foreground">{application.emergency_contact_name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Phone</dt>
                      <dd className="text-foreground">{application.emergency_contact_phone}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Relationship</dt>
                      <dd className="text-foreground capitalize">{application.emergency_contact_relationship}</dd>
                    </div>
                  </dl>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid sm:grid-cols-2 gap-4">
                {application.high_school_name && (
                  <div className="sm:col-span-2">
                    <dt className="text-sm text-muted-foreground">High School</dt>
                    <dd className="text-foreground">
                      {application.high_school_name}
                      {application.high_school_city && (
                        <span className="text-muted-foreground">
                          {" "}
                          - {application.high_school_city}, {application.high_school_state}
                        </span>
                      )}
                    </dd>
                  </div>
                )}
                {application.graduation_year && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Graduation Year</dt>
                    <dd className="text-foreground">{application.graduation_year}</dd>
                  </div>
                )}
                {application.ged_completion_date && (
                  <div>
                    <dt className="text-sm text-muted-foreground">GED Completion</dt>
                    <dd className="text-foreground">{formatDate(application.ged_completion_date)}</dd>
                  </div>
                )}
                {application.highest_education && (
                  <div>
                    <dt className="text-sm text-muted-foreground">Highest Education</dt>
                    <dd className="text-foreground capitalize">
                      {application.highest_education.replace("_", " ")}
                    </dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Background */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Background Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                {application.has_felony_conviction ? (
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                )}
                <div>
                  <p className="text-foreground font-medium">
                    {application.has_felony_conviction
                      ? "Has disclosed a felony conviction"
                      : "No felony convictions disclosed"}
                  </p>
                  {application.felony_explanation && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {application.felony_explanation}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                {application.previous_barber_training ? (
                  <GraduationCap className="w-5 h-5 text-blue-500 mt-0.5" />
                ) : (
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                )}
                <div>
                  <p className="text-foreground font-medium">
                    {application.previous_barber_training
                      ? "Has previous barber training"
                      : "No previous barber training"}
                  </p>
                  {application.previous_training_details && (
                    <p className="text-muted-foreground text-sm mt-1">
                      {application.previous_training_details}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Program & Status */}
        <div className="space-y-6">
          {/* Program Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Program Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <dt className="text-sm text-muted-foreground">Campus</dt>
                <dd className="text-foreground font-medium">{campus?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Program</dt>
                <dd className="text-foreground font-medium">{program?.name || "—"}</dd>
                {program?.total_hours && (
                  <p className="text-sm text-muted-foreground">{program.total_hours} hours</p>
                )}
              </div>
              {schedule && (
                <div>
                  <dt className="text-sm text-muted-foreground">Schedule</dt>
                  <dd className="text-foreground">{schedule.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground">Desired Start Date</dt>
                <dd className="text-foreground">{formatDate(application.desired_start_date)}</dd>
              </div>
              {program?.tuition_amount && (
                <div className="pt-4 border-t border-border">
                  <dt className="text-sm text-muted-foreground">Program Tuition</dt>
                  <dd className="text-2xl font-bold text-foreground">
                    ${program.tuition_amount.toLocaleString()}
                  </dd>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Application Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="text-foreground font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(application.created_at)}
                    </p>
                  </div>
                </div>
                {application.submitted_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="text-foreground font-medium">Submitted</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(application.submitted_at)}
                      </p>
                    </div>
                  </div>
                )}
                {application.reviewed_at && (
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        application.status === "accepted" ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <div>
                      <p className="text-foreground font-medium capitalize">
                        {application.status === "accepted" ? "Accepted" : "Denied"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(application.reviewed_at)}
                      </p>
                      {application.decision_reason && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {application.decision_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
