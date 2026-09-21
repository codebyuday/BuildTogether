const SKELETON_WIDTHS = [72, 85, 91, 78, 96, 83, 74, 88, 93, 70]

export default function Skeleton({ className = '', lines = 1 }) {
  return (
    <div className={`animate-pulse space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3.5 bg-surface-container-high/60 rounded-md w-full" style={{ width: `${SKELETON_WIDTHS[i % SKELETON_WIDTHS.length]}%` }} />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-line rounded-2xl p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high/50" />
          <div className="space-y-1.5">
            <div className="h-3.5 w-24 bg-surface-container-high/50 rounded-md" />
            <div className="h-2.5 w-16 bg-surface-container-high/40 rounded-md" />
          </div>
        </div>
        <div className="h-5 w-16 bg-surface-container-high/40 rounded-md" />
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="h-2.5 w-full bg-surface-container-high/40 rounded-md" />
        <div className="h-2.5 w-3/4 bg-surface-container-high/30 rounded-md" />
      </div>
      <div className="flex gap-1.5">
        <div className="h-4 w-12 bg-surface-container-high/30 rounded-md" />
        <div className="h-4 w-14 bg-surface-container-high/30 rounded-md" />
        <div className="h-4 w-10 bg-surface-container-high/30 rounded-md" />
      </div>
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-line rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-surface-container-high/50" />
        <div className="space-y-1.5">
          <div className="h-2.5 w-16 bg-surface-container-high/40 rounded-md" />
          <div className="h-6 w-8 bg-surface-container-high/50 rounded-md" />
        </div>
      </div>
    </div>
  )
}

export function TaskCardSkeleton() {
  return (
    <div className="bg-surface-container border border-outline-variant/20 rounded-lg p-3 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 w-14 bg-surface-container-high/50 rounded-md" />
        <div className="h-3 w-10 bg-surface-container-high/40 rounded-md" />
      </div>
      <div className="h-3.5 w-full bg-surface-container-high/50 rounded-md mb-1.5" />
      <div className="h-2.5 w-3/4 bg-surface-container-high/30 rounded-md" />
    </div>
  )
}

