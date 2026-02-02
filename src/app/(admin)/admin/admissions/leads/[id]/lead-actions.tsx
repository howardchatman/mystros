"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateLeadStatus } from "@/lib/actions/admin-students";

interface LeadActionsProps {
  leadId: string;
  status: string;
  notes: string | null;
}

export function LeadActions({ leadId, status, notes }: LeadActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [newNotes, setNewNotes] = useState(notes || "");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function showFB(type: "success" | "error", text: string) {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 3000);
  }

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      const res = await updateLeadStatus(leadId, newStatus, newNotes || undefined);
      if (res.error) showFB("error", res.error);
      else showFB("success", `Lead marked as ${newStatus}`);
    });
  };

  const handleSaveNotes = () => {
    startTransition(async () => {
      const res = await updateLeadStatus(leadId, status, newNotes);
      if (res.error) showFB("error", res.error);
      else showFB("success", "Notes saved");
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback && (
          <div className={`rounded-md px-3 py-2 text-sm ${feedback.type === "success" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}`}>
            {feedback.text}
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-foreground">Notes</label>
          <textarea
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            rows={3}
            className="w-full mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
            placeholder="Add notes about this lead..."
          />
          <Button size="sm" variant="outline" onClick={handleSaveNotes} className="mt-2" isLoading={isPending}>
            Save Notes
          </Button>
        </div>

        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {status === "lead" && (
            <>
              <Button size="sm" onClick={() => handleStatusChange("applicant")} isLoading={isPending}>
                Convert to Applicant
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleStatusChange("lost")} isLoading={isPending}>
                Mark as Lost
              </Button>
            </>
          )}
          {status === "lost" && (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange("lead")} isLoading={isPending}>
              Reopen as Lead
            </Button>
          )}
          {status === "applicant" && (
            <Badge variant="default">Converted to Applicant</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
