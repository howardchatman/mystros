"use client";

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

interface CampusOption {
  id: string;
  name: string;
}

interface ReportFiltersProps {
  campuses: CampusOption[];
  startDate: string;
  endDate: string;
  campusId: string;
  onStartDateChange: (v: string) => void;
  onEndDateChange: (v: string) => void;
  onCampusChange: (v: string) => void;
  onApply: () => void;
  isPending: boolean;
}

export function ReportFilters({
  campuses, startDate, endDate, campusId,
  onStartDateChange, onEndDateChange, onCampusChange, onApply, isPending,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 p-4 rounded-lg border border-border bg-card">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Start Date</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="block mt-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">End Date</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="block mt-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">Campus</label>
        <select
          value={campusId}
          onChange={(e) => onCampusChange(e.target.value)}
          className="block mt-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm"
        >
          <option value="">All Campuses</option>
          {campuses.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <Button size="sm" onClick={onApply} isLoading={isPending}>
        <Filter className="w-3.5 h-3.5 mr-1" /> Apply Filters
      </Button>
    </div>
  );
}
