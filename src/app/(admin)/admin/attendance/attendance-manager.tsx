"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClockInForm } from "./clock-in-form";
import { ActiveSessions } from "./active-sessions";
import { AttendanceTable } from "./attendance-table";
import { CorrectionRequests } from "./correction-requests";

interface AttendanceManagerProps {
  campuses: { id: string; name: string }[];
  initialCampusId?: string;
  userRole: string;
}

export function AttendanceManager({
  campuses,
  initialCampusId,
  userRole,
}: AttendanceManagerProps) {
  const router = useRouter();
  const [campusId, setCampusId] = useState(initialCampusId || campuses[0]?.id || "");

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
    }, 30_000);
    return () => clearInterval(interval);
  }, [router]);

  const handleRefresh = useCallback(() => {
    router.refresh();
  }, [router]);

  const canManageCorrections = ["superadmin", "campus_admin", "registrar"].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Campus selector */}
      {campuses.length > 1 && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-foreground">Campus:</label>
          <select
            value={campusId}
            onChange={(e) => setCampusId(e.target.value)}
            className="h-9 rounded-md border border-border bg-card px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <Tabs defaultValue="clock" className="w-full">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="clock">Clock In / Out</TabsTrigger>
          <TabsTrigger value="today">Today&apos;s Records</TabsTrigger>
          {canManageCorrections && (
            <TabsTrigger value="corrections">Corrections</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="clock" className="space-y-6">
          <ClockInForm campusId={campusId} onClockIn={handleRefresh} />
          <ActiveSessions campusId={campusId} onClockOut={handleRefresh} />
        </TabsContent>

        <TabsContent value="today">
          <AttendanceTable campusId={campusId} />
        </TabsContent>

        {canManageCorrections && (
          <TabsContent value="corrections">
            <CorrectionRequests onAction={handleRefresh} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
