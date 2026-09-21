import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuthHook'
import { supabase } from '../lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { logActivity } from '../lib/activity'

const EMOJI_OPTIONS = ['👍', '❤️', '🎉', '🔥', '👀', '💯']

export default function CommentList({ taskId, projectId, assigneeId, members = [] }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [body, setBody] = useState('')
  const [replyTo, setReplyTo] = useState(null)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (!taskId) return
    const channel = supabase.channel(`comments-${taskId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `task_id=eq.${taskId}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
        queryClient.invalidateQueries({ queryKey: ['comment-reactions'] })
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

  const { data: reactions = [] } = useQuery({
    queryKey: ['comment-reactions', taskId],
    queryFn: async () => {
      const { data } = await supabase
        .from('comment_reactions')
        .select('*')
        .in('comment_id', comments.map(c => c.id))
      return data || []
    },
    enabled: comments.length > 0,
  })

  const addComment = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('comments').insert({
        task_id: taskId, user_id: user.id, body: body.trim(), parent_id: replyTo,
      })
      if (error) throw error
      if (assigneeId && assigneeId !== user.id) {
        await supabase.from('notifications').insert({ user_id: assigneeId, type: 'comment', message: `New comment on a task you're assigned to`, project_id: projectId, entity_id: taskId })
      }
      const mentioned = [...body.matchAll(/@(\w+)/g)].map(m => m[1])
      for (const uname of mentioned) {
        const member = members.find(m => m.profiles?.username === uname)
        if (member && member.user_id !== user.id) {
          await supabase.from('notifications').insert({ user_id: member.user_id, type: 'mention', message: `${user.email || 'Someone'} mentioned you in a comment`, project_id: projectId, entity_id: taskId })
        }
      }
      await logActivity({ projectId, userId: user.id, action: 'comment.created', entityType: 'task', entityId: taskId, metadata: {} })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', taskId] })
      setBody('')
      setReplyTo(null)
    },
  })

  const deleteComment = useMutation({
    mutationFn: async (commentId) => {
      const { error } = await supabase.from('comments').delete().eq('id', commentId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comments', taskId] }),
  })

  const toggleReaction = useMutation({
    mutationFn: async ({ commentId, emoji }) => {
      const existing = reactions.find(r => r.comment_id === commentId && r.emoji === emoji && r.user_id === user.id)
      if (existing) {
        await supabase.from('comment_reactions').delete().eq('id', existing.id)
      } else {
        await supabase.from('comment_reactions').insert({ comment_id: commentId, user_id: user.id, emoji })
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['comment-reactions', taskId] }),
  })

  const handleInput = (e) => {
    const val = e.target.value
    setBody(val)
    const cursorPos = e.target.selectionStart
    const beforeCursor = val.slice(0, cursorPos)
    const mentionMatch = beforeCursor.match(/@(\w*)$/)
    if (mentionMatch) {
      setMentionQuery(mentionMatch[1].toLowerCase())
      setShowMentions(true)
    } else {
      setShowMentions(false)
    }
  }

  const insertMention = (username) => {
    const cursorPos = inputRef.current?.selectionStart || body.length
    const beforeCursor = body.slice(0, cursorPos).replace(/@\w*$/, `@${username} `)
    const afterCursor = body.slice(cursorPos)
    setBody(beforeCursor + afterCursor)
    setShowMentions(false)
    inputRef.current?.focus()
  }

  const filteredMembers = members.filter(m =>
    m.profiles?.username?.toLowerCase().includes(mentionQuery) ||
    m.profiles?.full_name?.toLowerCase().includes(mentionQuery)
  )

  const topLevel = comments.filter(c => !c.parent_id)
  const replies = comments.filter(c => c.parent_id)
  const getReplies = (parentId) => replies.filter(r => r.parent_id === parentId)
  const hasReacted = (commentId, emoji) => reactions.some(r => r.comment_id === commentId && r.emoji === emoji && r.user_id === user.id)

  function renderComment(c, depth = 0) {
    const commentReactions = reactions.filter(r => r.comment_id === c.id)
    const grouped = {}
    commentReactions.forEach(r => { grouped[r.emoji] = (grouped[r.emoji] || 0) + 1 })
    return (
      <div key={c.id} className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-line/50' : ''}`}>
        <div className="bg-surface-container-low border border-line rounded-lg p-2.5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] font-bold">
              {c.profiles?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="text-[12px] font-medium text-on-surface">{c.profiles?.full_name || c.profiles?.username}</span>
            <span className="text-[10px] font-mono text-on-surface-variant">
              {formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}
            </span>
            {c.user_id === user.id && (
              <button onClick={() => deleteComment.mutate(c.id)} className="ml-auto text-muted hover:text-danger transition-colors">
                <span className="material-symbols-outlined text-[14px]">delete</span>
              </button>
            )}
          </div>
          <p className="text-[13px] text-on-surface-variant pl-7 whitespace-pre-wrap">{c.body}</p>
          <div className="flex items-center gap-1 mt-1.5 pl-7 flex-wrap">
            {Object.entries(grouped).map(([emoji, count]) => (
              <button key={emoji} onClick={() => toggleReaction.mutate({ commentId: c.id, emoji })}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] border transition-colors ${
                  hasReacted(c.id, emoji) ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface-container-high border-line text-muted hover:border-primary/30'
                }`}>
                <span>{emoji}</span>
                <span className="font-mono">{count}</span>
              </button>
            ))}
            <div className="relative group">
              <button className="px-1 py-0.5 rounded-full text-[10px] text-muted hover:bg-surface-container-high border border-transparent hover:border-line transition-colors">
                <span className="material-symbols-outlined text-[12px]">add_reaction</span>
              </button>
              <div className="hidden group-hover:flex absolute bottom-full left-0 mb-1 bg-surface-container-lowest border border-line rounded-lg shadow-lg p-1 gap-0.5 z-10">
                {EMOJI_OPTIONS.map(emoji => (
                  <button key={emoji} onClick={() => toggleReaction.mutate({ commentId: c.id, emoji })}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-container-high text-[14px] transition-colors">
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { setReplyTo(c.id); setBody(`@${c.profiles?.username} `); inputRef.current?.focus() }}
              className="text-[10px] text-muted hover:text-primary transition-colors ml-1">
              Reply
            </button>
          </div>
        </div>
        {getReplies(c.id).map(r => renderComment(r, depth + 1))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <span className="text-[11px] font-mono text-on-surface-variant uppercase tracking-wider">Comments ({comments.length})</span>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {topLevel.map(c => renderComment(c))}
      </div>

      {replyTo && (
        <div className="flex items-center gap-2 text-[11px] text-primary bg-primary/5 rounded-lg px-3 py-1.5">
          <span className="material-symbols-outlined text-[12px]">reply</span>
          Replying to {comments.find(c => c.id === replyTo)?.profiles?.username}
          <button onClick={() => setReplyTo(null)} className="ml-auto text-muted hover:text-on-surface">
            <span className="material-symbols-outlined text-[12px]">close</span>
          </button>
        </div>
      )}

      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input ref={inputRef} value={body} onChange={handleInput}
            onKeyDown={e => {
              if (showMentions && filteredMembers.length > 0) return
              if (e.key === 'Enter' && !e.shiftKey && body.trim()) { e.preventDefault(); addComment.mutate() }
            }}
            className="w-full bg-surface-container-low border border-line rounded-lg px-3 py-1.5 text-[13px] text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder={replyTo ? 'Write a reply...' : 'Write a comment... (@ to mention)'} />
          {showMentions && filteredMembers.length > 0 && (
            <div className="absolute bottom-full left-0 mb-1 w-56 bg-surface-container-lowest border border-line rounded-lg shadow-lg max-h-40 overflow-y-auto z-10">
              {filteredMembers.slice(0, 6).map(m => (
                <button key={m.user_id} onClick={() => insertMention(m.profiles?.username)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-on-surface hover:bg-surface-container-high transition-colors text-left">
                  <span className="font-mono text-primary">@{m.profiles?.username}</span>
                  <span className="text-muted truncate">{m.profiles?.full_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button onClick={() => body.trim() && addComment.mutate()} disabled={!body.trim() || addComment.isPending}
          className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all">
          {replyTo ? 'Reply' : 'Send'}
        </button>
      </div>
    </div>
  )
}
