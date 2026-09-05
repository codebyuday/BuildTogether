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
        className="relative h-8 w-8 rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition">
        <span className="material-symbols-outlined text-[18px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-error rounded-full"></span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-outline-variant/40 bg-surface-container-low shadow-2xl">
            <div className="flex items-center justify-between border-b border-outline-variant/30 px-4 py-3">
              <span className="text-[14px] font-semibold text-on-surface">Notifications</span>
              {unreadCount > 0 && (
                <button onClick={() => markRead.mutate()}
                  className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-[12px] text-on-surface-variant">No notifications yet.</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`border-b border-outline-variant/20 px-4 py-3 ${!n.read ? 'bg-surface-container' : ''}`}>
                    <p className="text-[12px] text-on-surface">{n.message}</p>
                    <span className="mt-1 block text-[10px] font-mono text-on-surface-variant">
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
