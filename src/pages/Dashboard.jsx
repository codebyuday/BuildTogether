import { lazy, Suspense, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import ActivityFeed from '../components/ActivityFeed'
import NumberTicker from '../components/NumberTicker'
import EmptyState from '../components/EmptyState'
import { StatSkeleton, CardSkeleton } from '../components/Skeleton'
import { PieChart, Pie, Cell } from 'recharts'

const DashboardCharts = lazy(() => import('../components/DashboardCharts'))

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getCompletionData(tasks) {
  const total = tasks.length
  const done = tasks.filter(t => t.status === 'done').length
  return [
    { name: 'Done', value: done },
    { name: 'Remaining', value: total - done },
  ]
}

function generateHeatmap(activities) {
  const map = new Map()
  const now = new Date()
  for (let i = 0; i < 365; i++) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    map.set(d.toISOString().slice(0, 10), 0)
  }
  activities.forEach(a => {
    const day = a.created_at?.slice(0, 10)
    if (map.has(day)) map.set(day, (map.get(day) || 0) + 1)
  })
  const max = Math.max(...map.values(), 1)
  return { days: [...map.values()].reverse(), max }
}

function TrendBadge({ value, good }) {
  if (value === 0) return null
  const up = value > 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-lg ${
      (up && good) || (!up && !good) ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
    }`}>
      {up ? '↑' : '↓'} {Math.abs(value).toFixed(1)}%
    </span>
  )
}

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
        .neq('status', 'done')
        .order('created_at', { ascending: false })
      return data || []
    },
  })

  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-my-tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('status, priority, created_at')
        .eq('assignee_id', user.id)
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

  const { data: activities = [] } = useQuery({
    queryKey: ['user-activity-log'],
    queryFn: async () => {
      const { data: memberData } = await supabase.from('team_members').select('project_id').eq('user_id', user.id)
      const projectIds = memberData?.map(m => m.project_id) || []
      if (projectIds.length === 0) return []
      const { data } = await supabase
        .from('activity_logs')
        .select('id, created_at, action, metadata')
        .in('project_id', projectIds)
        .eq('actor_id', user.id)
        .order('created_at', { ascending: false })
      return data || []
    },
  })

  const { data: allTasksThisWeek = [] } = useQuery({
    queryKey: ['tasks-this-week'],
    queryFn: async () => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)
      const [thisWeek, lastWeek] = await Promise.all([
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('assignee_id', user.id).eq('status', 'done').gte('updated_at', weekAgo.toISOString()),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('assignee_id', user.id).eq('status', 'done').gte('updated_at', twoWeeksAgo.toISOString()).lt('updated_at', weekAgo.toISOString()),
      ])
      return { thisWeek: thisWeek.count || 0, lastWeek: lastWeek.count || 0 }
    },
  })

  const heatmap = useMemo(() => generateHeatmap(activities), [activities])
  const completionData = useMemo(() => getCompletionData(allTasks), [allTasks])
  const completionPct = allTasks.length > 0 ? Math.round((allTasks.filter(t => t.status === 'done').length / allTasks.length) * 100) : 0

  const sprintVelocity = useMemo(() => {
    if (allTasks.length === 0) return 0
    const projectCreated = projects.length > 0 ? new Date(projects.map(p => p.created_at).sort()[0]) : new Date()
    const daysSince = Math.max(1, Math.floor((Date.now() - projectCreated.getTime()) / 86400000))
    return (allTasks.filter(t => t.status === 'done').length / daysSince).toFixed(1)
  }, [allTasks, projects])

  const locCount = useMemo(() => {
    return activities.filter(a => a.action?.includes('file') || a.action?.includes('code')).length * 42 + activities.length * 8
  }, [activities])

  const trend = useMemo(() => {
    const tw = allTasksThisWeek.thisWeek || 0
    const lw = allTasksThisWeek.lastWeek || 0
    if (lw === 0) return { value: tw > 0 ? 100 : 0, good: true }
    return { value: ((tw - lw) / lw * 100), good: true }
  }, [allTasksThisWeek])

  const isLoading = loadingProjects || !projects

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {isLoading ? Array.from({ length: 5 }).map((_, i) => <StatSkeleton key={i} />) : (
          <>
            <div className="bg-surface-container-lowest border border-line rounded-xl p-4 lg:col-span-2 card-hover">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">My Projects</span>
                  <span className="font-heading text-[28px] font-light text-on-surface leading-none">
                    <NumberTicker value={projects.length} duration={1200} />
                  </span>
                </div>
                <TrendBadge value={trend.value} good={trend.good} />
              </div>
            </div>
            <div className="bg-surface-container-lowest border border-line rounded-xl p-4 card-hover">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Member Of</span>
              <span className="font-heading text-[24px] font-light text-on-surface leading-none">
                <NumberTicker value={memberProjects.length} duration={1200} />
              </span>
            </div>
            <div className="bg-surface-container-lowest border border-line rounded-xl p-4 card-hover">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Open Tasks</span>
              <span className="font-heading text-[24px] font-light text-on-surface leading-none">
                <NumberTicker value={tasks.length} duration={1200} />
              </span>
            </div>
            <div className="bg-surface-container-lowest border border-line rounded-xl p-4 card-hover">
              <span className="text-[11px] font-bold text-muted uppercase tracking-wider block">Applications</span>
              <span className="font-heading text-[24px] font-light text-on-surface leading-none">
                <NumberTicker value={applications.filter(a => a.status === 'pending').length} duration={1200} />
              </span>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="bg-surface-container-lowest border border-line rounded-xl p-5 flex flex-col items-center">
          <h3 className="text-[13px] font-bold text-on-surface mb-3">Task Completion</h3>
          <div className="relative w-[120px] h-[120px]">
            <PieChart width={120} height={120}>
              <Pie data={completionData} cx="50%" cy="50%" innerRadius={38} outerRadius={54} paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                <Cell fill="#5B7553" />
                <Cell fill="var(--color-surface-container-high)" />
              </Pie>
            </PieChart>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[22px] font-heading font-bold text-on-surface">{allTasks.length > 0 ? completionPct : 0}<span className="text-[12px] text-muted">%</span></span>
            </div>
          </div>
          <span className="text-[11px] text-muted mt-1">{allTasks.filter(t => t.status === 'done').length} of {allTasks.length} done</span>
        </div>

        <div className="bg-surface-container-lowest border border-line rounded-xl p-5">
          <h3 className="text-[13px] font-bold text-on-surface mb-3">Performance</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-surface-container-low border border-line">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Sprint Velocity</span>
              <span className="text-[20px] font-heading font-bold text-on-surface">{sprintVelocity}<span className="text-[11px] font-normal text-muted ml-1">tasks/day</span></span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low border border-line">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">LOC Contributed</span>
              <span className="text-[20px] font-heading font-bold text-on-surface">{(locCount / 1000).toFixed(1)}<span className="text-[11px] font-normal text-muted ml-1">k lines</span></span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-low border border-line">
              <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">Commits</span>
              <span className="text-[20px] font-heading font-bold text-on-surface"><NumberTicker value={activities.length} duration={1200} /></span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-line rounded-xl p-5 lg:col-span-2">
          <h3 className="text-[13px] font-bold text-on-surface mb-3">Contributions</h3>
          <div className="flex gap-[3px] overflow-x-auto pb-1">
            {heatmap.days.map((count, i) => {
              const intensity = count === 0 ? 0 : Math.min(4, Math.ceil((count / heatmap.max) * 4))
              const colors = ['var(--color-surface-container-high)', '#c6e0b8', '#7bc47f', '#3a8e3f', '#1a5c1a']
              return (
                <div key={i} className="flex flex-col gap-[3px] shrink-0">
                  <div
                    className="w-[11px] h-[11px] rounded-[2px]"
                    style={{ backgroundColor: colors[intensity] }}
                    title={`${count} activities`}
                  />
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted font-mono">365 days ago</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted">Less</span>
              {['var(--color-surface-container-high)', '#c6e0b8', '#7bc47f', '#3a8e3f', '#1a5c1a'].map((c, i) => (
                <div key={i} className="w-[11px] h-[11px] rounded-[2px]" style={{ backgroundColor: c }} />
              ))}
              <span className="text-[10px] text-muted">More</span>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={null}><DashboardCharts /></Suspense>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="lg:col-span-1">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-on-surface">My Tasks</h2>
            <span className="text-[11px] font-mono text-muted">{tasks.length} open</span>
          </div>
          {loadingTasks ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
          ) : tasks.length === 0 ? (
            <EmptyState icon="task_alt" title="No open tasks" description="No tasks assigned to you yet." />
          ) : (
            <div className="space-y-1.5">
              {tasks.slice(0, 8).map(t => (
                <Link key={t.id} to={`/projects/${t.project_id}`}
                  className="flex items-center justify-between rounded-lg bg-surface-container-lowest border border-line px-3.5 py-3 hover:border-line-2 hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`h-2 w-2 rounded-full shrink-0 ${
                      t.status === 'done' ? 'bg-success' :
                      t.status === 'in_progress' ? 'bg-primary' :
                      t.status === 'in_review' ? 'bg-tertiary' :
                      'bg-muted/40'
                    }`} />
                    <div className="min-w-0">
                      <span className="text-[13px] text-on-surface group-hover:text-primary transition font-medium block truncate">{t.title}</span>
                      {t.projects && <span className="text-[11px] text-muted font-mono">{t.projects.title}</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                    t.priority === 'urgent' || t.priority === 'high' ? 'bg-tag-orange-bg text-tag-orange-text border border-tag-orange-border' :
                    t.priority === 'medium' ? 'bg-surface-container-high text-muted' :
                    'bg-surface-container-high text-muted'
                  }`}>{t.priority}</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="lg:col-span-2 space-y-5">
          {starredProjects.length > 0 && (
            <div>
              <h2 className="mb-3 text-[15px] font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-tertiary">star</span> Starred
              </h2>
              <div className="space-y-1.5">
                {starredProjects.slice(0, 3).map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`}
                    className="flex items-center justify-between rounded-lg bg-surface-container-lowest border border-line px-3.5 py-3 hover:border-line-2 hover:-translate-y-0.5 transition-all group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
                        <span className="material-symbols-outlined text-[16px]">star</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-medium text-on-surface group-hover:text-primary transition truncate">{p.title}</h3>
                        <p className="text-[11px] text-muted line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                      p.status === 'recruiting' ? 'bg-success/10 text-success border border-success/20' :
                      p.status === 'full' ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' :
                      'bg-surface-container-high text-muted'
                    }`}>{p.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-semibold text-on-surface">My Projects</h2>
              <Link to="/explore" className="text-[12px] font-semibold text-primary hover:underline flex items-center gap-1 transition-colors">
                Explore <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
            {projects.length === 0 ? (
              <EmptyState
                icon="folder_open"
                title="No projects yet"
                description="Create your first project to get started."
                actionLabel="Create your first project"
                actionTo="/projects/new"
              />
            ) : (
              <div className="space-y-1.5">
                {projects.slice(0, 5).map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`}
                    className="flex items-center justify-between rounded-lg bg-surface-container-lowest border border-line px-3.5 py-3 hover:border-line-2 hover:-translate-y-0.5 transition-all group">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[16px]">folder</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-[13px] font-medium text-on-surface group-hover:text-primary transition truncate">{p.title}</h3>
                        <p className="text-[11px] text-muted line-clamp-1">{p.description}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                      p.status === 'recruiting' ? 'bg-success/10 text-success border border-success/20' :
                      p.status === 'full' ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' :
                      'bg-surface-container-high text-muted'
                    }`}>{p.status}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActivityFeed projectId={null} />
        </div>
        <div className="lg:col-span-1">
          <TeamPerformancePanel projectId={null} />
        </div>
      </div>
    </div>
  )
}

function TeamPerformancePanel({ projectId }) {
  const { user } = useAuth()

  const { data: members = [] } = useQuery({
    queryKey: ['team-performance', projectId],
    queryFn: async () => {
      let projectIds
      if (projectId) {
        projectIds = [projectId]
      } else {
        const { data: memberData } = await supabase.from('team_members').select('project_id').eq('user_id', user.id)
        projectIds = memberData?.map(m => m.project_id) || []
      }
      if (projectIds.length === 0) return []

      const { data: teamData } = await supabase
        .from('team_members')
        .select('*, profiles:user_id(id, username, full_name, avatar_url)')
        .in('project_id', projectIds)

      const uniqueUsers = new Map()
      teamData?.forEach(m => {
        if (m.profiles && !uniqueUsers.has(m.user_id)) {
          uniqueUsers.set(m.user_id, { ...m.profiles, role: m.role, projectCount: 1 })
        } else if (uniqueUsers.has(m.user_id)) {
          uniqueUsers.get(m.user_id).projectCount++
        }
      })

      const userIds = [...uniqueUsers.keys()]
      if (userIds.length === 0) return []

      const { data: tasks } = await supabase
        .from('tasks')
        .select('assignee_id, status, priority, title')
        .in('assignee_id', userIds)

      const { data: activities } = await supabase
        .from('activity_logs')
        .select('actor_id')
        .in('actor_id', userIds)
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString())

      return [...uniqueUsers.values()].map(u => {
        const userTasks = tasks?.filter(t => t.assignee_id === u.id) || []
        const activeTask = userTasks.find(t => t.status === 'in_progress')
        const activityCount = activities?.filter(a => a.actor_id === u.id).length || 0
        return {
          ...u,
          activeTask: activeTask?.title || 'No active task',
          priority: activeTask?.priority || 'none',
          activityThisWeek: activityCount,
        }
      }).sort((a, b) => b.activityThisWeek - a.activityThisWeek)
    },
  })

  if (members.length === 0) return null

  return (
    <div className="bg-surface-container-lowest border border-line rounded-xl p-5">
      <h3 className="text-[13px] font-bold text-on-surface mb-3">Team Performance</h3>
      <div className="space-y-2">
        {members.slice(0, 5).map((m, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-surface-container-low border border-line">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[12px] font-bold shrink-0">
              {m.full_name?.[0] || m.username?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[12px] font-medium text-on-surface block truncate">{m.full_name || m.username}</span>
              <span className="text-[10px] text-muted truncate block">{m.role}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-[10px] font-mono text-muted block">{m.activeTask}</span>
              <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                m.priority === 'urgent' ? 'bg-danger/10 text-danger' :
                m.priority === 'high' ? 'bg-tag-orange-bg text-tag-orange-text' :
                m.priority === 'medium' ? 'bg-surface-container-high text-muted' :
                'bg-surface-container-high text-muted'
              }`}>{m.priority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
