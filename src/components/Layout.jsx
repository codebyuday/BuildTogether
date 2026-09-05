import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NotificationBell from './NotificationBell'
import UserSearch from './UserSearch'
import ShortcutsModal from './ShortcutsModal'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/explore', label: 'Discover', icon: 'explore' },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-screen w-[240px] z-50 flex flex-col justify-between bg-surface-container-low border-r border-outline-variant/20 transition-transform duration-200 lg:z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-3">
          <div className="flex items-center gap-2.5 px-3 py-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center text-primary text-[13px] font-bold">
              <span className="font-mono">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[14px] font-semibold text-on-surface tracking-tight leading-none">BuildTogether</span>
              <span className="text-[10px] text-on-surface-variant/50 mt-0.5 tracking-wide uppercase">Workspace</span>
            </div>
          </div>

          <div className="px-2 mb-5">
            <Link to="/projects/new" className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-semibold py-2 px-3 rounded-lg hover:bg-primary-container transition-all active:scale-[0.98] text-[13px]">
              <span className="material-symbols-outlined text-[16px]">add</span>
              New Project
            </Link>
          </div>

          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ to, label, icon }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px] ${
                    active
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                  }`}>
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  <span>{label}</span>
                </Link>
              )
            })}
            <Link to="/profile"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[13px] ${
                location.pathname === '/profile'
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}>
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span>Profile</span>
            </Link>
          </nav>
        </div>

        <div className="border-t border-outline-variant/20 p-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
            onClick={signOut}>
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/15 border border-outline-variant/30 flex items-center justify-center text-primary text-[11px] font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface-container-low"></span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] font-medium text-on-surface truncate">{profile?.full_name || profile?.username || 'User'}</span>
              <span className="text-[10px] text-on-surface-variant/50 truncate">{profile?.bio || 'Developer'}</span>
            </div>
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant/40">logout</span>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 lg:pl-[240px] h-screen overflow-hidden">
        <header className="sticky top-0 z-30 h-[52px] w-full bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">menu</span>
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-high/50 border border-outline-variant/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="text-on-surface text-[12px] font-medium">BuildTogether</span>
              <span className="text-on-surface-variant/30 text-[12px]">/</span>
              <span className="text-on-surface-variant/60 text-[11px] font-mono">
                {location.pathname === '/dashboard' ? 'Dashboard' :
                 location.pathname === '/explore' ? 'Discover' :
                 location.pathname === '/profile' ? 'Profile' :
                 location.pathname === '/projects/new' ? 'New Project' : 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <UserSearch />
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
      <ShortcutsModal />
    </div>
  )
}
