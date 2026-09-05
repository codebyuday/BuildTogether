import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import ActivityFeed from '../components/ActivityFeed'
import { StatSkeleton, CardSkeleton } from '../components/Skeleton'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ['my-projects'],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('*, profiles:owner_id(username, full_name), team_members(id)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      return data || []
    },
  })

  const { data: memberProjects = [] } = useQuery({
    queryKey: ['member-projects'],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('project_id, projects!inner(id, title, description, status, profiles:owner_id(username, full_name), team_members(id))').eq('user_id', user.id)
      return data?.map(m => m.projects).filter(Boolean) || []
    },
  })

  const { data: starredProjects = [] } = useQuery({
    queryKey: ['starred-projects'],
    queryFn: async () => {
      const { data } = await supabase.from('stars').select('*, projects!inner(id, title, description, status, profiles:owner_id(username, full_name), team_members(id))').eq('user_id', user.id).limit(5)
      return data?.map(s => s.projects).filter(Boolean) || []
    },
  })

  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*, projects:project_id(title)')
        .eq('assignee_id', user.id)
        .eq('status', '!=', 'done')
        .order('created_at', { ascending: false })
      return data || []
    },
  })

  const { data: applications = [] } = useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data } = await supabase
        .from('applications')
        .select('*, projects:project_id(title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      return data || []
    },
  })

  const stats = [
    { label: 'My Projects', value: projects.length, icon: 'folder', color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Member Of', value: memberProjects.length, icon: 'group', color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Open Tasks', value: tasks.length, icon: 'task_alt', color: 'text-tertiary', bg: 'bg-tertiary/10' },
    { label: 'Applications', value: applications.filter(a => a.status === 'pending').length, icon: 'schedule', color: 'text-primary-container', bg: 'bg-primary/10' },
  ]

  const isLoading = loadingProjects || !projects

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />) :
        stats.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 card-hover">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[18px] ${color}`}>{icon}</span>
              </div>
              <div>
                <span className="text-[11px] font-medium text-on-surface-variant/60 uppercase tracking-wider block">{label}</span>
                <span className="text-[22px] font-bold text-on-surface leading-none">{value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[14px] font-semibold text-on-surface">My Tasks</h2>
            <span className="text-[11px] font-mono text-on-surface-variant/50">{tasks.length} open</span>
          </div>
          {loadingTasks ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : tasks.length === 0 ? (
            <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-low/30 p-8 text-center">
              <span className="material-symbols-outlined text-[28px] text-outline/40 mb-2 block">task_alt</span>
              <p className="text-[13px] text-on-surface-variant/60">No open tasks assigned to you.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {tasks.slice(0, 8).map(t => (
                <Link key={t.id} to={`/projects/${t.project_id}`}
                  className="flex items-center justify-between rounded-lg bg-surface-container-low/50 border border-outline-variant/15 px-3 py-2.5 hover:bg-surface-container-high/50 hover:border-outline-variant/30 transition-all group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                      t.status === 'done' ? 'bg-success' :
                      t.status === 'in_progress' ? 'bg-primary' :
                      t.status === 'in_review' ? 'bg-tertiary' :
                      'bg-outline/40'
                    }`} />
                    <div className="min-w-0">
                      <span className="text-[13px] text-on-surface group-hover:text-primary transition block truncate">{t.title}</span>
                      {t.projects && <span className="text-[11px] text-on-surface-variant/50 font-mono">{t.projects.title}</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded shrink-0 ${
                    t.priority === 'urgent' || t.priority === 'high' ? 'bg-error/10 text-error' :
                    t.priority === 'medium' ? 'bg-surface-container-high text-on-surface-variant/60' :
                    'bg-surface-container-high text-outline/60'
                  }`}>{t.priority}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-2 space-y-5">
          {starredProjects.length > 0 && (
            <div>
              <h2 className="mb-3 text-[14px] font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-tertiary">star</span> Starred
              </h2>
              <div className="space-y-1.5">
                {starredProjects.slice(0, 3).map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`}
                    className="flex items-center justify-between rounded-lg bg-surface-container-low/50 border border-outline-variant/15 px-3 py-2.5 hover:bg-surface-container-high/50 hover:border-outline-variant/30 transition-all group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-medium text-on-surface group-hover:text-primary transition truncate">{p.title}</h3>
                        <p className="text-[11px] text-on-surface-variant/50 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded shrink-0 ${
                      p.status === 'recruiting' ? 'bg-success/10 text-success' :
                      p.status === 'full' ? 'bg-tertiary/10 text-tertiary' :
                      'bg-surface-container-high text-on-surface-variant/50'
                    }`}>{p.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[14px] font-semibold text-on-surface">My Projects</h2>
              <Link to="/explore" className="text-[11px] font-mono text-primary/70 hover:text-primary flex items-center gap-1 transition-colors">
                Explore <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
              </Link>
            </div>
            {projects.length === 0 ? (
              <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-low/30 p-8 text-center">
                <span className="material-symbols-outlined text-[28px] text-outline/40 mb-2 block">folder_open</span>
                <p className="text-[13px] text-on-surface-variant/60 mb-3">No projects yet.</p>
                <Link to="/projects/new" className="text-[12px] text-primary font-medium hover:text-primary-container transition-colors">Create your first project</Link>
              </div>
            ) : (
              <div className="space-y-1.5">
                {projects.slice(0, 5).map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`}
                    className="flex items-center justify-between rounded-lg bg-surface-container-low/50 border border-outline-variant/15 px-3 py-2.5 hover:bg-surface-container-high/50 hover:border-outline-variant/30 transition-all group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[14px]">folder</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-medium text-on-surface group-hover:text-primary transition truncate">{p.title}</h3>
                        <p className="text-[11px] text-on-surface-variant/50 line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded shrink-0 ${
                      p.status === 'recruiting' ? 'bg-success/10 text-success' :
                      p.status === 'full' ? 'bg-tertiary/10 text-tertiary' :
                      'bg-surface-container-high text-on-surface-variant/50'
                    }`}>{p.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <ActivityFeed projectId={null} />
    </div>
  )
}
