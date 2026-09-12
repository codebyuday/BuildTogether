import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const COLORS = ['#3447D4', '#00AA45', '#E85A2C', '#8B8BA0']

export default function DashboardCharts() {
  const { user } = useAuth()

  const { data: tasks = [] } = useQuery({
    queryKey: ['chart-tasks'],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('status, priority, created_at')
        .eq('assignee_id', user.id)
      return data || []
    },
  })

  const { data: memberProjects = [] } = useQuery({
    queryKey: ['chart-member-projects'],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('projects!inner(id)').eq('user_id', user.id)
      return data || []
    },
  })

  const { data: myProjects = [] } = useQuery({
    queryKey: ['chart-my-projects'],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('id').eq('owner_id', user.id)
      return data || []
    },
  })

  if (tasks.length === 0 && memberProjects.length === 0 && myProjects.length === 0) return null

  const statusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length },
    { name: 'In Review', value: tasks.filter(t => t.status === 'in_review').length },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length },
  ].filter(d => d.value > 0)

  const priorityData = [
    { name: 'Urgent', count: tasks.filter(t => t.priority === 'urgent').length },
    { name: 'High', count: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', count: tasks.filter(t => t.priority === 'low').length },
  ]

  const recentByWeek = Array.from({ length: 4 }, (_, i) => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - (3 - i) * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)
    const count = tasks.filter(t => {
      const d = new Date(t.created_at)
      return d >= weekStart && d < weekEnd
    }).length
    return { week: `W${i + 1}`, tasks: count }
  })

  return (
    <div className="grid gap-5 md:grid-cols-3">
      {statusData.length > 0 && (
        <div className="bg-white border border-line rounded-2xl p-5" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
          <h3 className="text-[13px] font-bold text-on-surface mb-3">Task Status</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E6E4DC' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-1">
            {statusData.map((d, i) => (
              <span key={d.name} className="flex items-center gap-1.5 text-[11px] text-muted">
                <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>
      )}

      {priorityData.some(d => d.count > 0) && (
        <div className="bg-white border border-line rounded-2xl p-5" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
          <h3 className="text-[13px] font-bold text-on-surface mb-3">By Priority</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={priorityData} barSize={20}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E6E4DC' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {priorityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {recentByWeek.some(d => d.tasks > 0) && (
        <div className="bg-white border border-line rounded-2xl p-5" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
          <h3 className="text-[13px] font-bold text-on-surface mb-3">Recent Activity</h3>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={recentByWeek} barSize={24}>
              <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E6E4DC' }} />
              <Bar dataKey="tasks" fill="#3447D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
