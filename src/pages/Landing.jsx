import { Link } from 'react-router-dom'

const features = [
  { icon: 'sync', title: 'Real-time Sync', desc: 'Collaborate with live updates via WebSocket connections.' },
  { icon: 'group_add', title: 'Team Recruitment', desc: 'Publish projects, review applications, build your team.' },
  { icon: 'view_kanban', title: 'Kanban Board', desc: 'Drag-and-drop task management with priority tracking.' },
  { icon: 'terminal', title: 'GitHub Integration', desc: 'Connect repos for live commit activity and stats.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface">
      <nav className="fixed top-0 z-50 flex h-[56px] w-full items-center justify-between border-b border-outline-variant/30 bg-surface/80 px-6 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 border border-primary/40 text-primary text-xs font-bold">
            <span className="font-mono">B</span>
          </div>
          <span className="text-[14px] font-semibold text-on-surface tracking-tight">BuildTogether</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-[13px] text-on-surface-variant hover:text-on-surface">Login</Link>
          <Link to="/register" className="rounded-lg bg-primary text-on-primary px-4 py-1.5 text-[13px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">Get Started</Link>
        </div>
      </nav>

      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-14 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-mono text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Open Source &amp; Free
        </div>
        <h1 className="max-w-3xl text-[32px] md:text-[48px] font-bold leading-tight tracking-tight text-on-surface">
          Build projects <span className="text-primary">together</span>
        </h1>
        <p className="mt-4 max-w-xl text-[15px] text-on-surface-variant">
          A platform where developers publish projects, recruit contributors, and collaborate through tasks with live notifications.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/register" className="rounded-lg bg-primary text-on-primary px-6 py-2.5 text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
            Start Building
          </Link>
          <Link to="/explore" className="rounded-lg border border-outline-variant/40 bg-surface-container px-6 py-2.5 text-[14px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors">
            Explore Projects
          </Link>
        </div>
      </section>

      <section className="border-t border-outline-variant/30 bg-surface-container-low/50 px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-6">
              <span className="material-symbols-outlined text-primary text-[24px] mb-3">{icon}</span>
              <h3 className="mb-1 text-[14px] font-semibold text-on-surface">{title}</h3>
              <p className="text-[13px] text-on-surface-variant">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-outline-variant/30 px-6 py-8 text-center text-[11px] text-outline">
        BuildTogether &copy; {new Date().getFullYear()} — A developer collaboration platform.
      </footer>
    </div>
  )
}
