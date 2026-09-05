import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Folder, CheckCircle, Clock, ArrowRight } from 'lucide-react'

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
    { label: 'My Projects', value: projects.length, icon: Folder, color: 'text-primary-400' },
    { label: 'Assigned Tasks', value: tasks.length, icon: CheckCircle, color: 'text-green-400' },
    { label: 'Applications', value: applications.length, icon: Clock, color: 'text-amber-400' },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400">Overview of your projects and activity.</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">{label}</span>
              <Icon size={16} className={color} />
            </div>
            <div className="mt-2 text-3xl font-bold text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">My Projects</h2>
          <Link to="/explore" className="flex items-center gap-1 text-xs text-primary-400 hover:underline">
            Explore <ArrowRight size={12} />
          </Link>
        </div>
        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
            <p className="text-sm text-slate-400">No projects yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.slice(0, 5).map(p => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4 hover:border-slate-700"
              >
                <div>
                  <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{p.description}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  p.status === 'recruiting' ? 'bg-green-500/10 text-green-400' :
                  p.status === 'full' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {p.status}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent Tasks */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">My Tasks</h2>
        {tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
            <p className="text-sm text-slate-400">No tasks assigned to you yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${
                    t.status === 'done' ? 'bg-green-400' :
                    t.status === 'in_progress' ? 'bg-primary-400' :
                    t.status === 'in_review' ? 'bg-amber-400' :
                    'bg-slate-500'
                  }`} />
                  <div>
                    <span className="text-sm text-white">{t.title}</span>
                    {t.projects && <span className="ml-2 text-xs text-slate-500">in {t.projects.title}</span>}
                  </div>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                  t.priority === 'urgent' ? 'bg-red-500/10 text-red-400' :
                  t.priority === 'high' ? 'bg-orange-500/10 text-orange-400' :
                  t.priority === 'medium' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {t.priority}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
