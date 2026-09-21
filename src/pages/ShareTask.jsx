import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import MarkdownRenderer from '../components/MarkdownRenderer'

export default function ShareTask() {
  const { token } = useParams()

  const { data: task, isLoading } = useQuery({
    queryKey: ['shared-task', token],
    queryFn: async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*, profiles:assignee_id(username, full_name), projects:project_id(title)')
        .eq('share_token', token)
        .single()
      return data
    },
    enabled: !!token,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-muted/30 mb-4 block">link_off</span>
          <h1 className="font-heading text-[24px] font-light text-on-surface mb-2">Task not found</h1>
          <p className="text-[14px] text-muted mb-6">This link may have expired or the task may have been removed.</p>
          <Link to="/" className="text-[14px] text-primary font-semibold hover:underline">Go to BuildTogether</Link>
        </div>
      </div>
    )
  }

  const PRIORITY_COLORS = {
    urgent: 'bg-tag-orange-bg text-tag-orange-text border border-tag-orange-border',
    high: 'bg-tag-orange-bg text-tag-orange-text border border-tag-orange-border',
    medium: 'bg-surface-container-high text-muted',
    low: 'bg-surface-container-high text-muted/60',
  }

  const STATUS_COLORS = {
    todo: 'bg-muted/10 text-muted',
    in_progress: 'bg-primary/10 text-primary',
    in_review: 'bg-tertiary/10 text-tertiary',
    done: 'bg-success/10 text-success',
  }

  return (
    <div className="min-h-screen bg-surface">
      <nav className="border-b border-line bg-surface-container-lowest/80 backdrop-blur-md px-6 py-3">
        <div className="max-w-[640px] mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-on-surface flex items-center justify-center overflow-hidden">
              <img src="/logo.jpg" alt="" className="w-full h-full object-cover dark:invert" />
            </div>
            <span className="text-[15px] font-bold text-on-surface tracking-tight">BuildTogether</span>
          </Link>
          <Link to="/login" className="text-[13px] text-primary font-semibold hover:underline">Sign in</Link>
        </div>
      </nav>

      <main className="max-w-[640px] mx-auto px-6 py-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium}`}>
              {task.priority?.toUpperCase()}
            </span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${STATUS_COLORS[task.status] || STATUS_COLORS.todo}`}>
              {task.status?.replace('_', ' ')}
            </span>
          </div>
          <h1 className="font-heading text-[28px] font-light text-on-surface leading-tight">{task.title}</h1>
          {task.projects && (
            <p className="text-[13px] text-muted mt-2">
              in <span className="font-semibold text-on-surface">{task.projects.title}</span>
            </p>
          )}
        </div>

        {task.description && (
          <div className="bg-surface-container-lowest border border-line rounded-xl p-5 mb-6">
            <div className="text-[14px] text-on-surface-variant leading-relaxed prose"><MarkdownRenderer content={task.description} /></div>
          </div>
        )}

        <div className="flex items-center gap-4 text-[13px] text-muted mb-8">
          {task.assignee_id && task.profiles && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">person</span>
              {task.profiles.full_name || task.profiles.username}
            </span>
          )}
          {task.due_date && (
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">event</span>
              {task.due_date}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
          </span>
        </div>

        <div className="border-t border-line pt-6">
          <h3 className="text-[14px] font-semibold text-on-surface mb-4">Add a comment</h3>
          <ShareCommentForm taskId={task.id} />
        </div>
      </main>
    </div>
  )
}

function ShareCommentForm({ taskId }) {
  const [name, setName] = useState('')
  const [body, setBody] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!body.trim() || !name.trim()) return
    setSubmitting(true)

    // For anonymous comments, we use a system user or insert without user_id
    // RLS policy allows anyone to insert comments
    const { error } = await supabase.from('comments').insert({
      task_id: taskId,
      body: `**${name.trim()}**: ${body.trim()}`,
      user_id: null,
    })

    if (!error) {
      setSubmitted(true)
      setBody('')
      setName('')
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-center">
        <span className="material-symbols-outlined text-[24px] text-success mb-2 block">check_circle</span>
        <p className="text-[13px] text-on-surface font-medium">Comment submitted</p>
        <button onClick={() => setSubmitted(false)} className="text-[12px] text-primary mt-2 hover:underline">Add another</button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        value={name} onChange={e => setName(e.target.value)} required
        placeholder="Your name"
        className="w-full bg-surface-container-low border border-line rounded-lg px-3 py-2 text-[13px] text-on-surface placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
      />
      <textarea
        value={body} onChange={e => setBody(e.target.value)} required rows={3}
        placeholder="Write a comment..."
        className="w-full bg-surface-container-low border border-line rounded-lg px-3 py-2 text-[13px] text-on-surface placeholder:text-muted/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
      />
      <button type="submit" disabled={!body.trim() || !name.trim() || submitting}
        className="bg-primary text-on-primary px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all">
        {submitting ? 'Sending...' : 'Submit Comment'}
      </button>
    </form>
  )
}
