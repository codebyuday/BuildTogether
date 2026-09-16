import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'
import LabelPicker from './LabelPicker'
import CommentList from './CommentList'
import RichTextEditor from './RichTextEditor'
import { logActivity } from '../lib/activity'

export default function TaskEditModal({ task, projectId, members = [], onClose }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    assignee_id: task?.assignee_id || '',
    due_date: task?.due_date || '',
    milestone_id: task?.milestone_id || '',
  })
  const [selectedLabels, setSelectedLabels] = useState([])

  const { data: labels = [] } = useQuery({
    queryKey: ['labels', projectId],
    queryFn: async () => {
      const { data } = await supabase.from('labels').select('*').eq('project_id', projectId)
      return data || []
    },
    enabled: !!projectId,
  })

  const { data: taskLabels = [] } = useQuery({
    queryKey: ['task-labels', task?.id],
    queryFn: async () => {
      const { data } = await supabase.from('task_labels').select('label_id').eq('task_id', task?.id)
      return (data || []).map(tl => tl.label_id)
    },
    enabled: !!task?.id,
  })

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const { data } = await supabase.from('milestones').select('id, title').eq('project_id', projectId)
      return data || []
    },
    enabled: !!projectId,
  })

  useEffect(() => {
    if (taskLabels.length > 0) setSelectedLabels(taskLabels)
  }, [taskLabels])

  const updateTask = useMutation({
    mutationFn: async () => {
      const oldStatus = task.status
      const oldAssignee = task.assignee_id
      const newAssignee = form.assignee_id || null
      const { error } = await supabase.from('tasks').update({
        title: form.title, description: form.description || null, priority: form.priority,
        status: form.status, assignee_id: newAssignee,
        due_date: form.due_date || null, milestone_id: form.milestone_id || null,
      }).eq('id', task.id)
      if (error) throw error

      if (newAssignee && newAssignee !== oldAssignee && newAssignee !== user.id) {
        await supabase.from('notifications').insert({ user_id: newAssignee, type: 'task_assigned', message: `You were assigned to "${form.title}"`, project_id: projectId, entity_id: task.id })
      }

      await supabase.from('task_labels').delete().eq('task_id', task.id)
      if (selectedLabels.length > 0) {
        await supabase.from('task_labels').insert(selectedLabels.map(lid => ({ task_id: task.id, label_id: lid })))
      }

      const metadata = { task_title: form.title }
      if (oldStatus !== form.status) {
        metadata.status_from = oldStatus
        metadata.status_to = form.status
        await logActivity({ projectId, userId: user.id, action: 'task.status_changed', entityType: 'task', entityId: task.id, metadata })
      } else {
        await logActivity({ projectId, userId: user.id, action: 'task.updated', entityType: 'task', entityId: task.id, metadata })
      }
    },
    onSuccess: () => {
      toast.success('Task updated')
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
      onClose()
    },
    onError: (err) => toast.error(err.message),
  })

  const handleLabelToggle = async (labelId, newLabel) => {
    if (labelId === 'create') {
      const { data, error } = await supabase.from('labels').insert({ project_id: projectId, name: newLabel.name, color: newLabel.color }).select().single()
      if (!error && data) {
        queryClient.invalidateQueries({ queryKey: ['labels', projectId] })
        setSelectedLabels([...selectedLabels, data.id])
      }
    } else {
      setSelectedLabels(prev => prev.includes(labelId) ? prev.filter(id => id !== labelId) : [...prev, labelId])
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest border border-line rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 bg-surface-container-lowest border-b border-line px-6 py-3 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-on-surface">Edit Task</h3>
          <button onClick={onClose} className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-[11px] font-mono text-on-surface-variant uppercase">Title</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="w-full bg-surface-container-low border border-line rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" />
          </div>

          <div>
            <label className="text-[11px] font-mono text-on-surface-variant uppercase">Description</label>
            <div className="mt-1">
              <RichTextEditor content={form.description} onChange={val => setForm({ ...form, description: val })} placeholder="Describe the task..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-on-surface-variant uppercase">Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="w-full bg-surface-container-low border border-line rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1">
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-mono text-on-surface-variant uppercase">Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-surface-container-low border border-line rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-mono text-on-surface-variant uppercase">Assignee</label>
              <select value={form.assignee_id} onChange={e => setForm({ ...form, assignee_id: e.target.value })}
                className="w-full bg-surface-container-low border border-line rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1">
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.user_id} value={m.user_id}>{m.profiles?.full_name || m.profiles?.username}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-mono text-on-surface-variant uppercase">Due Date</label>
              <input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })}
                className="w-full bg-surface-container-low border border-line rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" />
            </div>
          </div>

          {milestones.length > 0 && (
            <div>
              <label className="text-[11px] font-mono text-on-surface-variant uppercase">Milestone</label>
              <select value={form.milestone_id} onChange={e => setForm({ ...form, milestone_id: e.target.value })}
                className="w-full bg-surface-container-low border border-line rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1">
                <option value="">No milestone</option>
                {milestones.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="text-[11px] font-mono text-on-surface-variant uppercase">Labels</label>
            <div className="mt-1">
              <LabelPicker labels={labels} selectedLabels={selectedLabels} onToggle={handleLabelToggle} />
            </div>
          </div>

          {task?.id && (
            <div className="border-t border-line pt-4">
              <CommentList taskId={task.id} projectId={projectId} assigneeId={task.assignee_id} />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-surface-container-lowest border-t border-line px-6 py-3 flex items-center justify-between">
          <div>
            {task?.share_token && (
              <button onClick={() => {
                const url = `${window.location.origin}/share/${task.share_token}`
                navigator.clipboard.writeText(url)
                toast.success('Share link copied!')
              }}
                className="flex items-center gap-1.5 text-[12px] text-muted hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[14px]">share</span>
                Copy share link
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 text-[13px] text-on-surface-variant hover:text-on-surface rounded-lg transition-colors">Cancel</button>
            <button onClick={() => form.title.trim() && updateTask.mutate()} disabled={!form.title.trim() || updateTask.isPending}
              className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all active:scale-[0.98]">
              {updateTask.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
