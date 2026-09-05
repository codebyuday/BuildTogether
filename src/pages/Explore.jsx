import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StarButton from '../components/StarButton'
import { CardSkeleton } from '../components/Skeleton'

const STATUS_OPTIONS = ['all', 'recruiting', 'full', 'archived']
const STATUS_LABELS = { all: 'All', recruiting: 'Recruiting', full: 'Full', archived: 'Archived' }

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
    <div className="mx-auto max-w-[1200px] space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Discover Projects</h1>
          <p className="text-[13px] text-on-surface-variant/60 mt-0.5">Find open-source projects to contribute to.</p>
        </div>
        <span className="text-[11px] font-mono text-on-surface-variant/40">{projects.length} found</span>
      </div>

      <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-3 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/40 text-[18px]">search</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg pl-10 pr-4 py-2 text-on-surface text-[13px] placeholder:text-outline/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-2 border-t border-outline-variant/15">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${
                status === s
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container-high/50 border border-transparent'
              }`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-outline-variant/30 bg-surface-container-low/30 p-12 text-center">
          <span className="material-symbols-outlined text-[36px] text-outline/30 mb-3 block">search_off</span>
          <p className="text-[14px] text-on-surface-variant/60">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`}
              className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-4 flex flex-col justify-between card-hover group">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">code_blocks</span>
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-on-surface group-hover:text-primary transition-colors leading-tight">{p.title}</h2>
                      <span className="text-[11px] font-mono text-on-surface-variant/50">
                        {p.profiles?.username ? `@${p.profiles.username}` : 'unknown'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded flex items-center gap-1 shrink-0 ${
                    p.status === 'recruiting' ? 'bg-success/10 text-success border border-success/15' :
                    p.status === 'full' ? 'bg-tertiary/10 text-tertiary border border-tertiary/15' :
                    'bg-surface-container-high text-on-surface-variant/50 border border-outline-variant/20'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      p.status === 'recruiting' ? 'bg-success' :
                      p.status === 'full' ? 'bg-tertiary' : 'bg-outline/40'
                    }`}></span>
                    {p.status}
                  </span>
                </div>

                <p className="text-[12px] text-on-surface-variant/60 mb-3 line-clamp-2 leading-relaxed">{p.description}</p>

                <div className="mb-3 p-2 rounded-lg bg-surface-container-lowest/50 border border-outline-variant/15 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary/70 text-[14px]">group_add</span>
                    <span className="text-[11px] font-mono text-on-surface-variant/60">{p.team_members?.length || 0} members</span>
                  </div>
                  <span className="text-[11px] font-mono text-tertiary/70">{p.status === 'recruiting' ? 'Open' : 'Closed'}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(p.tech_stack || []).slice(0, 4).map(t => (
                    <span key={t} className="px-2 py-0.5 text-[10px] font-mono rounded-md bg-surface-container-high/60 border border-outline-variant/15 text-on-surface-variant/50">{t}</span>
                  ))}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-outline-variant/15 flex items-center justify-between">
                <div className="w-6 h-6 rounded-full bg-surface-container-high border border-outline-variant/20 text-[10px] flex items-center justify-center font-bold text-on-surface-variant/60">
                  {p.profiles?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex items-center gap-2" onClick={e => e.preventDefault()}>
                  <StarButton projectId={p.id} />
                  <span className="text-[12px] text-on-surface-variant/40 group-hover:text-primary transition-colors flex items-center gap-1">
                    View <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
