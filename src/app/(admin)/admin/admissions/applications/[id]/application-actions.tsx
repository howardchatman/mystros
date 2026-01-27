"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, UserPlus, Loader2 } from "lucide-react";
import { reviewApplication, enrollStudent } from "@/lib/actions/admin-students";
import { toast } from "sonner";

interface ApplicationActionsProps {
  applicationId: string;
  status: string;
  applicantName: string;
}

export function ApplicationActions({ applicationId, status, applicantName }: ApplicationActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [showDenyForm, setShowDenyForm] = useState(false);
  const [showEnrollForm, setShowEnrollForm] = useState(false);

  const handleAccept = () => {
    startTransition(async () => {
      const result = await reviewApplication(applicationId, "accepted");
      if (result.success) {
        toast.success(`Application accepted for ${applicantName}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to accept application");
      }
    });
  };

  const handleDeny = () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for denial");
      return;
    }

    startTransition(async () => {
      const result = await reviewApplication(applicationId, "denied", reason);
      if (result.success) {
        toast.success(`Application denied for ${applicantName}`);
        router.refresh();
      } else {
        toast.error(result.error || "Failed to deny application");
      }
    });
  };

  const handleEnroll = () => {
    if (!startDate) {
      toast.error("Please select a start date");
      return;
    }

    startTransition(async () => {
      const result = await enrollStudent(applicationId, startDate);
      if (result.success) {
        toast.success(
          `${applicantName} has been enrolled! Student ID: ${result.studentNumber}`
        );
        router.push(`/admin/students/${result.studentId}`);
      } else {
        toast.error(result.error || "Failed to enroll student");
      }
    });
  };

  // Pending Review Actions
  if (status === "applicant") {
    return (
      <Card className="border-yellow-500/30 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-lg">Review Application</CardTitle>
          <CardDescription>
            Review this application and make an admission decision
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showDenyForm ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Reason for Denial</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Please provide a reason..."
                  className="mt-1 w-full h-24 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="destructive"
                  onClick={handleDeny}
                  disabled={isPending}
                >
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Confirm Denial
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDenyForm(false);
                    setReason("");
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <Button onClick={handleAccept} disabled={isPending} className="flex-1">
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Accept Application
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDenyForm(true)}
                disabled={isPending}
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Deny Application
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Accepted - Ready to Enroll
  if (status === "accepted") {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="text-lg">Ready to Enroll</CardTitle>
          <CardDescription>
            This application has been accepted. Complete the enrollment to create a student record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showEnrollForm ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleEnroll} disabled={isPending}>
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Complete Enrollment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEnrollForm(false);
                    setStartDate("");
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setShowEnrollForm(true)} disabled={isPending}>
              <UserPlus className="w-4 h-4 mr-2" />
              Enroll Student
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
