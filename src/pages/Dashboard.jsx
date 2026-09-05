import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const { user } = useAuth()

  const { data: projects = [] } = useQuery({
    queryKey: ['my-projects'],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('*, profiles:owner_id(username, full_name)')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })
      return data || []
    },
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*, projects:project_id(title)')
        .eq('assignee_id', user.id)
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
    { label: 'Active Projects', value: projects.length, icon: 'folder', accent: 'text-primary' },
    { label: 'Assigned Tasks', value: tasks.length, icon: 'check_circle', accent: 'text-secondary' },
    { label: 'Applications', value: applications.length, icon: 'schedule', accent: 'text-tertiary' },
    { label: 'Open Roles', value: projects.filter(p => p.status === 'recruiting').length * 2, icon: 'group_add', accent: 'text-primary-container' },
  ]

  return (
    <div className="mx-auto max-w-[1200px] space-y-space-lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon, accent }) => (
          <div key={label} className="bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 flex flex-col justify-between hover:border-outline-variant/70 transition">
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="text-[12px] font-semibold uppercase tracking-wider">{label}</span>
              <span className={`material-symbols-outlined text-[18px] ${accent}`}>{icon}</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-[24px] font-bold text-on-surface">{value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-space-lg lg:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[16px] font-semibold text-on-surface">My Projects</h2>
            <Link to="/explore" className="text-[11px] font-mono text-primary hover:underline flex items-center gap-1">
              Explore <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low/50 p-8 text-center">
              <p className="text-[14px] text-on-surface-variant">No projects yet. Create one to get started!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 5).map(p => (
                <Link key={p.id} to={`/projects/${p.id}`}
                  className="flex items-center justify-between rounded-lg border border-outline-variant/40 bg-surface-container p-3 hover:border-outline transition group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-surface-container-high border border-outline-variant/40 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[14px]">folder</span>
                    </div>
                    <div>
                      <h3 className="text-[14px] font-semibold text-on-surface group-hover:text-primary transition">{p.title}</h3>
                      <p className="mt-0.5 text-[12px] text-on-surface-variant line-clamp-1">{p.description}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    p.status === 'recruiting' ? 'bg-secondary/10 text-secondary border border-secondary/30' :
                    p.status === 'full' ? 'bg-tertiary/10 text-tertiary border border-tertiary/30' :
                    'bg-surface-container-high text-on-surface-variant border border-outline-variant/40'
                  }`}>
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-[16px] font-semibold text-on-surface">My Tasks</h2>
          {tasks.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low/50 p-8 text-center">
              <p className="text-[14px] text-on-surface-variant">No tasks assigned to you yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {tasks.slice(0, 5).map(t => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-outline-variant/40 bg-surface-container p-3">
                  <div className="flex items-center gap-3">
                    <span className={`h-2 w-2 rounded-full ${
                      t.status === 'done' ? 'bg-secondary' :
                      t.status === 'in_progress' ? 'bg-primary' :
                      t.status === 'in_review' ? 'bg-tertiary' :
                      'bg-outline'
                    }`} />
                    <div>
                      <span className="text-[14px] text-on-surface">{t.title}</span>
                      {t.projects && <span className="ml-2 text-[11px] text-on-surface-variant font-mono">in {t.projects.title}</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    t.priority === 'urgent' ? 'bg-error-container/30 text-error border border-error/20' :
                    t.priority === 'high' ? 'bg-error-container/30 text-error border border-error/20' :
                    t.priority === 'medium' ? 'bg-surface-container-high text-on-surface-variant border border-outline-variant/40' :
                    'bg-surface-container-high text-outline border border-outline-variant/30'
                  }`}>
                    {t.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
