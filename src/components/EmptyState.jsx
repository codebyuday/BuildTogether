import { Link } from 'react-router-dom'

export default function EmptyState({ icon = 'inbox', title, description, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
      <span className="material-symbols-outlined text-[36px] text-muted/30 mb-3 block">{icon}</span>
      <p className="text-[14px] text-on-surface font-medium mb-1">{title}</p>
      {description && <p className="text-[13px] text-muted mb-4">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-3xl text-[13px] font-semibold hover:brightness-110 transition-all btn-shimmer">
          <span className="material-symbols-outlined text-[16px]">add</span>
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
