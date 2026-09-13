import { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { logActivity } from '../lib/activity'

export default function CommentList({ taskId, projectId }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [body, setBody] = useState('')

  useEffect(() => {
    if (!taskId) return
    const channel = supabase.channel(`comments-${taskId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `task_id=eq.${taskId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [taskId, queryClient])

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const { data } = await supabase
        .from('comments')
        .select('*, profiles:user_id(username, full_name, avatar_url)')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true })
      return data || []
    },
    enabled: !!taskId,
  })

  const addComment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('comments').insert({ task_id: taskId, user_id: user.id, body: body.trim() })
      if (error) throw error
      await logActivity({ projectId, userId: user.id, action: 'comment.created', entityType: 'task', entityId: taskId, metadata: {} })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
      setBody('')
    },
  })

  return (
    <div className="space-y-3">
      <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">Comments ({comments.length})</span>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {comments.map(c => (
          <div key={c.id} className="bg-surface-container-low border border-line rounded-lg p-2.5">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] font-bold">
                {c.profiles?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-[12px] font-medium text-on-surface">{c.profiles?.full_name || c.profiles?.username}</span>
              <span className="text-[10px] font-mono text-on-surface-variant">
                {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-[13px] text-on-surface-variant pl-7">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input value={body} onChange={e => setBody(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && body.trim()) { e.preventDefault(); addComment.mutate() } }}
          className="flex-1 bg-surface-container-low border border-line rounded-lg px-3 py-1.5 text-[13px] text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
          placeholder="Write a comment..." />
        <button onClick={() => body.trim() && addComment.mutate()} disabled={!body.trim() || addComment.isPending}
          className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all">
          Send
        </button>
      </div>
    </div>
  )
}
