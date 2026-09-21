import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuthHook'

const CURSOR_COLORS = ['#E85A2C', '#3447D4', '#00AA45', '#D4A134', '#8B45A6', '#D4346E', '#34B8D4', '#6B8E23']

function getColorForUser(userId) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0
  return CURSOR_COLORS[Math.abs(hash) % CURSOR_COLORS.length]
}

export default function CollaborativeCursors({ projectId, children }) {
  const { user } = useAuth()
  const [cursors, setCursors] = useState({})
  const channelRef = useRef(null)

  useEffect(() => {
    if (!projectId || !user) return

    const channel = supabase.channel(`cursors-${projectId}`)

    channel.on('broadcast', { event: 'cursor_move' }, ({ payload }) => {
      if (payload.userId === user.id) return
      setCursors(prev => ({
        ...prev,
        [payload.userId]: {
          x: payload.x,
          y: payload.y,
          username: payload.username,
          color: getColorForUser(payload.userId),
          timestamp: Date.now(),
        },
      }))
    })

    channel.subscribe()
    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId, user])

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      setCursors(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(uid => {
          if (now - updated[uid].timestamp > 10000) delete updated[uid]
        })
        return updated
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  function handleMouseMove(e) {
    if (!channelRef.current || !user) return
    const rect = e.currentTarget.getBoundingClientRect()
    channelRef.current.send({
      type: 'broadcast',
      event: 'cursor_move',
      payload: {
        userId: user.id,
        username: user.email?.split('@')[0] || 'User',
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      },
    })
  }

  return (
    <div className="relative" onMouseMove={handleMouseMove}>
      {children}
      {Object.entries(cursors).map(([uid, cursor]) => (
        <div
          key={uid}
          className="absolute pointer-events-none z-50 transition-all duration-100"
          style={{ left: cursor.x, top: cursor.y }}
        >
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" className="drop-shadow-sm">
            <path d="M0 0L16 12L8 12L4 20L0 0Z" fill={cursor.color} />
          </svg>
          <span
            className="absolute left-4 top-4 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white whitespace-nowrap shadow-sm"
            style={{ backgroundColor: cursor.color }}
          >
            {cursor.username}
          </span>
        </div>
      ))}
    </div>
  )
}
