import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuthHook'
import { formatDistanceToNow } from 'date-fns'
import { ACTIVITY_ICONS, ACTIVITY_LABELS } from '../lib/activity'
import { useState, useEffect } from 'react'

export default function ActivityFeed({ projectId, limit = 30 }) {
  const { user } = useAuth()
  const [liveItems, setLiveItems] = useState([])

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activity', projectId, user.id, limit],
    queryFn: async () => {
      if (projectId) {
        const { data } = await supabase
          .from('activity_logs')
          .select('*, profiles:actor_id(username, full_name, avatar_url)')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(limit)
        return data || []
      } else {
        const { data: memberData } = await supabase.from('team_members').select('project_id').eq('user_id', user.id)
        const projectIds = memberData?.map(m => m.project_id) || []
        if (projectIds.length === 0) return []
        const { data } = await supabase
          .from('activity_logs')
          .select('*, profiles:actor_id(username, full_name, avatar_url)')
          .in('project_id', projectIds)
          .order('created_at', { ascending: false })
          .limit(limit)
        return data || []
      }
    },
  })

  useEffect(() => {
    if (!projectId) return
    const channel = supabase.channel(`activity-live-${projectId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'activity_logs', filter: `project_id=eq.${projectId}` }, async (payload) => {
        const { data: profile } = await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', payload.new.actor_id).single()
        setLiveItems(prev => [{ ...payload.new, profiles: profile }, ...prev].slice(0, 5))
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [projectId])

  useEffect(() => {
    if (liveItems.length > 0) {
      const timer = setTimeout(() => setLiveItems([]), 5000)
      return () => clearTimeout(timer)
    }
  }, [liveItems])

  if (isLoading) return <div className="flex justify-center py-8"><div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>

  const allActivities = [...liveItems, ...activities]

  if (allActivities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low/50 p-8 text-center">
        <span className="material-symbols-outlined text-[32px] text-outline mb-2">history</span>
        <p className="text-[14px] text-on-surface-variant">No activity yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-0">
      <h2 className="mb-4 text-[16px] font-semibold text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] text-primary">history</span> Activity
        {liveItems.length > 0 && (
          <span className="flex items-center gap-1 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-mono text-success">LIVE</span>
          </span>
        )}
      </h2>
      {allActivities.map((activity, i) => {
        const icon = ACTIVITY_ICONS[activity.action] || 'circle'
        const label = ACTIVITY_LABELS[activity.action] || activity.action
        const actor = activity.profiles
        const isNew = liveItems.some(l => l.id === activity.id)
        return (
          <div key={activity.id} className={`flex gap-3 py-3 relative transition-all duration-300 ${isNew ? 'bg-success/5 -mx-2 px-2 rounded-lg' : ''}`}>
            {i < allActivities.length - 1 && (
              <div className="absolute left-[11px] top-10 bottom-0 w-px bg-outline-variant/20" />
            )}
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 relative z-10 ${
              isNew ? 'bg-success/20 border border-success/40' : 'bg-surface-container-high border border-outline-variant/40'
            }`}>
              <span className={`material-symbols-outlined text-[12px] ${isNew ? 'text-success' : 'text-primary'}`}>{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-on-surface">
                <span className="font-medium">{actor?.full_name || actor?.username || 'Unknown'}</span>
                {' '}{label}
                {activity.metadata?.task_title && <span className="text-on-surface-variant"> — "{activity.metadata.task_title}"</span>}
                {activity.metadata?.status_from && activity.metadata?.status_to && (
                  <span className="text-on-surface-variant"> from {activity.metadata.status_from} to {activity.metadata.status_to}</span>
                )}
              </p>
              <span className="text-[11px] font-mono text-on-surface-variant">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
