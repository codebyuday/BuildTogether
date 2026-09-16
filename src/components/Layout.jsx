import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import NotificationBell from './NotificationBell'
import UserSearch from './UserSearch'
import ShortcutsModal from './ShortcutsModal'
import OnboardingTour from './OnboardingTour'
import PageTransition from './PageTransition'
import NotificationPreferences, { useSessionTimeout } from './NotificationPreferences'

const ICON_ITEMS = [
  { id: 'explorer', icon: 'folder_open', label: 'Explorer', shortcut: 'E' },
  { id: 'search', icon: 'search', label: 'Search', shortcut: 'F' },
  { id: 'source', icon: 'commit', label: 'Source Control', shortcut: 'G' },
  { id: 'notifications', icon: 'notifications', label: 'Notifications', shortcut: 'N' },
]

function ExplorerPanel() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: projects = [] } = useQuery({
    queryKey: ['sidebar-projects'],
    queryFn: async () => {
      const [owned, member] = await Promise.all([
        supabase.from('projects').select('id, title, status, owner_id').eq('owner_id', user.id).order('created_at', { ascending: false }),
        supabase.from('team_members').select('project_id, projects!inner(id, title, status)').eq('user_id', user.id),
      ])
      const ownedList = owned.data || []
      const memberList = (member.data || []).map(m => m.projects).filter(Boolean)
      return [...ownedList, ...memberList.filter(p => !ownedList.some(o => o.id === p.id))]
    },
  })

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2 px-2">
        <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Projects</span>
        <Link to="/explore" className="text-[11px] text-primary font-semibold hover:underline">Browse</Link>
      </div>
      <div className="space-y-0.5">
        {projects.slice(0, 12).map(p => (
          <button key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-surface-container-high transition-colors group">
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
              p.status === 'recruiting' ? 'bg-success' : p.status === 'full' ? 'bg-tertiary' : 'bg-muted/40'
            }`} />
            <span className="text-[12px] text-on-surface-variant group-hover:text-on-surface truncate">{p.title}</span>
          </button>
        ))}
        {projects.length === 0 && (
          <span className="text-[11px] text-muted px-2 py-1 block">No projects yet</span>
        )}
      </div>
      <div className="mt-3 pt-2 border-t border-line">
        <Link to="/projects/new" className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-surface-container-high transition-colors text-primary">
          <span className="material-symbols-outlined text-[14px]">add</span>
          <span className="text-[12px] font-semibold">New Project</span>
        </Link>
      </div>
    </div>
  )
}

function SearchPanel() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const { data: results = [] } = useQuery({
    queryKey: ['sidebar-search', query],
    queryFn: async () => {
      if (!query.trim()) return []
      const { data } = await supabase.from('projects').select('id, title, description').ilike('title', `%${query}%`).limit(8)
      return data || []
    },
    enabled: query.length > 1,
  })

  return (
    <div className="p-3">
      <div className="relative mb-3">
        <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
          className="w-full bg-surface-container-low border border-line rounded-lg px-3 py-2 pl-8 text-[13px] text-on-surface placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary/15 outline-none transition-all"
          placeholder="Search projects..." />
        <span className="material-symbols-outlined text-[14px] text-muted absolute left-2.5 top-1/2 -translate-y-1/2">search</span>
      </div>
      <div className="space-y-0.5">
        {results.map(r => (
          <button key={r.id} onClick={() => { navigate(`/projects/${r.id}`); setQuery('') }}
            className="w-full text-left px-2 py-2 rounded-md hover:bg-surface-container-high transition-colors">
            <span className="text-[12px] text-on-surface font-medium block">{r.title}</span>
            {r.description && <span className="text-[11px] text-muted line-clamp-1">{r.description}</span>}
          </button>
        ))}
        {query.length > 1 && results.length === 0 && (
          <span className="text-[11px] text-muted px-2 py-1 block">No results</span>
        )}
      </div>
    </div>
  )
}

function SourceControlPanel() {
  const { user } = useAuth()
  const { data: recentCommits = [] } = useQuery({
    queryKey: ['sidebar-commits'],
    queryFn: async () => {
      const { data: memberData } = await supabase.from('team_members').select('project_id').eq('user_id', user.id)
      const projectIds = memberData?.map(m => m.project_id) || []
      if (projectIds.length === 0) return []
      const { data } = await supabase
        .from('activity_logs')
        .select('id, action, created_at, metadata, profiles:actor_id(username, full_name)')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
        .limit(15)
      return data || []
    },
  })

  const grouped = recentCommits.reduce((acc, c) => {
    const day = new Date(c.created_at).toLocaleDateString()
    if (!acc[day]) acc[day] = []
    acc[day].push(c)
    return acc
  }, {})

  return (
    <div className="p-3">
      <span className="text-[11px] font-bold text-muted uppercase tracking-wider px-2 block mb-2">Recent Activity</span>
      {Object.entries(grouped).map(([day, commits]) => (
        <div key={day} className="mb-2">
          <span className="text-[10px] font-mono text-muted/60 px-2 block mb-1">{day}</span>
          <div className="space-y-0.5">
            {commits.map(c => (
              <div key={c.id} className="flex items-start gap-2 px-2 py-1 rounded-md hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[12px] text-primary mt-0.5 shrink-0">circle</span>
                <div className="min-w-0">
                  <span className="text-[11px] text-on-surface-variant block truncate">{c.metadata?.task_title || c.action}</span>
                  <span className="text-[10px] text-muted font-mono">{c.profiles?.username || 'user'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {recentCommits.length === 0 && (
        <span className="text-[11px] text-muted px-2 py-1 block">No recent activity</span>
      )}
    </div>
  )
}

function NotificationsPanel({ onOpenPrefs }) {
  return (
    <div className="p-3">
      <NotificationBell expanded />
      <button onClick={onOpenPrefs}
        className="mt-3 w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left hover:bg-surface-container-high transition-colors text-muted">
        <span className="material-symbols-outlined text-[14px]">settings</span>
        <span className="text-[12px]">Notification preferences</span>
      </button>
    </div>
  )
}

const PANELS = {
  explorer: ExplorerPanel,
  search: SearchPanel,
  source: SourceControlPanel,
  notifications: NotificationsPanel,
}

export default function Layout() {
  const { profile, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activePanel, setActivePanel] = useState('explorer')
  const [panelExpanded, setPanelExpanded] = useState(true)
  const [showNotifPrefs, setShowNotifPrefs] = useState(false)
  const sessionWarning = useSessionTimeout()

  useEffect(() => { setSidebarOpen(false) }, [location.pathname])

  useEffect(() => {
    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      const item = ICON_ITEMS.find(i => i.shortcut.toLowerCase() === e.key.toLowerCase())
      if (item) {
        e.preventDefault()
        if (activePanel === item.id && panelExpanded) {
          setPanelExpanded(false)
        } else {
          setActivePanel(item.id)
          setPanelExpanded(true)
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [activePanel, panelExpanded])

  const PanelComponent = PANELS[activePanel]

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <a href="#main-content" className="skip-link">Skip to content</a>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed top-0 left-0 h-screen z-50 flex lg:z-40 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="w-[48px] h-full bg-surface-container-lowest border-r border-line flex flex-col items-center py-2 gap-1 shrink-0">
          {ICON_ITEMS.map(item => (
            <button key={item.id}
              onClick={() => {
                if (activePanel === item.id && panelExpanded) {
                  setPanelExpanded(false)
                } else {
                  setActivePanel(item.id)
                  setPanelExpanded(true)
                }
              }}
              title={`${item.label} (${item.shortcut})`}
              className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                activePanel === item.id && panelExpanded
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-surface-container-high hover:text-on-surface'
              }`}>
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
            </button>
          ))}

          <div className="flex-1" />

          <Link to="/dashboard" title="Dashboard" className="w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:bg-surface-container-high hover:text-on-surface transition-all">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
          </Link>
          <Link to="/profile" title="Profile" className="w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:bg-surface-container-high hover:text-on-surface transition-all">
            <span className="material-symbols-outlined text-[20px]">person</span>
          </Link>
          <button onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted hover:bg-surface-container-high hover:text-on-surface transition-all">
            <span className="material-symbols-outlined text-[20px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
          </button>

          <div className="w-8 h-8 rounded-full bg-primary/10 border border-line flex items-center justify-center text-primary text-[11px] font-bold mt-1 cursor-pointer" onClick={signOut} title="Sign out">
            {profile?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>

        <div className={`h-full bg-surface-container-lowest border-r border-line transition-all duration-200 overflow-hidden ${panelExpanded ? 'w-[240px]' : 'w-0'}`}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-line">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">
              {ICON_ITEMS.find(i => i.id === activePanel)?.label || 'Panel'}
            </span>
            <button onClick={() => setPanelExpanded(false)} className="text-muted hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          </div>
          {panelExpanded && <PanelComponent onOpenPrefs={() => setShowNotifPrefs(true)} />}
        </div>
      </aside>

      <div className={`flex flex-col flex-1 h-screen overflow-hidden transition-[margin] duration-200 ${panelExpanded ? 'lg:ml-[288px]' : 'lg:ml-[48px]'}`}>

        <header className="sticky top-0 z-30 h-[48px] w-full border-b border-line bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[20px] text-muted">menu</span>
            </button>
            <div className="flex items-center gap-1.5 text-[13px]">
              <span className="text-on-surface font-semibold">BuildTogether</span>
              <span className="text-muted/40">/</span>
              <span className="text-muted font-mono">
                {location.pathname === '/dashboard' ? 'Dashboard' :
                 location.pathname === '/explore' ? 'Discover' :
                 location.pathname === '/profile' ? 'Profile' :
                 location.pathname === '/projects/new' ? 'New Project' : 'Workspace'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <UserSearch />
            <NotificationBell />
          </div>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-5">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      <ShortcutsModal />
      <OnboardingTour />
      {showNotifPrefs && <NotificationPreferences onClose={() => setShowNotifPrefs(false)} />}
      {sessionWarning}
    </div>
  )
}
