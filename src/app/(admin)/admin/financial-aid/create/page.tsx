"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import {
  createFinancialAidRecord,
  searchStudentsForAid,
  ensureStudentAccount,
} from "@/lib/actions/financial-aid";

interface StudentResult {
  id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  program: { name: string } | { name: string }[] | null;
}

export default function CreateFinancialAidRecordPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentResult[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [academicYear, setAcademicYear] = useState("2025-2026");
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setIsSearching(true);
    const results = await searchStudentsForAid(searchQuery);
    setSearchResults(results as unknown as StudentResult[]);
    setIsSearching(false);
  };

  const handleCreate = () => {
    if (!selectedStudent) return;
    setError(null);
    startTransition(async () => {
      // Ensure student has an account
      await ensureStudentAccount(selectedStudent.id);

      const res = await createFinancialAidRecord({
        student_id: selectedStudent.id,
        academic_year: academicYear,
      });
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        router.push(`/admin/financial-aid/${res.data.id}`);
      }
    });
  };

  const getProgramName = (student: StudentResult) => {
    if (!student.program) return "No Program";
    if (Array.isArray(student.program)) return student.program[0]?.name || "No Program";
    return student.program.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/financial-aid">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Create Financial Aid Record
          </h1>
          <p className="text-sm text-muted-foreground">
            Search for a student and create a new aid record
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-md px-3 py-2 text-sm bg-red-500/10 text-red-600">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Search by name or student number..."
                className="w-full pl-10 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button onClick={handleSearch} variant="outline" disabled={isSearching}>
              Search
            </Button>
          </div>

          {searchResults.length > 0 && !selectedStudent && (
            <div className="border border-border rounded-md divide-y divide-border">
              {searchResults.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStudent(s)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <p className="font-medium text-foreground">
                    {s.first_name} {s.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {s.student_number} &middot; {getProgramName(s)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {selectedStudent && (
            <div className="flex items-center justify-between p-4 rounded-md border border-brand-accent/30 bg-brand-accent/5">
              <div>
                <p className="font-medium text-foreground">
                  {selectedStudent.first_name} {selectedStudent.last_name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedStudent.student_number} &middot; {getProgramName(selectedStudent)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStudent(null);
                  setSearchResults([]);
                }}
              >
                Change
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Academic Year</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="2024-2025">2024-2025</option>
            <option value="2025-2026">2025-2026</option>
            <option value="2026-2027">2026-2027</option>
          </select>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleCreate}
          isLoading={isPending}
          disabled={!selectedStudent}
        >
          Create Record
        </Button>
      </div>
    </div>
  );
}
