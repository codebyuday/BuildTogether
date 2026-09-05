import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import NotificationBell from './NotificationBell'
import UserSearch from './UserSearch'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/explore', label: 'Discover', icon: 'explore' },
]

export default function Layout() {
  const { profile, signOut } = useAuth()
  const location = useLocation()

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="fixed top-0 left-0 h-screen w-[240px] z-40 flex flex-col justify-between bg-surface-container-low border-r border-outline-variant/30 p-space-sm">
        <div>
          <div className="flex items-center gap-space-sm px-space-md py-space-sm mb-space-md">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary">
              <span className="text-sm font-bold font-mono">B</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[16px] font-semibold text-on-surface tracking-tight leading-none">BuildTogether</span>
              <span className="text-[11px] text-on-surface-variant/70 mt-1">Dev Workspace</span>
            </div>
          </div>

          <div className="px-space-xs mb-space-md">
            <Link to="/projects/new" className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary font-semibold py-2 px-3 rounded-lg hover:bg-primary-fixed transition-all active:scale-[0.98]">
              <span className="text-sm">+</span>
              <span className="text-[14px]">New Project</span>
            </Link>
          </div>

          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ to, label, icon }) => (
              <Link key={to} to={to}
                className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors ${
                  location.pathname === to
                    ? 'bg-surface-container-high text-primary font-medium border-l-2 border-primary'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}>
                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                <span className="text-[14px]">{label}</span>
              </Link>
            ))}
            <Link to="/profile"
              className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors ${
                location.pathname === '/profile'
                  ? 'bg-surface-container-high text-primary font-medium border-l-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}>
              <span className="material-symbols-outlined text-[18px]">person</span>
              <span className="text-[14px]">Profile</span>
            </Link>
          </nav>
        </div>

        <div className="border-t border-outline-variant/20 pt-space-sm px-space-xs">
          <div className="flex items-center gap-space-sm px-space-sm py-space-xs rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer"
            onClick={signOut}>
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-primary/20 border border-outline-variant flex items-center justify-center text-primary text-xs font-bold">
                {profile?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface-container-low"></span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] text-on-surface truncate">{profile?.full_name || profile?.username || 'User'}</span>
              <span className="text-[11px] text-on-surface-variant/80 truncate">{profile?.bio || 'Developer'}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 pl-[240px] h-screen overflow-hidden">
        <header className="sticky top-0 z-30 h-[56px] w-full bg-surface border-b border-outline-variant/30 flex items-center justify-between px-space-lg">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container border border-outline-variant/40">
              <span className="w-2 h-2 rounded-full bg-primary-container"></span>
              <span className="text-on-surface font-semibold text-[14px]">BuildTogether</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface-variant text-[11px] font-mono">
                {location.pathname === '/dashboard' ? 'Dashboard' :
                 location.pathname === '/explore' ? 'Discover' :
                 location.pathname === '/profile' ? 'Profile' :
                 location.pathname === '/projects/new' ? 'New Project' : 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserSearch />
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-space-lg">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
