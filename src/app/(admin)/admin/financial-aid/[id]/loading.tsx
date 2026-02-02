export default function FinancialAidDetailLoading() {
  return (
    <div className="space-y-6">
      {/* Back link + header */}
      <div className="space-y-4">
        <div className="h-4 w-24 rounded bg-muted animate-pulse" />
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-56 rounded bg-muted animate-pulse" />
            <div className="h-4 w-40 rounded bg-muted animate-pulse" />
          </div>
          <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
        </div>
      </div>

      {/* Tab bar skeleton */}
      <div className="flex gap-2 border-b border-border pb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-8 w-28 rounded bg-muted animate-pulse" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6 space-y-3">
            <div className="h-5 w-36 rounded bg-muted animate-pulse" />
            <div className="h-4 w-full rounded bg-muted animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
