import { createClient } from "@/lib/supabase/server";
import { getAuditReadinessData } from "@/lib/actions/audit-readiness";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardCheck, CheckCircle, AlertTriangle, XCircle, Users } from "lucide-react";
import { ReadinessDashboard } from "./readiness-dashboard";

export const metadata = {
  title: "Audit Readiness | Admin Dashboard",
  description: "Monitor audit preparedness across all students",
};

export default async function AuditReadinessPage() {
  const supabase = await createClient();

  const [readinessResult, { data: campuses }, { data: programs }] = await Promise.all([
    getAuditReadinessData(),
    supabase.from("campuses").select("id, name").eq("is_active", true).order("name"),
    supabase.from("programs").select("id, name").eq("is_active", true).order("name"),
  ]);

  const data = readinessResult.data;
  const summary = data?.summary || { total: 0, ready: 0, attention: 0, critical: 0 };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Audit Readiness</h1>
        <p className="text-muted-foreground">
          Monitor audit preparedness — document compliance, attendance, SAP, and financial verification
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-brand-accent/10">
                <Users className="w-6 h-6 text-brand-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{summary.total}</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-500">{summary.ready}</p>
                <p className="text-sm text-muted-foreground">Audit Ready (90%+)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-500">{summary.attention}</p>
                <p className="text-sm text-muted-foreground">Needs Attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-red-500/10">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-500">{summary.critical}</p>
                <p className="text-sm text-muted-foreground">Critical (&lt;70%)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ReadinessDashboard
        initialStudents={data?.students || []}
        campuses={(campuses || []).map((c) => ({ id: c.id, name: c.name }))}
        programs={(programs || []).map((p) => ({ id: p.id, name: p.name }))}
      />
    </div>
  );
}
