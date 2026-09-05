import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import {
  Users, GitBranch, ExternalLink, Send, Check, X,
  Plus, GripVertical, Trash2, Edit3, ArrowRight,
} from 'lucide-react'

const STATUS_COLS = ['todo', 'in_progress', 'in_review', 'done']
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }
const PRIORITY_COLORS = {
  low: 'bg-slate-700/50 text-slate-400',
  medium: 'bg-amber-500/10 text-amber-400',
  high: 'bg-orange-500/10 text-orange-400',
  urgent: 'bg-red-500/10 text-red-400',
}

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('overview')
  const [showApply, setShowApply] = useState(false)
  const [applyMsg, setApplyMsg] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', assignee_id: '' })

  const { data: project } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('projects')
        .select('*, profiles:owner_id(id, username, full_name)')
        .eq('id', id).single()
      return data
    },
  })

  const { data: members = [] } = useQuery({
    queryKey: ['members', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('team_members')
        .select('*, profiles:user_id(id, username, full_name)')
        .eq('project_id', id)
      return data || []
    },
  })

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*, profiles:assignee_id(username, full_name)')
        .eq('project_id', id)
        .order('position')
      return data || []
    },
  })

  const { data: applications = [] } = useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('applications')
        .select('*, profiles:user_id(username, full_name)')
        .eq('project_id', id)
        .order('created_at', { ascending: false })
      return data || []
    },
    enabled: project?.owner_id === user.id,
  })

  const isOwner = project?.owner_id === user.id
  const isMember = members.some(m => m.user_id === user.id) || isOwner

  // Apply mutation
  const applyMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('applications').insert({
        project_id: id, user_id: user.id, message: applyMsg,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Application sent!')
      setShowApply(false)
      setApplyMsg('')
      queryClient.invalidateQueries({ queryKey: ['applications', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  // Accept/Reject mutations
  const reviewMutation = useMutation({
    mutationFn: async ({ appId, status }) => {
      const { error } = await supabase
        .from('applications')
        .update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() })
        .eq('id', appId)
      if (error) throw error

      if (status === 'accepted') {
        const app = applications.find(a => a.id === appId)
        if (app) {
          await supabase.from('team_members').insert({
            project_id: id, user_id: app.user_id, role: 'member',
          })
        }
      }
    },
    onSuccess: () => {
      toast.success('Application reviewed')
      queryClient.invalidateQueries({ queryKey: ['applications', id] })
      queryClient.invalidateQueries({ queryKey: ['members', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  // Add task
  const addTaskMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('tasks').insert({
        project_id: id,
        title: newTask.title,
        priority: newTask.priority,
        assignee_id: newTask.assignee_id || null,
        created_by: user.id,
        status: 'todo',
        position: tasks.length,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Task created')
      setShowAddTask(false)
      setNewTask({ title: '', priority: 'medium', assignee_id: '' })
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
    onError: (err) => toast.error(err.message),
  })

  // Update task status
  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }) => {
      const { error } = await supabase.from('tasks').update({ status }).eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', id] }),
  })

  // Delete task
  const deleteTask = useMutation({
    mutationFn: async (taskId) => {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId)
      if (error) throw error
    },
    onSuccess: () => {
      toast.success('Task deleted')
      queryClient.invalidateQueries({ queryKey: ['tasks', id] })
    },
  })

  if (!project) return (
    <div className="flex justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
    </div>
  )

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'team', label: `Team (${members.length})` },
    { key: 'board', label: 'Board' },
  ]
  if (isOwner) tabs.push({ key: 'applications', label: `Applications (${applications.filter(a => a.status === 'pending').length})` })

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{project.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{project.description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
              project.status === 'recruiting' ? 'bg-green-500/10 text-green-400' :
              project.status === 'full' ? 'bg-amber-500/10 text-amber-400' :
              'bg-slate-700/50 text-slate-400'
            }`}>{project.status}</span>
            {(project.tech_stack || []).map(t => (
              <span key={t} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">{t}</span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {project.repo_url && (
            <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800">
              <GitBranch size={14} /> Repository <ExternalLink size={10} />
            </a>
          )}
          {!isOwner && !isMember && project.status === 'recruiting' && (
            <button onClick={() => setShowApply(true)}
              className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-500">
              <Send size={14} /> Apply
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-800">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-xs font-medium transition-colors ${
              tab === t.key ? 'border-b-2 border-primary-500 text-primary-400' : 'text-slate-400 hover:text-white'
            }`}>{t.label}</button>
        ))}
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6">
            <h3 className="mb-4 text-lg font-semibold text-white">Apply to {project.title}</h3>
            <textarea value={applyMsg} onChange={e => setApplyMsg(e.target.value)}
              className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              rows={4} placeholder="Why do you want to join? What skills do you bring?" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowApply(false)} className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
              <button onClick={() => applyMutation.mutate()} disabled={!applyMsg.trim()}
                className="rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-500 disabled:opacity-50">
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Overview */}
      {tab === 'overview' && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="mb-2 text-sm font-semibold text-white">About</h3>
              <p className="text-sm text-slate-400 whitespace-pre-wrap">{project.description}</p>
            </div>
            {project.spec && (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
                <h3 className="mb-2 text-sm font-semibold text-white">Spec</h3>
                <p className="text-sm text-slate-400 whitespace-pre-wrap">{project.spec}</p>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="mb-3 text-sm font-semibold text-white">Details</h3>
              <dl className="space-y-2 text-xs">
                <div className="flex justify-between"><dt className="text-slate-500">Owner</dt><dd className="text-white">{project.profiles?.full_name || project.profiles?.username}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Visibility</dt><dd className="text-white capitalize">{project.visibility}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Members</dt><dd className="text-white">{members.length}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Tasks</dt><dd className="text-white">{tasks.length}</dd></div>
              </dl>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Team */}
      {tab === 'team' && (
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600/20 text-xs font-bold text-primary-400">
                  {m.profiles?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <span className="text-sm font-medium text-white">{m.profiles?.full_name || m.profiles?.username}</span>
                  <span className="ml-2 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">{m.role}</span>
                </div>
              </div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
              <p className="text-sm text-slate-400">No team members yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Board */}
      {tab === 'board' && (
        <div className="space-y-4">
          {isMember && (
            <div className="flex justify-end">
              <button onClick={() => setShowAddTask(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-500">
                <Plus size={14} /> Add Task
              </button>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-4">
            {STATUS_COLS.map(col => {
              const colTasks = tasks.filter(t => t.status === col)
              return (
                <div key={col} className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">{STATUS_LABELS[col]}</h4>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500">{colTasks.length}</span>
                  </div>
                  <div className="min-h-[100px] space-y-2 rounded-lg border border-slate-800 bg-slate-900/50 p-2">
                    {colTasks.map(task => (
                      <div key={task.id} className="group rounded-lg border border-slate-800 bg-slate-900 p-3">
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-white">{task.title}</span>
                          {isMember && (
                            <div className="hidden gap-1 group-hover:flex">
                              {STATUS_COLS.filter(s => s !== task.status).slice(0, 2).map(s => (
                                <button key={s} onClick={() => updateTaskStatus.mutate({ taskId: task.id, status: s })}
                                  className="rounded bg-slate-800 px-1 py-0.5 text-[9px] text-slate-400 hover:text-white"
                                  title={`Move to ${STATUS_LABELS[s]}`}>
                                  →{STATUS_LABELS[s].split(' ')[0]}
                                </button>
                              ))}
                              {isOwner && (
                                <button onClick={() => deleteTask.mutate(task.id)}
                                  className="rounded bg-slate-800 px-1 py-0.5 text-[9px] text-red-400 hover:text-red-300">
                                  <Trash2 size={10} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[task.priority]}`}>
                            {task.priority}
                          </span>
                          {task.profiles && (
                            <span className="text-[10px] text-slate-500">{task.profiles.username}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Add Task Modal */}
          {showAddTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">New Task</h3>
                <input value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                  placeholder="Task title" />
                <select value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                  className="mb-3 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
                <select value={newTask.assignee_id} onChange={e => setNewTask({ ...newTask, assignee_id: e.target.value })}
                  className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none">
                  <option value="">Unassigned</option>
                  {members.map(m => (
                    <option key={m.user_id} value={m.user_id}>{m.profiles?.full_name || m.profiles?.username}</option>
                  ))}
                </select>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowAddTask(false)} className="rounded-lg px-3 py-1.5 text-xs text-slate-400 hover:text-white">Cancel</button>
                  <button onClick={() => addTaskMutation.mutate()} disabled={!newTask.title.trim()}
                    className="rounded-lg bg-primary-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-primary-500 disabled:opacity-50">
                    Create Task
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Applications */}
      {tab === 'applications' && (
        <div className="space-y-3">
          {applications.filter(a => a.status === 'pending').map(app => (
            <div key={app.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4">
              <div>
                <span className="text-sm font-medium text-white">{app.profiles?.full_name || app.profiles?.username}</span>
                <p className="mt-1 text-xs text-slate-400">{app.message}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => reviewMutation.mutate({ appId: app.id, status: 'accepted' })}
                  className="rounded-lg bg-green-600/20 p-2 text-green-400 hover:bg-green-600/30">
                  <Check size={14} />
                </button>
                <button onClick={() => reviewMutation.mutate({ appId: app.id, status: 'rejected' })}
                  className="rounded-lg bg-red-600/20 p-2 text-red-400 hover:bg-red-600/30">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
          {applications.filter(a => a.status === 'pending').length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-8 text-center">
              <p className="text-sm text-slate-400">No pending applications.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
