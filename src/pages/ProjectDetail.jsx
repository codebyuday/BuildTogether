import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import TaskEditModal from '../components/TaskEditModal'
import RoadmapTab from '../components/RoadmapTab'
import ActivityFeed from '../components/ActivityFeed'
import GitHubPanel from '../components/GitHubPanel'
import RepoConnectModal from '../components/RepoConnectModal'
import ExportDropdown from '../components/ExportDropdown'
import StarButton from '../components/StarButton'
import MarkdownRenderer from '../components/MarkdownRenderer'
import { CardSkeleton, TaskCardSkeleton } from '../components/Skeleton'
import { logActivity } from '../lib/activity'

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
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', assignee_id: '', description: '' })
  const [editingTask, setEditingTask] = useState(null)
  const [showRepoConnect, setShowRepoConnect] = useState(false)
  const [draggedTask, setDraggedTask] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    const channel = supabase.channel(`project-${id}-realtime`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${id}` }, () => queryClient.invalidateQueries({ queryKey: ['tasks', id] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications', filter: `project_id=eq.${id}` }, () => queryClient.invalidateQueries({ queryKey: ['applications', id] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members', filter: `project_id=eq.${id}` }, () => queryClient.invalidateQueries({ queryKey: ['members', id] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'milestones', filter: `project_id=eq.${id}` }, () => queryClient.invalidateQueries({ queryKey: ['milestones', id] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => queryClient.invalidateQueries({ queryKey: ['comments'] }))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs', filter: `project_id=eq.${id}` }, () => queryClient.invalidateQueries({ queryKey: ['activity', id] }))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [id, queryClient])

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => { const { data } = await supabase.from('projects').select('*, profiles:owner_id(id, username, full_name)').eq('id', id).single(); return data },
  })
  const { data: members = [] } = useQuery({
    queryKey: ['members', id],
    queryFn: async () => { const { data } = await supabase.from('team_members').select('*, profiles:user_id(id, username, full_name)').eq('project_id', id); return data || [] },
  })
  const { data: tasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => { const { data } = await supabase.from('tasks').select('*, profiles:assignee_id(username, full_name), labels:task_labels(label_id, labels(id, name, color))').eq('project_id', id).order('position'); return data || [] },
  })
  const { data: applications = [] } = useQuery({
    queryKey: ['applications', id],
    queryFn: async () => { const { data } = await supabase.from('applications').select('*, profiles:user_id(username, full_name)').eq('project_id', id).order('created_at', { ascending: false }); return data || [] },
    enabled: project?.owner_id === user.id,
  })
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', id],
    queryFn: async () => { const { data } = await supabase.from('milestones').select('*').eq('project_id', id).order('order'); return data || [] },
  })
  const { data: labels = [] } = useQuery({
    queryKey: ['labels', id],
    queryFn: async () => { const { data } = await supabase.from('labels').select('*').eq('project_id', id); return data || [] },
  })

  const isOwner = project?.owner_id === user.id
  const isMember = members.some(m => m.user_id === user.id) || isOwner

  const applyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('applications').insert({ project_id: id, user_id: user.id, message: applyMsg })
      if (error) throw error
      await supabase.from('notifications').insert({ user_id: project.owner_id, type: 'application', message: `${user.email} applied to ${project.title}`, project_id: id, entity_id: user.id })
      await logActivity({ projectId: id, userId: user.id, action: 'application.submitted', entityType: 'project', entityId: id })
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
        await supabase.from('notifications').insert({ user_id: appUserId, type: 'application_accepted', message: `Your application to ${project.title} was accepted!`, project_id: id })
        await logActivity({ projectId: id, userId: user.id, action: 'application.accepted', entityType: 'application', entityId: appId })
        await logActivity({ projectId: id, userId: appUserId, action: 'member.added', entityType: 'member' })
      } else {
        await logActivity({ projectId: id, userId: user.id, action: 'application.rejected', entityType: 'application', entityId: appId })
      }
    },
    onSuccess: () => { toast.success('Application reviewed'); queryClient.invalidateQueries({ queryKey: ['applications', id] }); queryClient.invalidateQueries({ queryKey: ['members', id] }) },
    onError: (err) => toast.error(err.message),
  })

  const addTaskMutation = useMutation({
    mutationFn: async () => {
      const pos = tasks.filter(t => t.status === 'todo').length
      const { data, error } = await supabase.from('tasks').insert({
        project_id: id, title: newTask.title, description: newTask.description || null,
        priority: newTask.priority, assignee_id: newTask.assignee_id || null,
        created_by: user.id, status: 'todo', position: pos,
      }).select().single()
      if (error) throw error
      await logActivity({ projectId: id, userId: user.id, action: 'task.created', entityType: 'task', entityId: data.id, metadata: { task_title: newTask.title } })
    },
    onSuccess: () => { toast.success('Task created'); setShowAddTask(false); setNewTask({ title: '', priority: 'medium', assignee_id: '', description: '' }); queryClient.invalidateQueries({ queryKey: ['tasks', id] }) },
    onError: (err) => toast.error(err.message),
  })

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }) => {
      const task = tasks.find(t => t.id === taskId)
      const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId)
      if (error) throw error
      await logActivity({ projectId: id, userId: user.id, action: 'task.status_changed', entityType: 'task', entityId: taskId, metadata: { task_title: task?.title, status_from: task?.status, status_to: status } })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', id] }),
  })

  const deleteTask = useMutation({
    mutationFn: async (taskId) => {
      const task = tasks.find(t => t.id === taskId)
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
      await logActivity({ projectId: id, userId: user.id, action: 'task.deleted', entityType: 'task', entityId: taskId, metadata: { task_title: task?.title } })
    },
    onSuccess: () => { toast.success('Task deleted'); queryClient.invalidateQueries({ queryKey: ['tasks', id] }) },
  })

  const removeMember = useMutation({
    mutationFn: async (member) => {
      const { error } = await supabase.from('team_members').delete().eq('id', member.id)
      if (error) throw error
      await supabase.from('tasks').update({ assignee_id: null }).eq('project_id', id).eq('assignee_id', member.user_id)
      await logActivity({ projectId: id, userId: user.id, action: 'member.removed', entityType: 'member', metadata: { username: member.profiles?.username } })
    },
    onSuccess: () => { toast.success('Member removed'); queryClient.invalidateQueries({ queryKey: ['members', id] }) },
  })

  const editMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('projects').update({
        title: editForm.title, description: editForm.description, status: editForm.status,
        visibility: editForm.visibility, repo_url: editForm.repo_url, tech_stack: editForm.tech_stack,
      }).eq('id', id)
      if (error) throw error
      await logActivity({ projectId: id, userId: user.id, action: 'project.updated', entityType: 'project', entityId: id })
    },
    onSuccess: () => { toast.success('Project updated'); setEditing(false); queryClient.invalidateQueries({ queryKey: ['project', id] }) },
    onError: (err) => toast.error(err.message),
  })

  const deleteProject = useMutation({
    mutationFn: async () => {
      await logActivity({ projectId: id, userId: user.id, action: 'project.deleted', entityType: 'project', entityId: id })
      const { error } = await supabase.from('projects').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => { toast.success('Project deleted'); window.location.href = '/dashboard' },
    onError: (err) => toast.error(err.message),
  })

  const handleDragStart = useCallback((e, task) => { setDraggedTask(task); e.dataTransfer.effectAllowed = 'move' }, [])
  const handleDragOver = useCallback((e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move' }, [])
  const handleDrop = useCallback((e, targetStatus) => {
    e.preventDefault()
    if (draggedTask && draggedTask.status !== targetStatus) updateTaskStatus.mutate({ taskId: draggedTask.id, status: targetStatus })
    setDraggedTask(null)
  }, [draggedTask, updateTaskStatus])

  if (!project) return (
    <div className="mx-auto max-w-[1200px] space-y-space-lg">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg animate-pulse">
        <div className="h-6 w-48 bg-surface-container-high rounded mb-3" />
        <div className="h-4 w-64 bg-surface-container-high rounded mb-2" />
        <div className="h-3 w-96 bg-surface-container-high rounded" />
      </div>
      <div className="flex gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 w-24 bg-surface-container-high rounded animate-pulse" />)}</div>
      <div className="grid gap-space-lg lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-space-lg">{Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        <div className="space-y-space-lg">{Array.from({ length: 2 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      </div>
    </div>
  )

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'roadmap', label: `Roadmap (${milestones.length})` },
    { key: 'board', label: `Board (${tasks.length})` },
    { key: 'team', label: `Team (${members.length})` },
    { key: 'github', label: 'GitHub' },
    { key: 'activity', label: 'Activity' },
  ]
  if (isOwner) tabs.push({ key: 'applications', label: `Applications (${applications.filter(a => a.status === 'pending').length})` })

  return (
    <div className="mx-auto max-w-[1200px] space-y-space-lg print:space-y-4">
      <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg print:bg-white print:border-gray-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
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
            <div className="mt-2 text-[14px] text-on-surface-variant max-w-2xl">
              <MarkdownRenderer>{project.description}</MarkdownRenderer>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(project.tech_stack || []).map(t => (
                <span key={t} className="px-2 py-0.5 text-[11px] font-mono rounded bg-surface-container-high border border-outline-variant/40 text-on-surface-variant">{t}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <StarButton projectId={id} />
            {project.repo_url && (
              <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-1.5 text-[12px] font-mono text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[14px]">open_in_new</span> Repo
              </a>
            )}
            {isMember && <ExportDropdown project={project} tasks={tasks} milestones={milestones} />}
            {isOwner && (
              <button onClick={() => setShowRepoConnect(true)}
                className="flex items-center gap-1 rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-1.5 text-[12px] font-mono text-on-surface-variant hover:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-[14px]">link</span> Connect Repo
              </button>
            )}
            {!isOwner && !isMember && project.status === 'recruiting' && (
              <button onClick={() => setShowApply(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary text-on-primary px-4 py-1.5 text-[13px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined text-[14px]">send</span> Apply
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-0 border-b border-outline-variant/30 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-[13px] font-medium transition-colors whitespace-nowrap ${
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

      {showRepoConnect && <RepoConnectModal projectId={id} currentRepoUrl={project.repo_url} onClose={() => setShowRepoConnect(false)} />}

      {editingTask && <TaskEditModal task={editingTask} projectId={id} members={members} onClose={() => setEditingTask(null)} />}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-low border border-outline-variant/40 rounded-xl shadow-2xl p-space-lg">
            <h3 className="text-[16px] font-semibold text-on-surface mb-4">Edit Project</h3>
            <div className="space-y-4">
              <div><label className="text-[11px] font-mono text-on-surface-variant uppercase">Title</label>
                <input required value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1" /></div>
              <div><label className="text-[11px] font-mono text-on-surface-variant uppercase">Description (Markdown)</label>
                <textarea value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} rows={6}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none mt-1 font-mono" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-[11px] font-mono text-on-surface-variant uppercase">Status</label>
                  <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary outline-none mt-1">
                    <option value="recruiting">Recruiting</option><option value="full">Full</option><option value="archived">Archived</option>
                  </select></div>
                <div><label className="text-[11px] font-mono text-on-surface-variant uppercase">Visibility</label>
                  <select value={editForm.visibility} onChange={e => setEditForm({ ...editForm, visibility: e.target.value })}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary outline-none mt-1">
                    <option value="public">Public</option><option value="private">Private</option>
                  </select></div>
              </div>
              <div><label className="text-[11px] font-mono text-on-surface-variant uppercase">Repo URL</label>
                <input value={editForm.repo_url || ''} onChange={e => setEditForm({ ...editForm, repo_url: e.target.value })}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary outline-none mt-1" /></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button type="submit" onClick={() => editMutation.mutate()} disabled={editMutation.isPending}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all">
                {editMutation.isPending ? 'Saving...' : 'Save Changes'}</button>
              <button onClick={() => setEditing(false)} className="px-4 py-2 text-[13px] text-on-surface-variant hover:text-on-surface">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'overview' && (
        <div className="grid gap-space-lg lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-space-lg">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg print:bg-white print:border-gray-200">
              <h3 className="mb-3 text-[14px] font-semibold text-on-surface">About</h3>
              <MarkdownRenderer>{project.description}</MarkdownRenderer>
            </div>
            {project.spec && (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg">
                <h3 className="mb-3 text-[14px] font-semibold text-on-surface">Spec</h3>
                <MarkdownRenderer>{project.spec}</MarkdownRenderer>
              </div>
            )}
          </div>
          <div className="space-y-space-lg">
            <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg">
              <h3 className="mb-3 text-[14px] font-semibold text-on-surface">Details</h3>
              <dl className="space-y-2 text-[12px]">
                <div className="flex justify-between"><dt className="text-on-surface-variant">Members</dt><dd className="text-on-surface font-mono">{members.length}</dd></div>
                <div className="flex justify-between"><dt className="text-on-surface-variant">Tasks</dt><dd className="text-on-surface font-mono">{tasks.length}</dd></div>
                <div className="flex justify-between"><dt className="text-on-surface-variant">Milestones</dt><dd className="text-on-surface font-mono">{milestones.length}</dd></div>
                <div className="flex justify-between"><dt className="text-on-surface-variant">Labels</dt><dd className="text-on-surface font-mono">{labels.length}</dd></div>
                <div className="flex justify-between"><dt className="text-on-surface-variant">Visibility</dt><dd className="text-on-surface font-mono capitalize">{project.visibility}</dd></div>
              </dl>
            </div>
            {isOwner && (
              <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg space-y-2">
                <button onClick={() => { setEditForm({ title: project.title, description: project.description || '', status: project.status, visibility: project.visibility, repo_url: project.repo_url || '', tech_stack: project.tech_stack || [] }); setEditing(true) }}
                  className="flex items-center gap-2 w-full rounded-lg border border-outline-variant/40 bg-surface-container px-3 py-2 text-[13px] text-on-surface-variant hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-[14px]">edit</span> Edit Project
                </button>
                <button onClick={() => { if (confirm('Delete this project? This cannot be undone.')) deleteProject.mutate() }}
                  className="flex items-center gap-2 w-full rounded-lg border border-error/30 bg-surface-container px-3 py-2 text-[13px] text-error hover:bg-error/10 transition-colors">
                  <span className="material-symbols-outlined text-[14px]">delete</span> Delete Project
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'roadmap' && <RoadmapTab projectId={id} isMember={isMember} />}

      {tab === 'board' && (
        <div className="space-y-space-md">
          {isMember && (
            <div className="flex justify-end">
              <button onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary text-on-primary px-3 py-1.5 text-[13px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
                <span className="material-symbols-outlined text-[14px]">add</span> Add Task
              </button>
            </div>
          )}
          {loadingTasks ? (
            <div className="flex gap-space-md overflow-x-auto pb-4 items-start">
              {STATUS_COLS.map(col => (
                <div key={col} className="w-[320px] flex-shrink-0 bg-surface-container-low/60 border border-outline-variant/30 rounded-lg p-3">
                  <div className="h-5 w-20 bg-surface-container-high rounded mb-3 animate-pulse" />
                  <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <TaskCardSkeleton key={i} />)}</div>
                </div>
              ))}
            </div>
          ) : (
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
                    {colTasks.map(task => {
                      const taskLabels = task.labels?.map(tl => tl.labels).filter(Boolean) || []
                      return (
                        <div key={task.id} draggable={isMember} onDragStart={(e) => handleDragStart(e, task)}
                          onClick={() => setEditingTask(task)}
                          className={`bg-surface-container border border-outline-variant/40 hover:border-outline transition p-3 rounded flex flex-col gap-2 group cursor-grab shadow-sm ${
                            draggedTask?.id === task.id ? 'opacity-50' : ''
                          }`}>
                          {taskLabels.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {taskLabels.map(l => (
                                <span key={l.id} className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium" style={{ backgroundColor: l.color + '20', color: l.color, border: `1px solid ${l.color}40` }}>{l.name}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                              task.priority === 'urgent' || task.priority === 'high' ? 'bg-error-container/30 text-error border border-error/20' :
                              task.priority === 'medium' ? 'bg-surface-container-high text-on-surface-variant border border-outline-variant/40' :
                              'bg-surface-container-high text-outline border border-outline-variant/30'
                            }`}>{task.priority?.toUpperCase()}</span>
                            {isOwner && (
                              <button onClick={(e) => { e.stopPropagation(); deleteTask.mutate(task.id) }}
                                className="hidden rounded p-0.5 text-on-surface-variant hover:text-error group-hover:block transition-colors">
                                <span className="material-symbols-outlined text-[14px]">delete</span>
                              </button>
                            )}
                          </div>
                          <h4 className="text-[14px] text-on-surface group-hover:text-primary transition leading-snug">{task.title}</h4>
                          {task.description && (
                            <p className="text-[11px] text-on-surface-variant line-clamp-2">{task.description}</p>
                          )}
                          <div className="flex items-center justify-between pt-1 border-t border-outline-variant/20">
                            <div className="flex items-center gap-2">
                              {task.due_date && (
                                <span className={`text-[10px] font-mono flex items-center gap-0.5 ${
                                  new Date(task.due_date) < new Date() ? 'text-error' : 'text-on-surface-variant'
                                }`}>
                                  <span className="material-symbols-outlined text-[10px]">event</span>
                                  {task.due_date}
                                </span>
                              )}
                            </div>
                            {task.profiles && <span className="text-[11px] font-mono text-on-surface-variant">@{task.profiles.username}</span>}
                          </div>
                        </div>
                      )
                    })}
                    <button onClick={() => setShowAddTask(true)}
                      className="w-full py-2 border border-dashed border-outline-variant/40 hover:border-primary/60 rounded text-[11px] font-mono text-on-surface-variant hover:text-primary flex items-center justify-center gap-1 transition">
                      <span className="material-symbols-outlined text-[12px]">add</span> + Add Task
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          )}

          {showAddTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-xl border border-outline-variant/40 bg-surface-container-low p-6 shadow-2xl">
                <h3 className="mb-4 text-[16px] font-semibold text-on-surface">New Task</h3>
                <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="mb-3 w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Task title" />
                <textarea value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })} rows={2}
                  className="mb-3 w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  placeholder="Description (optional)" />
                <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  className="mb-3 w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
                </select>
                <select value={newTask.assignee_id} onChange={e => setNewTask({ ...newTask, assignee_id: e.target.value })}
                  className="mb-4 w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 text-[14px] text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none">
                  <option value="">Unassigned</option>
                  {members.map(m => <option key={m.user_id} value={m.user_id}>{m.profiles?.full_name || m.profiles?.username}</option>)}
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddTask(false)} className="rounded-lg px-3 py-1.5 text-[13px] text-on-surface-variant hover:text-on-surface">Cancel</button>
                  <button onClick={() => newTask.title.trim() && addTaskMutation.mutate()} disabled={!newTask.title.trim() || addTaskMutation.isPending}
                    className="rounded-lg bg-primary text-on-primary px-4 py-1.5 text-[13px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all">
                    {addTaskMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          )}
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
                <button onClick={() => { if (confirm(`Remove ${m.profiles?.username}?`)) removeMember.mutate(m) }}
                  className="rounded p-1.5 text-on-surface-variant hover:bg-error-container/30 hover:text-error transition-colors">
                  <span className="material-symbols-outlined text-[16px]">person_remove</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'github' && (
        <div>
          {project.repo_url ? (
            <GitHubPanel repoUrl={project.repo_url} />
          ) : (
            <div className="rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low/50 p-8 text-center">
              <span className="material-symbols-outlined text-[32px] text-outline mb-2">link</span>
              <p className="text-[14px] text-on-surface-variant mb-3">No GitHub repository connected.</p>
              {isOwner && (
                <button onClick={() => setShowRepoConnect(true)}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-primary-container transition-all">
                  Connect Repository
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'activity' && <ActivityFeed projectId={id} />}

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
