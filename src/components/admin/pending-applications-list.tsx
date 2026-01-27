"use client";

import { FileText, Mail, Phone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import Link from "next/link";

interface Application {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  submitted_at: string;
  campus?: { name: string }[] | { name: string } | null;
  program?: { name: string }[] | { name: string } | null;
}

interface PendingApplicationsListProps {
  applications: Application[];
}

export function PendingApplicationsList({
  applications,
}: PendingApplicationsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium">Pending Applications</CardTitle>
        <Link href="/admin/admissions/applications">
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <p className="text-sm text-brand-muted text-center py-6">
            No pending applications
          </p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 rounded-lg bg-brand-bg/50 hover:bg-brand-bg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-accent/20 flex items-center justify-center">
                    <span className="text-sm font-medium text-brand-accent">
                      {app.first_name[0]}
                      {app.last_name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-brand-text">
                      {app.first_name} {app.last_name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-brand-muted">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {app.email}
                      </span>
                      {app.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {app.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs text-brand-muted">
                    {Array.isArray(app.program) ? app.program[0]?.name : app.program?.name || "No program"}
                  </p>
                  <p className="text-xs text-brand-muted">
                    {format(parseISO(app.submitted_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
