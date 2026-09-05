import { Link } from 'react-router-dom'

const features = [
  { icon: 'sync', title: 'Real-time Collaboration', desc: 'Live updates, comments, and activity feeds powered by WebSocket connections.' },
  { icon: 'group_add', title: 'Team Recruitment', desc: 'Publish projects, review applications, and build high-performing teams.' },
  { icon: 'view_kanban', title: 'Kanban Board', desc: 'Drag-and-drop task management with labels, milestones, and priority tracking.' },
  { icon: 'terminal', title: 'GitHub Integration', desc: 'Connect repos for live commit activity, contributor stats, and language breakdown.' },
  { icon: 'analytics', title: 'Project Analytics', desc: 'Track completion rates, velocity, and team performance with built-in stats.' },
  { icon: 'download', title: 'Export Anywhere', desc: 'Export project data to Markdown, CSV, JSON, or PDF with one click.' },
]

const stats = [
  { value: '5', label: 'Team Members' },
  { value: '27', label: 'Features Built' },
  { value: 'Real-time', label: 'Collaboration' },
  { value: '100%', label: 'Open Source' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      <nav className="fixed top-0 z-50 flex h-[60px] w-full items-center justify-between px-6 lg:px-10 glass">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 border border-primary/25 text-primary text-xs font-bold">
            <span className="font-mono text-[13px]">B</span>
          </div>
          <span className="text-[15px] font-semibold text-on-surface tracking-tight">BuildTogether</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors">Login</Link>
          <Link to="/register" className="rounded-lg bg-primary/10 border border-primary/25 text-primary px-4 py-1.5 text-[13px] font-semibold hover:bg-primary/20 transition-all active:scale-[0.98]">Get Started</Link>
        </div>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-14 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-secondary/[0.03] blur-[100px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-tertiary/[0.03] blur-[80px]" />
        </div>

        <div className="relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.06] px-4 py-1.5 text-[12px] font-mono text-primary/80">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Open Source &middot; Free Forever
        </div>

        <h1 className="relative z-10 max-w-4xl text-[36px] sm:text-[48px] md:text-[56px] font-bold leading-[1.1] tracking-tight text-on-surface">
          Build projects<br />
          <span className="text-gradient">together</span>
        </h1>

        <p className="relative z-10 mt-5 max-w-xl text-[16px] leading-relaxed text-on-surface-variant/80">
          A modern workspace where developers publish projects, recruit contributors,
          and collaborate through tasks with live notifications and real-time updates.
        </p>

        <div className="relative z-10 mt-10 flex gap-4">
          <Link to="/register"
            className="rounded-xl bg-primary text-on-primary px-7 py-3 text-[15px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98] glow-primary">
            Start Building
          </Link>
          <Link to="/explore"
            className="rounded-xl border border-outline-variant/40 bg-surface-container-high/50 px-7 py-3 text-[15px] font-semibold text-on-surface hover:bg-surface-container-high hover:border-outline-variant transition-all">
            Explore Projects
          </Link>
        </div>

        <div className="relative z-10 mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-[22px] font-bold text-on-surface">{value}</div>
              <div className="text-[12px] text-on-surface-variant/60 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="relative border-t border-outline-variant/20 bg-surface-container-low/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-[28px] font-bold text-on-surface tracking-tight">Everything you need</h2>
            <p className="mt-3 text-[15px] text-on-surface-variant/70">Built for developers, by developers. No bloat, no compromise.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="group rounded-xl border border-outline-variant/25 bg-surface-container-low p-6 card-hover">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary group-hover:bg-primary/15 transition-colors">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                </div>
                <h3 className="mb-2 text-[15px] font-semibold text-on-surface">{title}</h3>
                <p className="text-[13px] leading-relaxed text-on-surface-variant/70">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-outline-variant/20 px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-[28px] font-bold text-on-surface tracking-tight">Ready to build?</h2>
          <p className="mt-3 text-[15px] text-on-surface-variant/70 mb-8">Join a community of developers shipping real projects together.</p>
          <Link to="/register"
            className="inline-flex rounded-xl bg-primary text-on-primary px-8 py-3 text-[15px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98] glow-primary">
            Get Started Free
          </Link>
        </div>
      </section>

      <footer className="border-t border-outline-variant/20 px-6 py-8">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/15 text-primary text-[10px] font-bold">
              <span className="font-mono">B</span>
            </div>
            <span className="text-[12px] text-on-surface-variant/50">BuildTogether &copy; {new Date().getFullYear()}</span>
          </div>
          <span className="text-[11px] text-on-surface-variant/40">A developer collaboration platform</span>
        </div>
      </footer>
    </div>
  )
}
