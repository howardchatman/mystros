"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AbandonedActionsProps {
  applicationId: string;
  email: string;
  firstName: string;
}

export function AbandonedActions({
  applicationId,
  email,
  firstName,
}: AbandonedActionsProps) {
  const [sending, setSending] = useState(false);

  async function handleSendReminder() {
    setSending(true);
    try {
      const res = await fetch("/api/admin/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          email,
          firstName,
          sequenceCode: "application_reminder",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to send reminder");
        return;
      }

      toast.success("Reminder email sent successfully");
    } catch {
      toast.error("Failed to send reminder");
    } finally {
      setSending(false);
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSendReminder}
      disabled={sending}
    >
      {sending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Send className="w-4 h-4 mr-1" />
          Send Reminder
        </>
      )}
    </Button>
  );
}
