export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`glass-card p-6 space-y-4 ${className}`}>
      <div className="skeleton-shimmer h-4 w-1/3" />
      <div className="skeleton-shimmer h-8 w-2/3" />
      <div className="skeleton-shimmer h-4 w-1/2" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="skeleton-shimmer h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="skeleton-shimmer h-4 w-1/3" />
        <div className="skeleton-shimmer h-3 w-1/4" />
      </div>
      <div className="skeleton-shimmer h-4 w-20" />
    </div>
  );
}

export function SkeletonBalance() {
  return (
    <div className="space-y-3">
      <div className="skeleton-shimmer h-4 w-24" />
      <div className="skeleton-shimmer h-12 w-48" />
    </div>
  );
}
