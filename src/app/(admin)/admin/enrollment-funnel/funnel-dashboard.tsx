"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, FileText, CheckCircle, GraduationCap, ArrowRight, Clock, Send, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { FunnelMetrics, SourceBreakdown, FunnelActivity, AbandonedApplication } from "@/lib/actions/enrollment-funnel";

interface FunnelDashboardProps {
  metrics: FunnelMetrics;
  sourceBreakdown: SourceBreakdown[];
  recentActivity: FunnelActivity[];
  abandonedApps: AbandonedApplication[];
}

export function FunnelDashboard({
  metrics,
  sourceBreakdown,
  recentActivity,
  abandonedApps,
}: FunnelDashboardProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>Lead to enrollment progression</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FunnelStep
            icon={Users}
            label="Leads"
            count={metrics.leads}
            color="bg-blue-500"
            width={100}
          />
          <div className="flex items-center justify-center text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
            <span className="ml-2 text-sm">{metrics.leadToApplicant}% conversion</span>
          </div>
          <FunnelStep
            icon={FileText}
            label="Applicants"
            count={metrics.applicants}
            color="bg-amber-500"
            width={Math.max(20, metrics.leadToApplicant)}
          />
          <div className="flex items-center justify-center text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
            <span className="ml-2 text-sm">{metrics.applicantToAccepted}% conversion</span>
          </div>
          <FunnelStep
            icon={CheckCircle}
            label="Accepted"
            count={metrics.accepted}
            color="bg-green-500"
            width={Math.max(15, (metrics.leadToApplicant * metrics.applicantToAccepted) / 100)}
          />
          <div className="flex items-center justify-center text-muted-foreground">
            <ArrowRight className="w-4 h-4" />
            <span className="ml-2 text-sm">{metrics.acceptedToEnrolled}% conversion</span>
          </div>
          <FunnelStep
            icon={GraduationCap}
            label="Enrolled"
            count={metrics.enrolled}
            color="bg-purple-500"
            width={Math.max(10, (metrics.leadToApplicant * metrics.applicantToAccepted * metrics.acceptedToEnrolled) / 10000)}
          />
        </CardContent>
      </Card>

      {/* Lead Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources</CardTitle>
          <CardDescription>Where leads are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          {sourceBreakdown.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No lead data yet</p>
          ) : (
            <div className="space-y-3">
              {sourceBreakdown.map((s) => {
                const total = sourceBreakdown.reduce((sum, x) => sum + x.count, 0);
                const pct = total > 0 ? Math.round((s.count / total) * 100) : 0;
                return (
                  <div key={s.source} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{s.source.replace(/_/g, " ")}</span>
                      <span className="text-muted-foreground">{s.count} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest funnel movements</CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.map((a) => (
                <div key={`${a.type}-${a.id}`} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    a.type === "lead" ? "bg-blue-500/20" :
                    a.type === "application" ? "bg-amber-500/20" : "bg-purple-500/20"
                  }`}>
                    {a.type === "lead" ? <Users className="w-4 h-4 text-blue-500" /> :
                     a.type === "application" ? <FileText className="w-4 h-4 text-amber-500" /> :
                     <GraduationCap className="w-4 h-4 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">{a.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatTimeAgo(a.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Abandoned Applications */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Abandoned Applications</CardTitle>
              <CardDescription>Incomplete applications needing follow-up</CardDescription>
            </div>
            <Badge variant="outline">{abandonedApps.length}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {abandonedApps.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No abandoned applications</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {abandonedApps.map((app) => (
                <div key={app.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {app.firstName} {app.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{app.email}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={app.daysInactive > 7 ? "destructive" : "outline"} className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {app.daysInactive}d inactive
                    </Badge>
                  </div>
                  <Link href={`/admin/admissions/applications/${app.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
          {abandonedApps.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Link href="/admin/admissions/abandoned">
                <Button variant="outline" className="w-full">
                  View All Abandoned Applications
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FunnelStep({
  icon: Icon,
  label,
  count,
  color,
  width,
}: {
  icon: React.ElementType;
  label: string;
  count: number;
  color: string;
  width: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${color}/20 flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color.replace("bg-", "text-")}`} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground">{count}</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full ${color} rounded-full transition-all`}
            style={{ width: `${Math.min(100, width)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}
