import { notFound } from "next/navigation";
import Link from "next/link";
import { getLeadById } from "@/lib/actions/admin-students";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, Mail, Calendar, GraduationCap, MapPin } from "lucide-react";
import { LeadActions } from "./lead-actions";

export const metadata = {
  title: "Lead Detail | Admin Dashboard",
};

function formatDate(dateString: string | null) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    lead: "outline",
    applicant: "default",
    lost: "destructive",
  };
  return (
    <Badge variant={variants[status] || "outline"} className="capitalize">
      {status}
    </Badge>
  );
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { lead, error } = await getLeadById(id);

  if (error || !lead) {
    notFound();
  }

  const campus = lead.campus as { name?: string; code?: string } | null;
  const program = lead.program as { name?: string; code?: string } | null;
  const assignedUser = lead.assigned_user as { first_name?: string; last_name?: string; email?: string } | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/admissions/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-display font-bold text-foreground">
                {lead.first_name} {lead.last_name}
              </h1>
              {getStatusBadge(lead.status)}
            </div>
            <p className="text-muted-foreground">
              Lead created {formatDate(lead.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <LeadActions leadId={lead.id} status={lead.status} notes={lead.notes} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd className="text-foreground">{lead.email || "—"}</dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd className="text-foreground">{lead.phone || "—"}</dd>
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              {lead.notes ? (
                <p className="text-foreground whitespace-pre-wrap">{lead.notes}</p>
              ) : (
                <p className="text-muted-foreground">No notes recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Interest */}
          <Card>
            <CardHeader>
              <CardTitle>Interest</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campus && (
                <div>
                  <dt className="text-sm text-muted-foreground">Campus</dt>
                  <dd className="text-foreground font-medium">{campus.name}</dd>
                </div>
              )}
              {program && (
                <div>
                  <dt className="text-sm text-muted-foreground">Program</dt>
                  <dd className="text-foreground font-medium">{program.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted-foreground">Source</dt>
                <dd className="text-foreground capitalize">{lead.source || "—"}</dd>
                {lead.source_detail && (
                  <dd className="text-xs text-muted-foreground">{lead.source_detail}</dd>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedUser ? (
                <div>
                  <p className="text-foreground font-medium">
                    {assignedUser.first_name} {assignedUser.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{assignedUser.email}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Not assigned</p>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="text-foreground font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">{formatDate(lead.created_at)}</p>
                  </div>
                </div>
                {lead.converted_at && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-foreground font-medium">Converted to Applicant</p>
                      <p className="text-sm text-muted-foreground">{formatDate(lead.converted_at)}</p>
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
