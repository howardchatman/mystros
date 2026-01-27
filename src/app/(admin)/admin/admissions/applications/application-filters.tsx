"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface Campus {
  id: string;
  name: string;
  code: string;
}

interface ApplicationFiltersProps {
  campuses: Campus[];
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "applicant", label: "Pending Review" },
  { value: "accepted", label: "Accepted" },
  { value: "denied", label: "Denied" },
  { value: "enrolled", label: "Enrolled" },
];

const submittedOptions = [
  { value: "", label: "All Applications" },
  { value: "true", label: "Submitted Only" },
  { value: "false", label: "Drafts Only" },
];

export function ApplicationFilters({ campuses }: ApplicationFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [campus, setCampus] = useState(searchParams.get("campus") || "");
  const [submitted, setSubmitted] = useState(searchParams.get("submitted") || "");

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      if (campus) params.set("campus", campus);
      if (submitted) params.set("submitted", submitted);
      router.push(`/admin/admissions/applications?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setStatus("");
    setCampus("");
    setSubmitted("");
    startTransition(() => {
      router.push("/admin/admissions/applications");
    });
  };

  const hasFilters = status || campus || submitted;

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 rounded-lg bg-card border border-border">
      {/* Status */}
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-10 px-3 rounded-md border border-input bg-background text-sm"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Campus */}
      <select
        value={campus}
        onChange={(e) => setCampus(e.target.value)}
        className="h-10 px-3 rounded-md border border-input bg-background text-sm"
      >
        <option value="">All Campuses</option>
        {campuses.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Submitted */}
      <select
        value={submitted}
        onChange={(e) => setSubmitted(e.target.value)}
        className="h-10 px-3 rounded-md border border-input bg-background text-sm"
      >
        {submittedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Apply Button */}
      <Button onClick={applyFilters} disabled={isPending}>
        <Filter className="w-4 h-4 mr-2" />
        Apply
      </Button>

      {/* Clear Button */}
      {hasFilters && (
        <Button variant="ghost" onClick={clearFilters} disabled={isPending}>
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  );
}
