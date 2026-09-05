import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Search, Users } from 'lucide-react'

const STATUS_OPTIONS = ['all', 'recruiting', 'full', 'archived']

export default function Explore() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['explore-projects', search, status],
    queryFn: async () => {
      let q = supabase
        .from('projects')
        .select('*, profiles:owner_id(username, full_name), team_members(id)')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })

      if (status !== 'all') q = q.eq('status', status)
      if (search) q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%`)

      const { data } = await q
      return data || []
    },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Explore Projects</h1>
        <p className="text-sm text-slate-400">Find open-source projects to contribute to.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-slate-700 bg-slate-900 py-2 pl-9 pr-3 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(s => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${
                status === s ? 'bg-primary-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/50 p-12 text-center">
          <p className="text-sm text-slate-400">No projects found.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map(p => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="group rounded-xl border border-slate-800 bg-slate-900 p-5 transition-colors hover:border-slate-700"
            >
              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-sm font-semibold text-white group-hover:text-primary-400">{p.title}</h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                  p.status === 'recruiting' ? 'bg-green-500/10 text-green-400' :
                  p.status === 'full' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-slate-700/50 text-slate-400'
                }`}>
                  {p.status}
                </span>
              </div>
              <p className="mb-3 line-clamp-2 text-xs text-slate-400">{p.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {(p.tech_stack || []).slice(0, 3).map(t => (
                    <span key={t} className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">{t}</span>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Users size={10} />
                  {p.team_members?.length || 0}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
