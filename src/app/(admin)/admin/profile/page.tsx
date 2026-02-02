import { redirect } from "next/navigation";
import { getUser } from "@/lib/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Shield } from "lucide-react";
import { ProfileEditForm } from "./profile-edit-form";

export const metadata = {
  title: "Profile | Admin Dashboard",
  description: "View and edit your profile",
};

const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  campus_admin: "Campus Admin",
  admissions: "Admissions",
  financial_aid: "Financial Aid",
  instructor: "Instructor",
  registrar: "Registrar",
  auditor: "Auditor",
};

export default async function AdminProfilePage() {
  const user = await getUser();
  if (!user) redirect("/login");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">My Profile</h1>
        <p className="text-muted-foreground">View and manage your account</p>
      </div>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <span className="text-2xl font-bold text-amber-400">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <p className="text-xl font-bold text-foreground">{user.first_name} {user.last_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="default">
                    <Shield className="w-3 h-3 mr-1" />
                    {roleLabels[user.role] || user.role}
                  </Badge>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{user.email}</span>
                  <span className="text-xs text-muted-foreground">(cannot be changed)</span>
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

      {/* Edit Form */}
      <ProfileEditForm
        currentPhone={user.phone || ""}
      />
    </div>
  );
}
