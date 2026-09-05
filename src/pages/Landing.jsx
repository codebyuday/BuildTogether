import { Link } from 'react-router-dom'
import { Zap, Users, Kanban, GitBranch } from 'lucide-react'

const features = [
  { icon: Zap, title: 'Real-time Sync', desc: 'Collaborate with live updates via WebSocket connections.' },
  { icon: Users, title: 'Team Recruitment', desc: 'Publish projects, review applications, build your team.' },
  { icon: Kanban, title: 'Kanban Board', desc: 'Drag-and-drop task management with priority tracking.' },
  { icon: GitBranch, title: 'GitHub Integration', desc: 'Connect repos for live commit activity and stats.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary-600 text-xs font-bold text-white">B</div>
          <span className="text-sm font-bold text-white">BuildTogether</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white">Login</Link>
          <Link to="/register" className="rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-500">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex min-h-screen flex-col items-center justify-center px-6 pt-14 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-500/30 bg-primary-500/10 px-3 py-1 text-xs text-primary-400">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse" />
          Open Source &amp; Free
        </div>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
          Build projects <span className="text-primary-400">together</span>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-slate-400">
          A platform where developers publish projects, recruit contributors, and collaborate through tasks with live notifications.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/register" className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-500">
            Start Building
          </Link>
          <Link to="/explore" className="rounded-lg border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-800">
            Explore Projects
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-slate-800 bg-slate-900/50 px-6 py-24">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <Icon className="mb-3 text-primary-400" size={24} />
              <h3 className="mb-1 text-sm font-semibold text-white">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-6 py-8 text-center text-xs text-slate-500">
        BuildTogether &copy; {new Date().getFullYear()} &mdash; A developer collaboration platform.
      </footer>
    </div>
  )
}
