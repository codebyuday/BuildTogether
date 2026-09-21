import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

const SUGGESTIONS = {
  low_activity: [
    "The team hasn't pushed commits in a while. Consider scheduling a standup.",
    "Task velocity has dropped. Check if blockers need attention.",
    "No recent code reviews. Encourage team to review open PRs.",
  ],
  high_activity: [
    "Great momentum! Keep up the collaborative energy.",
    "Multiple tasks completed today. Consider updating the roadmap.",
    "High activity detected. Make sure to document decisions.",
  ],
  task_focused: [
    "There are urgent tasks that need attention.",
    "Consider breaking large tasks into smaller subtasks.",
    "Some tasks have been in review for a while. Ping reviewers.",
  ],
  team_focused: [
    "New team members could use an onboarding walkthrough.",
    "Consider assigning mentors for complex tasks.",
    "Team standup notes could help sync everyone up.",
  ],
}

function generateSuggestions(tasks, members, activities) {
  const suggestions = []
  const recentActivities = activities.filter(a => {
    const d = new Date(a.created_at)
    return d > new Date(Date.now() - 24 * 60 * 60 * 1000)
  })

  if (recentActivities.length > 5) {
    suggestions.push(...SUGGESTIONS.high_activity)
  } else if (recentActivities.length === 0) {
    suggestions.push(...SUGGESTIONS.low_activity)
  }

  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done')
  if (urgentTasks.length > 0) {
    suggestions.push(`🔴 ${urgentTasks.length} urgent task${urgentTasks.length > 1 ? 's' : ''} needs attention`)
  }

  const staleTasks = tasks.filter(t => {
    const created = new Date(t.created_at)
    return t.status === 'todo' && (Date.now() - created.getTime()) > 7 * 86400000
  })
  if (staleTasks.length > 0) {
    suggestions.push(`📋 ${staleTasks.length} task${staleTasks.length > 1 ? 's' : ''} older than 7 days in backlog`)
  }

  const inReview = tasks.filter(t => t.status === 'in_review')
  if (inReview.length > 0) {
    suggestions.push(`👀 ${inReview.length} task${inReview.length > 1 ? 's' : ''} waiting for review`)
  }

  if (members.length > 0) {
    suggestions.push(`👥 ${members.length} team member${members.length > 1 ? 's' : ''} active in this project`)
  }

  suggestions.push(...SUGGESTIONS.team_focused.slice(0, 1))

  return suggestions.slice(0, 5)
}

export default function AIPanel({ projectId }) {
  const [minimized, setMinimized] = useState(false)

  const { data: tasks = [] } = useQuery({
    queryKey: ['ai-tasks', projectId],
    queryFn: async () => {
      const { data } = await supabase.from('tasks').select('status, priority, created_at, assignee_id').eq('project_id', projectId)
      return data || []
    },
    enabled: !!projectId,
  })

  const { data: members = [] } = useQuery({
    queryKey: ['ai-members', projectId],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('id').eq('project_id', projectId)
      return data || []
    },
    enabled: !!projectId,
  })

  const { data: activities = [] } = useQuery({
    queryKey: ['ai-activities', projectId],
    queryFn: async () => {
      const { data } = await supabase.from('activity_logs').select('action, created_at').eq('project_id', projectId).order('created_at', { ascending: false }).limit(30)
      return data || []
    },
    enabled: !!projectId,
  })

  const suggestions = generateSuggestions(tasks, members, activities)

  if (minimized) {
    return (
      <button onClick={() => setMinimized(false)}
        className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:brightness-110 transition-all active:scale-95"
        title="AI Assistant">
        <span className="material-symbols-outlined text-[22px]">smart_toy</span>
      </button>
    )
  }

  return (
    <div className="fixed bottom-5 right-5 z-40 w-[300px] bg-surface-container-lowest border border-line rounded-xl shadow-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-primary/5">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-primary">smart_toy</span>
          <span className="text-[13px] font-semibold text-on-surface">AI Assistant</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[9px] font-mono text-success">LIVE</span>
          </span>
        </div>
        <button onClick={() => setMinimized(true)} className="text-muted hover:text-on-surface transition-colors">
          <span className="material-symbols-outlined text-[16px]">minimize</span>
        </button>
      </div>
      <div className="p-3 max-h-[300px] overflow-y-auto space-y-2">
        {suggestions.map((s, i) => (
          <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-surface-container-low border border-line">
            <span className="material-symbols-outlined text-[14px] text-primary mt-0.5 shrink-0">auto_awesome</span>
            <span className="text-[12px] text-on-surface-variant leading-relaxed">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
