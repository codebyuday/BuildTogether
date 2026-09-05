import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function NotificationBell() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)

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
    return () => { supabase.removeChannel(channel) }
  }, [user.id, queryClient])

  const markRead = useMutation({
    mutationFn: async () => {
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative h-8 w-8 rounded-lg flex items-center justify-center text-muted hover:bg-surface-container-high hover:text-on-surface transition-all">
        <span className="material-symbols-outlined text-[18px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full ring-2 ring-surface"></span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-outline-variant/25 bg-surface-container-low shadow-2xl shadow-black/30">
            <div className="flex items-center justify-between border-b border-outline-variant/20 px-4 py-3">
              <span className="text-[13px] font-semibold text-on-surface">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={() => markRead.mutate()}
                  className="text-[11px] font-medium text-primary/70 hover:text-primary transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-[28px] text-outline/30 mb-2 block">notifications_none</span>
                  <p className="text-[12px] text-muted">No notifications yet.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`border-b border-outline-variant/10 px-4 py-3 transition-colors ${!n.read ? 'bg-primary/[0.03]' : 'hover:bg-surface-container-high/30'}`}>
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

