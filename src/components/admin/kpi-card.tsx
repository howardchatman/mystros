"use client";

import { cn } from "@/lib/utils/cn";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "default" | "success" | "warning" | "danger";
}

const colorConfig = {
  default: {
    iconBg: "bg-brand-accent/10",
    iconColor: "text-brand-accent",
  },
  success: {
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
  },
  warning: {
    iconBg: "bg-yellow-500/10",
    iconColor: "text-yellow-500",
  },
  danger: {
    iconBg: "bg-red-500/10",
    iconColor: "text-red-500",
  },
};

export function KPICard({
  label,
  value,
  icon: Icon,
  trend,
  color = "default",
}: KPICardProps) {
  const config = colorConfig[color];

  return (
    <div className="rounded-xl border border-white/10 bg-brand-elevated/80 backdrop-blur-sm p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-brand-muted mb-1">{label}</p>
          <p className="text-2xl font-bold text-brand-text">{value}</p>

          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-green-400" : "text-red-400"
                )}
              >
                {trend.isPositive ? "+" : "-"}
                {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-brand-muted">vs last week</span>
            </div>
          )}
        </div>

        <div className={cn("p-3 rounded-lg", config.iconBg)}>
          <Icon className={cn("w-6 h-6", config.iconColor)} />
        </div>
      </div>
    </div>
  );
}
