"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";

interface Campus {
  id: string;
  name: string;
  code: string;
}

interface Program {
  id: string;
  name: string;
  code: string;
}

interface StudentFiltersProps {
  campuses: Campus[];
  programs: Program[];
}

const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "enrolled", label: "Enrolled" },
  { value: "graduated", label: "Graduated" },
  { value: "withdrawn", label: "Withdrawn" },
  { value: "loa", label: "Leave of Absence" },
];

export function StudentFilters({ campuses, programs }: StudentFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [campus, setCampus] = useState(searchParams.get("campus") || "");
  const [program, setProgram] = useState(searchParams.get("program") || "");

  const applyFilters = () => {
    startTransition(() => {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (status) params.set("status", status);
      if (campus) params.set("campus", campus);
      if (program) params.set("program", program);
      router.push(`/admin/students?${params.toString()}`);
    });
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setCampus("");
    setProgram("");
    startTransition(() => {
      router.push("/admin/students");
    });
  };

  const hasFilters = search || status || campus || program;

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-card border border-border">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters()}
              className="pl-10"
            />
          </div>
        </div>

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

        {/* Program */}
        <select
          value={program}
          onChange={(e) => setProgram(e.target.value)}
          className="h-10 px-3 rounded-md border border-input bg-background text-sm"
        >
          <option value="">All Programs</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
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
    </div>
  );
}
