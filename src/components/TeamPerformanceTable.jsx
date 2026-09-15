import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export default function TeamPerformanceTable({ projectId }) {
  const { data: members = [] } = useQuery({
    queryKey: ['team-perf-table', projectId],
    queryFn: async () => {
      const { data: teamData } = await supabase
        .from('team_members')
        .select('*, profiles:user_id(id, username, full_name, avatar_url)')
        .eq('project_id', projectId)

      const userIds = teamData?.map(m => m.user_id) || []
      if (userIds.length === 0) return []

      const [tasksRes, activityRes] = await Promise.all([
        supabase.from('tasks').select('assignee_id, status, priority').in('assignee_id', userIds),
        supabase.from('activity_logs').select('actor_id, created_at').in('actor_id', userIds).gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      ])

      const tasks = tasksRes.data || []
      const activities = activityRes.data || []

      return teamData?.map(m => {
        const profile = m.profiles
        const userTasks = tasks.filter(t => t.assignee_id === m.user_id)
        const doneTasks = userTasks.filter(t => t.status === 'done').length
        const activeTask = userTasks.find(t => t.status === 'in_progress')
        const weekActivity = activities.filter(a => a.actor_id === m.user_id).length
        return {
          id: m.user_id,
          name: profile?.full_name || profile?.username || 'Unknown',
          avatar: profile?.avatar_url,
          role: m.role,
          activeTask: activeTask?.title || '—',
          priority: activeTask?.priority || '—',
          tasksCompleted: doneTasks,
          activityScore: weekActivity,
        }
      }).sort((a, b) => b.activityScore - a.activityScore) || []
    },
  })

  if (members.length === 0) return null

  const maxActivity = Math.max(...members.map(m => m.activityScore), 1)

  return (
    <div className="bg-surface-container-lowest border border-line rounded-xl overflow-hidden">
      <div className="p-4 border-b border-line">
        <h3 className="text-[13px] font-bold text-on-surface">Team Performance</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line">
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted uppercase tracking-wider">Owner</th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted uppercase tracking-wider">Role</th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted uppercase tracking-wider">Active Task</th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted uppercase tracking-wider">Priority</th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted uppercase tracking-wider">Done</th>
              <th className="px-4 py-2.5 text-[11px] font-bold text-muted uppercase tracking-wider">Activity</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr key={m.id} className="border-b border-line last:border-0 hover:bg-surface-container-low/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[11px] font-bold shrink-0">
                      {m.name?.[0] || '?'}
                    </div>
                    <span className="text-[13px] font-medium text-on-surface">{m.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[11px] font-mono text-muted px-2 py-0.5 rounded-lg bg-surface-container-high">{m.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] text-on-surface-variant truncate max-w-[180px] block">{m.activeTask}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg ${
                    m.priority === 'urgent' ? 'bg-danger/10 text-danger border border-danger/20' :
                    m.priority === 'high' ? 'bg-tag-orange-bg text-tag-orange-text border border-tag-orange-border' :
                    m.priority === 'medium' ? 'bg-surface-container-high text-muted' :
                    'bg-surface-container-high text-muted'
                  }`}>{m.priority}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[13px] font-mono font-medium text-on-surface">{m.tasksCompleted}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-container-high overflow-hidden max-w-[80px]">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(m.activityScore / maxActivity) * 100}%` }} />
                    </div>
                    <span className="text-[11px] font-mono text-muted">{m.activityScore}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
