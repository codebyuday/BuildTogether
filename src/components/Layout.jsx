import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NotificationBell from './NotificationBell'
import { LayoutDashboard, Compass, User, LogOut } from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/explore', label: 'Explore', icon: Compass },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden w-60 flex-col border-r border-slate-800 bg-slate-900 md:flex">
        <div className="flex h-14 items-center gap-2 border-b border-slate-800 px-4">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-primary-600 text-xs font-bold text-white">B</div>
          <span className="text-sm font-bold tracking-tight text-white">BuildTogether</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'bg-primary-600/10 text-primary-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
          <Link to="/projects/new"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200">
            <span className="flex h-5 w-5 items-center justify-center rounded border border-dashed border-slate-600 text-[10px]">+</span>
            New Project
          </Link>
        </nav>

        <div className="border-t border-slate-800 p-3">
          <Link to="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-slate-200">
            <User size={18} /> Profile
          </Link>
          <button onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-red-400">
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-primary-600 text-xs font-bold text-white">B</div>
            <span className="text-sm font-bold text-white">BuildTogether</span>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <NotificationBell />
            <Link to="/profile" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600/20 text-xs font-bold text-primary-400">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
