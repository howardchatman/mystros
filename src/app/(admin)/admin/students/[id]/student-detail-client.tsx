"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentOverview } from "./student-overview";
import { StudentAttendanceSection } from "./student-attendance-section";
import { StudentSapSection } from "./student-sap-section";
import { StudentCompetenciesSection } from "./student-competencies-section";
import { StudentDocumentsSection } from "./student-documents-section";
import { StudentFinancialSection } from "./student-financial-section";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface StudentDetailClientProps {
  student: any;
  sapHistory: any[];
  documents: any[];
  account: any;
  aidRecords: any[];
  disbursements: any[];
}

export function StudentDetailClient({ student, sapHistory, documents, account, aidRecords, disbursements }: StudentDetailClientProps) {
  const program = student.program
    ? Array.isArray(student.program)
      ? student.program[0]
      : student.program
    : null;

  return (
    <div className="space-y-6">
      {/* Back button + header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/students">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            {student.first_name} {student.last_name}
          </h1>
          <p className="text-muted-foreground text-sm">
            {student.student_number}
            {program && ` · ${program.name}`}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="sap">SAP</TabsTrigger>
          <TabsTrigger value="competencies">Competencies</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <StudentOverview student={student} />
        </TabsContent>

        <TabsContent value="attendance">
          <StudentAttendanceSection
            attendance={student.attendance || []}
            totalHours={student.total_hours_completed || 0}
            theoryHours={student.theory_hours_completed || 0}
            practicalHours={student.practical_hours_completed || 0}
            programTotalHours={program?.total_hours || 0}
          />
        </TabsContent>

        <TabsContent value="sap">
          <StudentSapSection
            studentId={student.id}
            currentStatus={student.current_sap_status}
            sapHistory={sapHistory}
          />
        </TabsContent>

        <TabsContent value="competencies">
          <StudentCompetenciesSection
            studentId={student.id}
            programId={program?.id}
          />
        </TabsContent>

        <TabsContent value="documents">
          <StudentDocumentsSection documents={documents} />
        </TabsContent>

        <TabsContent value="financial">
          <StudentFinancialSection
            account={account}
            aidRecords={aidRecords}
            disbursements={disbursements}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
