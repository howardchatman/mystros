import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentImportTab } from "./student-import-tab";
import { AttendanceImportTab } from "./attendance-import-tab";

export const metadata = { title: "Import Data | Admin" };

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">CSV Data Import</h1>
        <p className="text-muted-foreground text-sm">
          Bulk import students and attendance records from CSV files.
        </p>
      </div>

      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <StudentImportTab />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceImportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
