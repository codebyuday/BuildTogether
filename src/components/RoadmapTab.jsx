import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import { logActivity } from '../lib/activity'

const STATUS_COLORS = {
  pending: 'bg-outline/20 text-outline border-outline/30',
  active: 'bg-primary/10 text-primary border-primary/30',
  completed: 'bg-secondary/10 text-secondary border-secondary/30',
}

export default function RoadmapTab({ projectId, isMember }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ title: '', phase: '', start_date: '', end_date: '', status: 'pending' })

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const { data } = await supabase.from('milestones').select('*, tasks(id, title, status, assignee_id, profiles:assignee_id(username))')
        .eq('project_id', projectId).order('order')
      return data || []
    },
    enabled: !!projectId,
  })

  const { data: allTasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const { data } = await supabase.from('tasks').select('id, title, status, milestone_id, profiles:assignee_id(username)')
        .eq('project_id', projectId)
      return data || []
    },
    enabled: !!projectId,
  })

  const createMilestone = useMutation({
    mutationFn: async () => {
      const maxOrder = milestones.reduce((max, m) => Math.max(max, m.order || 0), 0)
      const { error } = await supabase.from('milestones').insert({
        project_id: projectId, title: form.title, phase: form.phase || null,
        start_date: form.start_date || null, end_date: form.end_date || null,
        status: form.status, order: maxOrder + 1,
      })
      if (error) throw error
      await logActivity({ projectId, userId: user.id, action: 'milestone.created', entityType: 'milestone', metadata: { title: form.title } })
    },
    onSuccess: () => { toast.success('Milestone created'); setShowCreate(false); setForm({ title: '', phase: '', start_date: '', end_date: '', status: 'pending' }); queryClient.invalidateQueries({ queryKey: ['milestones', projectId] }) },
    onError: (err) => toast.error(err.message),
  })

  const updateMilestoneStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      const { error } = await supabase.from('milestones').update({ status }).eq('id', id)
      if (error) throw error
      if (status === 'completed') {
        await logActivity({ projectId, userId: user.id, action: 'milestone.completed', entityType: 'milestone', entityId: id })
      }
    },
    onSuccess: () => { toast.success('Milestone updated'); queryClient.invalidateQueries({ queryKey: ['milestones', projectId] }) },
  })

  const deleteMilestone = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('milestones').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { toast.success('Milestone deleted'); queryClient.invalidateQueries({ queryKey: ['milestones', projectId] }) },
  })

  const unlinkedTasks = allTasks.filter(t => !t.milestone_id)

  return (
    <div className="space-y-space-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-[16px] font-semibold text-ink">Roadmap</h3>
        {isMember && (
          <button onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-1 bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
            <span className="material-symbols-outlined text-[14px]">add</span>
            Milestone
          </button>
        )}
      </div>

      {showCreate && (
        <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-md space-y-3">
          <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-ink placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Milestone title" />
          <input value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-ink placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="Phase (e.g. Phase 1, Sprint 3)" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-mono text-secondary">Start Date</label>
              <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="text-[11px] font-mono text-secondary">End Date</label>
              <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-ink focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => form.title.trim() && createMilestone.mutate()} disabled={!form.title.trim() || createMilestone.isPending}
              className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all">
              Create
            </button>
            <button onClick={() => setShowCreate(false)} className="text-[13px] text-secondary hover:text-ink">Cancel</button>
          </div>
        </div>
      )}

      {milestones.length === 0 && !showCreate ? (
        <div className="rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low/50 p-8 text-center">
          <span className="material-symbols-outlined text-[32px] text-outline mb-2">flag</span>
          <p className="text-[14px] text-secondary">No milestones yet. Create one to start planning.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {milestones.map(m => {
            const doneTasks = m.tasks?.filter(t => t.status === 'done').length || 0
            const totalTasks = m.tasks?.length || 0
            const progress = totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0

            return (
              <div key={m.id} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-md">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-semibold text-ink">{m.title}</h4>
                      <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${STATUS_COLORS[m.status]}`}>
                        {m.status}
                      </span>
                    </div>
                    {m.phase && <span className="text-[11px] font-mono text-secondary">{m.phase}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    {isMember && m.status !== 'completed' && (
                      <button onClick={() => updateMilestoneStatus.mutate({ id: m.id, status: m.status === 'pending' ? 'active' : 'completed' })}
                        className="text-[11px] text-primary hover:underline">
                        {m.status === 'pending' ? 'Start' : 'Complete'}
                      </button>
                    )}
                    {isMember && (
                      <button onClick={() => { if (confirm('Delete this milestone?')) deleteMilestone.mutate(m.id) }}
                        className="p-1 text-secondary hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {(m.start_date || m.end_date) && (
                  <div className="flex gap-3 text-[11px] font-mono text-secondary mb-2">
                    {m.start_date && <span>Start: {m.start_date}</span>}
                    {m.end_date && <span>End: {m.end_date}</span>}
                  </div>
                )}

                {totalTasks > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-secondary">{doneTasks}/{totalTasks} tasks</span>
                      <span className="text-ink">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                      <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                {m.tasks && m.tasks.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {m.tasks.map(t => (
                      <div key={t.id} className="flex items-center gap-2 text-[12px] py-1 px-2 rounded bg-surface-container/50">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          t.status === 'done' ? 'bg-secondary' : t.status === 'in_progress' ? 'bg-primary' : 'bg-outline'
                        }`} />
                        <span className={`text-ink ${t.status === 'done' ? 'line-through opacity-60' : ''}`}>{t.title}</span>
                        {t.profiles && <span className="text-secondary font-mono ml-auto">@{t.profiles.username}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {unlinkedTasks.length > 0 && milestones.length > 0 && (
        <div className="mt-4">
          <span className="text-[11px] font-mono text-secondary uppercase tracking-wider">Unlinked Tasks ({unlinkedTasks.length})</span>
          <div className="mt-1 space-y-1">
            {unlinkedTasks.slice(0, 5).map(t => (
              <div key={t.id} className="flex items-center gap-2 text-[12px] py-1 px-2 rounded bg-surface-container/30 text-secondary">
                <span className={`w-1.5 h-1.5 rounded-full ${
                  t.status === 'done' ? 'bg-secondary' : t.status === 'in_progress' ? 'bg-primary' : 'bg-outline'
                }`} />
                {t.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
