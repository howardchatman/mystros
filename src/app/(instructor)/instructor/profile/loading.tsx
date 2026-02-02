export default function ProfileLoading() {
  return (
    <div className="space-y-6 max-w-2xl animate-pulse">
      <div className="space-y-2">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="h-4 w-48 bg-muted rounded" />
      </div>
      <div className="h-48 bg-muted rounded-lg" />
      <div className="h-32 bg-muted rounded-lg" />
      <div className="h-48 bg-muted rounded-lg" />
    </div>
  );
}
