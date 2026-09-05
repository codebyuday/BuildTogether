import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const STATUS_COLS = ['todo', 'in_progress', 'in_review', 'done']
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('overview')
  const [showApply, setShowApply] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', assignee_id: '' })
  const [draggedTask, setDraggedTask] = useState(null)

  useEffect(() => {
    const channel = supabase
      .channel(`project-${id}-tasks`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['tasks', id] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications', filter: `project_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['applications', id] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members', filter: `project_id=eq.${id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['members', id] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, queryClient])

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*, profiles:owner_id(id, username, full_name)').eq('id', id).single()
      return data
    },
  })

  const { data: members = [] } = useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('*, profiles:user_id(id, username, full_name)').eq('project_id', id)
      return data || []
    },
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data } = await supabase.from('tasks').select('*, profiles:assignee_id(username, full_name)').eq('project_id', id).order('position')
      return data || []
    },
  })

  const { data: applications = [] } = useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      const { data } = await supabase.from('applications').select('*, profiles:user_id(username, full_name)').eq('project_id', id).order('created_at', { ascending: false })
      return data || []
    },
    enabled: project?.owner_id === user.id,
  })

  const isOwner = project?.owner_id === user.id
  const isMember = members.some(m => m.user_id === user.id) || isOwner

  const applyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('applications').insert({ project_id: id, user_id: user.id, message: applyMsg })
      if (error) throw error
      await supabase.from('notifications').insert({
        user_id: project.owner_id, type: 'application', message: `New application from ${user.email} for ${project.title}`,
        project_id: id, entity_id: user.id,
      })
    },
    onSuccess: () => { toast.success('Application sent!'); setShowApply(false); setApplyMsg('') },
    onError: (err) => toast.error(err.message),
  })

  const reviewMutation = useMutation({
    mutationFn: async ({ appId, status, appUserId }) => {
      const { error } = await supabase.from('applications').update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq('id', appId)
      if (error) throw error
      if (status === 'accepted') {
        await supabase.from('team_members').insert({ project_id: id, user_id: appUserId, role: 'member' })
        await supabase.from('notifications').insert({
          user_id: appUserId, type: 'application_accepted', message: `Your application to ${project.title} was accepted!`,
          project_id: id,
        })
      }
    },
    onSuccess: () => { toast.success('Application reviewed'); queryClient.invalidateQueries({ queryKey: ['applications', id] }); queryClient.invalidateQueries({ queryKey: ['members', id] }) },
    onError: (err) => toast.error(err.message),
  })

  const addTaskMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('tasks').insert({
        project_id: id, title: newTask.title, priority: newTask.priority,
        assignee_id: newTask.assignee_id || null, created_by: user.id, status: 'todo', position: tasks.length,
      })
      if (error) throw error
    },
    onSuccess: () => { toast.success('Task created'); setShowAddTask(false); setNewTask({ title: '', priority: 'medium', assignee_id: '' }) },
    onError: (err) => toast.error(err.message),
  })

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }) => {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', id] }),
  })

  const deleteTask = useMutation({
    mutationFn: async (taskId) => { const { error } = await supabase.from('tasks').delete().eq('id', taskId); if (error) throw error },
    onSuccess: () => { toast.success('Task deleted'); queryClient.invalidateQueries({ queryKey: ['tasks', id] }) },
  })

  const removeMember = useMutation({
    mutationFn: async (memberId) => {
      const { error } = await supabase.from('team_members').delete().eq('id', memberId)
      if (error) throw error
      await supabase.from('tasks').update({ assignee_id: null }).eq('project_id', id).eq('assignee_id', memberId)
    },
    onSuccess: () => { toast.success('Member removed'); queryClient.invalidateQueries({ queryKey: ['members', id] }) },
  })

  const handleDragStart = useCallback((e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }, [])

  const handleDrop = useCallback((e, targetStatus) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== targetStatus) {
      updateTaskStatus.mutate({ taskId: draggedTask.id, status: targetStatus })
    }
    setDraggedTask(null)
  }, [draggedTask, updateTaskStatus])

  if (!project) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'team', label: `Team (${members.length})` },
    { key: 'board', label: `Board (${tasks.length})` },
  ]
  if (isOwner) tabs.push({ key: 'applications', label: `Applications (${applications.filter(a => a.status === 'pending').length})` })

  return (
    <div className="mx-auto max-w-[1200px] space-y-space-lg">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-space-xs mb-2">
              <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded ${
                project.status === 'recruiting' ? 'bg-secondary/10 text-secondary border border-secondary/30' :
                project.status === 'full' ? 'bg-tertiary/10 text-tertiary border border-tertiary/30' :
                'bg-surface-container-high text-on-surface-variant border border-outline-variant/40'
              }`}>{project.status}</span>
              <span className="text-[11px] font-mono text-on-surface-variant">
                Owner: {project.profiles?.full_name || project.profiles?.username}
              </span>
            </div>
            <h1 className="text-[24px] font-bold text-on-surface tracking-tight">{project.title}</h1>
            <p className="mt-1 text-[14px] text-on-surface-variant max-w-2xl">{project.description}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(project.tech_stack || []).map(t => (
                <span key={t} className="px-2 py-0.5 text-[11px] font-mono rounded bg-surface-container-high border border-outline-variant/40 text-on-surface-variant">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-1.5 text-[12px] font-mono text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                Repository
              </a>
            )}
            {!isOwner && !isMember && project.status === 'recruiting' && (
              <button onClick={() => setShowApply(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary text-on-primary px-4 py-1.5 text-[13px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined text-[14px]">send</span>
                Apply
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-0 border-b border-outline-variant/30">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-[13px] font-medium transition-colors ${
              tab === t.key ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}>{t.label}</button>
        ))}
      </div>

      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-6 shadow-2xl">
            <h3 className="mb-4 text-[16px] font-semibold text-on-surface">Apply to {project.title}</h3>
            <textarea value={applyMsg} onChange={e => setApplyMsg(e.target.value)}
              className="mb-4 w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-[14px] text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              rows={4} placeholder="Why do you want to join? What skills do you bring?" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowApply(false)} className="rounded-lg px-3 py-1.5 text-[13px] text-on-surface-variant hover:text-on-surface">Cancel</button>
              <button onClick={() => applyMutation.mutate()} disabled={!applyMsg.trim() || applyMutation.isPending}
                className="rounded-lg bg-primary text-on-primary px-4 py-1.5 text-[13px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all">
                {applyMutation.isPending ? 'Sending...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'overview' && (
        <div className="grid gap-space-lg lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-space-lg">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg">
              <h3 className="mb-2 text-[14px] font-semibold text-on-surface">About</h3>
              <p className="text-[14px] text-on-surface-variant whitespace-pre-wrap">{project.description}</p>
            </div>
          </div>
          <div className="space-y-space-lg">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg">
              <h3 className="mb-3 text-[14px] font-semibold text-on-surface">Details</h3>
              <dl className="space-y-2 text-[12px]">
                <div className="flex justify-between"><dt className="text-on-surface-variant">Members</dt><dd className="text-on-surface font-mono">{members.length}</dd></div>
                <div className="flex justify-between"><dt className="text-on-surface-variant">Tasks</dt><dd className="text-on-surface font-mono">{tasks.length}</dd></div>
                <div className="flex justify-between"><dt className="text-on-surface-variant">Visibility</dt><dd className="text-on-surface font-mono capitalize">{project.visibility}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {tab === 'team' && (
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between rounded-lg border border-outline-variant/40 bg-surface-container p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 border border-outline-variant/40 flex items-center justify-center text-primary text-[12px] font-bold">
                  {m.profiles?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <span className="text-[14px] font-medium text-on-surface">{m.profiles?.full_name || m.profiles?.username}</span>
                  <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant/40">{m.role}</span>
                </div>
              </div>
              {isOwner && m.role !== 'owner' && (
                <button onClick={() => { if (confirm(`Remove ${m.profiles?.username}?`)) removeMember.mutate(m.id) }}
                  className="rounded p-1.5 text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[16px]">person_remove</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'board' && (
        <div className="space-y-space-md">
          {isMember && (
            <div className="flex justify-end">
              <button onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary text-on-primary px-3 py-1.5 text-[13px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined text-[14px]">add</span>
                Add Task
              </button>
            </div>
          )}
          <div className="flex gap-space-md overflow-x-auto pb-4 items-start">
            {STATUS_COLS.map(col => {
              const colTasks = tasks.filter(t => t.status === col)
              return (
                <div key={col} className="w-[320px] flex-shrink-0 flex flex-col bg-surface-container-low/60 border border-outline-variant/30 rounded-lg max-h-full"
                  onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col)}>
                  <div className="p-3 border-b border-outline-variant/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-semibold text-on-surface">{STATUS_LABELS[col]}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant/40">{colTasks.length}</span>
                    </div>
                  </div>
                  <div className="p-2.5 flex flex-col gap-2.5 overflow-y-auto min-h-[100px]">
                    {colTasks.map(task => (
                      <div key={task.id} draggable={isMember} onDragStart={(e) => handleDragStart(e, task)}
                        className={`bg-surface-container border border-outline-variant/40 hover:border-outline transition p-3 rounded flex flex-col gap-2.5 group cursor-grab shadow-sm ${
                          draggedTask?.id === task.id ? 'opacity-50' : ''
                        }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                            task.priority === 'urgent' || task.priority === 'high' ? 'bg-error-container/30 text-error border border-error/20' :
                            task.priority === 'medium' ? 'bg-surface-container-high text-on-surface-variant border border-outline-variant/40' :
                            'bg-surface-container-high text-outline border border-outline-variant/30'
                          }`}>{task.priority?.toUpperCase()}</span>
                          {isOwner && (
                            <button onClick={() => deleteTask.mutate(task.id)}
                              className="hidden rounded p-0.5 text-on-surface-variant hover:text-error group-hover:block transition-colors">
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          )}
                        </div>
                        <h4 className="text-[14px] text-on-surface group-hover:text-primary transition leading-snug">{task.title}</h4>
                        <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                          {task.profiles && <span className="text-[11px] font-mono text-on-surface-variant">@{task.profiles.username}</span>}
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setShowAddTask(true)}
                      className="w-full py-2 border border-dashed border-outline-variant/40 hover:border-primary/60 rounded text-[11px] font-mono text-on-surface-variant hover:text-primary flex items-center justify-center gap-1 transition">
                      <span className="material-symbols-outlined text-[12px]">add</span>
                      + Add Task
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {showAddTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-6 shadow-2xl">
                <h3 className="mb-4 text-[16px] font-semibold text-on-surface">New Task</h3>
                <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="mb-3 w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Task title" />
                <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  className="mb-3 w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select>
                <select value={newTask.assignee_id} onChange={e => setNewTask({ ...newTask, assignee_id: e.target.value })}
                  className="mb-4 w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value="">Unassigned</option>
                  {members.map(m => <option key={m.user_id} value={m.user_id}>{m.profiles?.full_name || m.profiles?.username}</option>)}
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddTask(false)} className="rounded-lg px-3 py-1.5 text-[13px] text-on-surface-variant hover:text-on-surface">Cancel</button>
                  <button onClick={() => addTaskMutation.mutate()} disabled={!newTask.title.trim() || addTaskMutation.isPending}
                    className="rounded-lg bg-primary text-on-primary px-4 py-1.5 text-[13px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all">
                    {addTaskMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'applications' && (
        <div className="space-y-2">
          {applications.filter(a => a.status === 'pending').map(app => (
            <div key={app.id} className="flex items-center justify-between rounded-lg border border-outline-variant/40 bg-surface-container p-4">
              <div>
                <span className="text-[14px] font-medium text-on-surface">{app.profiles?.full_name || app.profiles?.username}</span>
                <p className="mt-1 text-[12px] text-on-surface-variant">{app.message}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => reviewMutation.mutate({ appId: app.id, status: 'accepted', appUserId: app.user_id })}
                  className="rounded-lg bg-secondary/10 p-2 text-secondary hover:bg-secondary/20 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </button>
                <button onClick={() => reviewMutation.mutate({ appId: app.id, status: 'rejected', appUserId: app.user_id })}
                  className="rounded-lg bg-error/10 p-2 text-error hover:bg-error/20 transition-colors">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            </div>
          ))}
          {applications.filter(a => a.status === 'pending').length === 0 && (
            <div className="rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low/50 p-8 text-center">
              <p className="text-[14px] text-on-surface-variant">No pending applications.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
