import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, Clock } from "lucide-react";

export const metadata = {
  title: "Profile | Student Portal",
  description: "View your student profile",
};

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Get student record with program and campus
  const { data: student } = await supabase
    .from("students")
    .select(`
      *,
      program:programs(name, total_hours),
      campus:campuses(name, address, city, state)
    `)
    .eq("user_id", user.id)
    .single();

  const program = student?.program as { name?: string; total_hours?: number } | null;
  const campus = student?.campus as { name?: string; address?: string; city?: string; state?: string } | null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">Your student information</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-brand-accent/20 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-brand-accent">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-xl font-bold text-foreground">{user.first_name} {user.last_name}</p>
                {student && (
                  <Badge variant="outline" className="capitalize mt-1">
                    {student.status?.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Details */}
      {student && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Student ID</p>
                <p className="font-mono font-medium text-foreground">{student.student_number || "—"}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Program</p>
                <p className="font-medium text-foreground">{program?.name || "—"}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Campus</p>
                <p className="font-medium text-foreground">{campus?.name || "—"}</p>
                {campus?.city && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {campus.city}, {campus.state}
                  </p>
                )}
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Enrollment Date</p>
                <p className="font-medium text-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {student.enrollment_date
                    ? new Date(student.enrollment_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "—"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Expected Graduation</p>
                <p className="font-medium text-foreground">
                  {student.expected_graduation_date
                    ? new Date(student.expected_graduation_date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                    : "—"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30">
                <p className="text-sm text-muted-foreground">Hours Completed</p>
                <p className="font-medium text-foreground flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {student.total_hours_completed || 0} / {program?.total_hours || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SAP Status */}
      {student && (
        <Card>
          <CardHeader>
            <CardTitle>Academic Standing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                student.current_sap_status === "satisfactory" ? "bg-green-500/20"
                : student.current_sap_status === "warning" ? "bg-yellow-500/20"
                : "bg-red-500/20"
              }`}>
                <GraduationCap className={`w-6 h-6 ${
                  student.current_sap_status === "satisfactory" ? "text-green-500"
                  : student.current_sap_status === "warning" ? "text-yellow-500"
                  : "text-red-500"
                }`} />
              </div>
              <div>
                <p className="font-medium text-foreground capitalize">
                  {student.current_sap_status?.replace(/_/g, " ") || "Pending"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {student.last_sap_evaluation_date
                    ? `Last evaluated: ${new Date(student.last_sap_evaluation_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                    : "Pending evaluation"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!student && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Not Yet Enrolled</h3>
              <p className="text-muted-foreground">
                Complete your application and enrollment to see your full profile.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
