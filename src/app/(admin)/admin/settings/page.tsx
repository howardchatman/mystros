import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Building2, GraduationCap, FileText, Users } from "lucide-react";

export const metadata = {
  title: "Settings | Admin Dashboard",
  description: "Academy configuration and settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  // Get campuses
  const { data: campuses } = await supabase
    .from("campuses")
    .select("*")
    .order("name");

  // Get programs
  const { data: programs } = await supabase
    .from("programs")
    .select("*")
    .order("name");

  // Get document types
  const { data: documentTypes } = await supabase
    .from("document_types")
    .select("*")
    .order("category, name");

  // Get admin users
  const { data: adminUsers } = await supabase
    .from("user_profiles")
    .select("*")
    .neq("role", "student")
    .order("last_name");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage academy configuration</p>
      </div>

      {/* Campuses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Campuses
          </CardTitle>
          <CardDescription>Manage campus locations</CardDescription>
        </CardHeader>
        <CardContent>
          {!campuses || campuses.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No campuses configured.</p>
          ) : (
            <div className="space-y-3">
              {campuses.map((campus) => (
                <div key={campus.id} className="flex items-center justify-between p-4 rounded-lg border border-border bg-card">
                  <div>
                    <p className="font-medium text-foreground">{campus.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {campus.address && `${campus.address}, `}{campus.city}, {campus.state} {campus.zip_code}
                    </p>
                    {campus.phone && (
                      <p className="text-sm text-muted-foreground">{campus.phone}</p>
                    )}
                  </div>
                  <Badge variant={campus.is_active ? "default" : "secondary"}>
                    {campus.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Programs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Programs
          </CardTitle>
          <CardDescription>Manage academic programs</CardDescription>
        </CardHeader>
        <CardContent>
          {!programs || programs.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No programs configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Program</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Hours</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tuition</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {programs.map((program) => (
                    <tr key={program.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{program.name}</p>
                        {program.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{program.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {program.total_hours} total
                        <span className="text-muted-foreground">
                          {" "}({program.theory_hours}T / {program.practical_hours}P)
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        ${Number(program.tuition || 0).toLocaleString()}
                        {program.registration_fee > 0 && (
                          <span className="text-muted-foreground"> + ${Number(program.registration_fee).toLocaleString()} reg</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={program.is_active ? "default" : "secondary"}>
                          {program.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Document Types
          </CardTitle>
          <CardDescription>Required and optional document configurations</CardDescription>
        </CardHeader>
        <CardContent>
          {!documentTypes || documentTypes.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No document types configured.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Document</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Required</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {documentTypes.map((dt) => (
                    <tr key={dt.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">{dt.name}</p>
                        {dt.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{dt.description}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm capitalize">{dt.category}</td>
                      <td className="py-3 px-4">
                        <Badge variant={dt.is_required ? "default" : "outline"}>
                          {dt.is_required ? "Required" : "Optional"}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={dt.is_active ? "default" : "secondary"}>
                          {dt.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Users
          </CardTitle>
          <CardDescription>Staff and administrator accounts</CardDescription>
        </CardHeader>
        <CardContent>
          {!adminUsers || adminUsers.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No admin users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Name</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium text-foreground">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{user.email}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="capitalize">
                          {user.role?.replace(/_/g, " ")}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
