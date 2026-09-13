import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import NotificationBell from './NotificationBell'
import UserSearch from './UserSearch'
import ShortcutsModal from './ShortcutsModal'
import OnboardingTour from './OnboardingTour'
import PageTransition from './PageTransition'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/explore', label: 'Discover', icon: 'explore' },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <a href="#main-content" className="skip-link">Skip to content</a>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-screen w-[240px] z-50 flex flex-col justify-between bg-surface-container-lowest border-r border-line transition-transform duration-200 lg:z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4">
          <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-2 mb-6 rounded-xl hover:bg-surface-container-low transition-colors">
            <div className="w-8 h-8 rounded-lg bg-on-surface flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="" className="w-full h-full object-cover dark:invert" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-on-surface tracking-tight leading-none">BuildTogether</span>
              <span className="text-[10px] text-muted mt-0.5 tracking-widest uppercase font-semibold">Workspace</span>
            </div>
          </Link>

          <Link to="/projects/new" className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-container transition-all active:scale-[0.98] text-[13px]">
            <span className="material-symbols-outlined text-[16px]">add</span>
            New Project
          </Link>

          <nav className="flex flex-col gap-1 mt-5">
            {navItems.map(({ to, label, icon }) => {
              const active = location.pathname === to
              return (
                <Link key={to} to={to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[14px] font-semibold ${
                    active
                      ? 'bg-primary/8 text-primary'
                      : 'text-muted hover:bg-surface-container-low hover:text-on-surface'
                  }`}>
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  <span>{label}</span>
                </Link>
              )
            })}
            <Link to="/profile"
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-[14px] font-semibold ${
                location.pathname === '/profile'
                  ? 'bg-primary/8 text-primary'
                  : 'text-muted hover:bg-surface-container-low hover:text-on-surface'
              }`}>
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span>Profile</span>
            </Link>
          </nav>
        </div>

        <div className="border-t border-line p-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-surface-container-low transition-colors cursor-pointer"
            onClick={signOut}>
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-surface-container-high border border-line flex items-center justify-center text-primary text-[12px] font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-success border-2 border-surface-container-lowest"></span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-semibold text-on-surface truncate">{profile?.full_name || profile?.username || 'User'}</span>
              <span className="text-[11px] text-muted truncate">{profile?.bio || 'Developer'}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-muted">logout</span>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 lg:pl-[240px] h-screen overflow-hidden">
        <header className="sticky top-0 z-30 h-[56px] w-full border-b border-line bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[22px] text-muted">menu</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low border border-line">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="text-on-surface text-[13px] font-semibold">BuildTogether</span>
              <span className="text-muted/40 text-[13px]">/</span>
              <span className="text-muted text-[12px] font-mono">
                {location.pathname === '/dashboard' ? 'Dashboard' :
                 location.pathname === '/explore' ? 'Discover' :
                 location.pathname === '/profile' ? 'Profile' :
                 location.pathname === '/projects/new' ? 'New Project' : 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <UserSearch />
            <button onClick={toggleTheme}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-muted hover:bg-surface-container-low hover:text-on-surface transition-all"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
              <span className="material-symbols-outlined text-[18px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <NotificationBell />
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <ShortcutsModal />
      <OnboardingTour />
    </div>
  )
}
