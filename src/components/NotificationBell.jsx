import { useEffect, useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

let globalChannel = null
let activeCount = 0

export default function NotificationBell({ expanded = false }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const isOwner = useRef(false)

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)
      return data || []
    },
  })

  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    activeCount++
    if (activeCount === 1) {
      const channel = supabase
        .channel('notifications-realtime')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        }, () => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] })
        })
        .subscribe()
      globalChannel = channel
      isOwner.current = true
    }
    return () => {
      activeCount--
      if (activeCount === 0 && globalChannel) {
        supabase.removeChannel(globalChannel)
        globalChannel = null
      }
    }
  }, [user.id, queryClient])

  const markRead = useMutation({
    mutationFn: async () => {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const clearAll = useMutation({
    mutationFn: async () => {
      await supabase.from('notifications').delete().eq('user_id', user.id)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  if (expanded) {
    return (
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[13px] font-semibold text-on-surface">Notifications</span>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button onClick={() => markRead.mutate()}
                className="text-[11px] font-medium text-primary/70 hover:text-primary transition-colors">
                Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={() => clearAll.mutate()}
                className="text-[11px] font-medium text-muted hover:text-error transition-colors">
                Clear all
              </button>
            )}
          </div>
        </div>
        {unreadCount > 0 && (
          <div className="flex items-center gap-1.5 mb-3 px-2 py-1.5 rounded-lg bg-primary/5 border border-primary/10">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] text-primary font-medium">{unreadCount} unread</span>
          </div>
        )}
        <div className="space-y-1 max-h-[calc(100vh-180px)] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <span className="material-symbols-outlined text-[28px] text-outline/30 mb-2 block">notifications_none</span>
              <p className="text-[12px] text-muted">No notifications yet.</p>
            </div>
          ) : (
            notifications.map(n => (
              <div key={n.id} className={`rounded-lg px-3 py-2.5 transition-colors ${
                !n.read ? 'bg-primary/[0.05] border border-primary/10' : 'hover:bg-surface-container-high'
              }`}>
                <p className="text-[12px] text-on-surface/80 leading-relaxed">{n.message}</p>
                <span className="mt-1 block text-[10px] font-mono text-muted">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative h-8 w-8 rounded-lg flex items-center justify-center text-muted hover:bg-surface-container-high hover:text-on-surface transition-all">
        <span className="material-symbols-outlined text-[18px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-lowest"></span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-line bg-surface-container-lowest shadow-xl">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-[13px] font-semibold text-on-surface">Notifications</span>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={() => markRead.mutate()}
                    className="text-[11px] font-medium text-primary/70 hover:text-primary transition-colors">
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button onClick={() => clearAll.mutate()}
                    className="text-[11px] font-medium text-muted hover:text-error transition-colors">
                    Clear all
                  </button>
                )}
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-[28px] text-outline/30 mb-2 block">notifications_none</span>
                  <p className="text-[12px] text-muted">No notifications yet.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`border-b border-line/50 px-4 py-3 transition-colors ${!n.read ? 'bg-primary/[0.03]' : 'hover:bg-surface-container-high/30'}`}>
                    <p className="text-[12px] text-on-surface/80 leading-relaxed">{n.message}</p>
                    <span className="mt-1 block text-[10px] font-mono text-muted">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
