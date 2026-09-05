export default function Skeleton({ className = '', lines = 1 }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-surface-container-high rounded w-full" style={{ width: `${70 + Math.random() * 30}%` }} />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-md animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high" />
          <div className="space-y-1">
            <div className="h-4 w-24 bg-surface-container-high rounded" />
            <div className="h-3 w-16 bg-surface-container-high rounded" />
          </div>
        </div>
        <div className="h-5 w-16 bg-surface-container-high rounded" />
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="h-3 w-full bg-surface-container-high rounded" />
        <div className="h-3 w-3/4 bg-surface-container-high rounded" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-5 w-12 bg-surface-container-high rounded" />
        <div className="h-5 w-14 bg-surface-container-high rounded" />
        <div className="h-5 w-10 bg-surface-container-high rounded" />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 w-20 bg-surface-container-high rounded" />
        <div className="h-4 w-4 bg-surface-container-high rounded" />
      </div>
      <div className="h-8 w-12 bg-surface-container-high rounded" />
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-surface-container border border-outline-variant/40 rounded p-3 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-14 bg-surface-container-high rounded" />
        <div className="h-3 w-10 bg-surface-container-high rounded" />
      </div>
      <div className="h-4 w-full bg-surface-container-high rounded mb-2" />
      <div className="h-3 w-3/4 bg-surface-container-high rounded" />
    </div>
  )
}
