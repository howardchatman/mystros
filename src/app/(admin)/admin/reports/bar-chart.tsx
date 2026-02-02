"use client";

interface BarChartProps {
  data: { label: string; value: number; color?: string }[];
  maxValue?: number;
}

export function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((d) => {
        const height = Math.max((d.value / max) * 100, 2);
        return (
          <div key={d.label} className="flex flex-col items-center flex-1 min-w-0">
            <span className="text-xs font-medium text-foreground mb-1">{d.value}</span>
            <div
              className={`w-full rounded-t-sm ${d.color || "bg-primary"}`}
              style={{ height: `${height}%` }}
            />
            <span className="text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
