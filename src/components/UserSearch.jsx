import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function UserSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const inputRef = useRef(null)

  const { data: users = [] } = useQuery({
    queryKey: ['user-search', query],
    queryFn: async () => {
      if (!query.trim()) return []
      const { data } = await supabase.from('profiles').select('id, username, full_name, skills').or(`username.ilike.%${query}%,full_name.ilike.%${query}%`).limit(8)
      return data || []
    },
    enabled: query.trim().length >= 2,
  })

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      inputRef.current?.focus()
      setOpen(true)
    }
    if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">search</span>
        <input ref={inputRef} value={query} onChange={e => { setQuery(e.target.value); setOpen(true) }} onFocus={() => setOpen(true)}
          className="w-56 h-8 pl-8 pr-12 text-[12px] font-mono bg-surface-container-lowest border border-outline-variant/40 rounded-lg text-on-surface placeholder:text-outline focus:border-primary focus:outline-none transition-colors"
          placeholder="Search users..." />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 font-mono text-[10px] text-outline bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/40 pointer-events-none">
          <span>⌘K</span>
        </div>
      </div>
      {open && users.length > 0 && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-surface-container-low border border-outline-variant/40 rounded-lg shadow-2xl z-50 overflow-hidden">
          {users.map(u => (
            <Link key={u.id} to={`/users/${u.username}`} onClick={() => { setOpen(false); setQuery('') }}
              className="flex items-center gap-3 px-3 py-2 hover:bg-surface-container-high transition-colors">
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold shrink-0">
                {u.username?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className="text-[13px] text-on-surface block truncate">{u.full_name || u.username}</span>
                <span className="text-[11px] font-mono text-on-surface-variant">@{u.username}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
