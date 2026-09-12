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
          <h1 className="text-[24px] font-bold text-ink tracking-tight">Discover Projects</h1>
          <p className="text-[14px] text-muted mt-0.5">Find open-source projects to contribute to.</p>
        </div>
        <span className="text-[12px] font-mono text-muted">{projects.length} found</span>
      </div>

      <div className="bg-white border border-line rounded-2xl px-5 py-4 space-y-3" style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted text-[18px]">search</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full bg-surface-container-low border border-line rounded-3xl pl-10 pr-4 py-2.5 text-ink text-[13.5px] placeholder:text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 pt-3 border-t border-line/50">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1 text-[11px] font-bold rounded-3xl transition-all ${
                status === s
                  ? 'bg-primary text-white'
                  : 'text-muted hover:text-ink hover:bg-surface-container-high'
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
        <div className="rounded-2xl border border-dashed border-line bg-surface-container-low/30 p-12 text-center">
          <span className="material-symbols-outlined text-[40px] text-muted/25 mb-3 block">search_off</span>
          <p className="text-[14px] text-muted">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`}
              className="bg-white border border-line rounded-[20px] p-5 flex flex-col justify-between card-hover group"
              style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">code_blocks</span>
                    </div>
                    <div>
                      <h2 className="text-[15px] font-bold text-ink group-hover:text-primary transition-colors leading-tight">{p.title}</h2>
                      <span className="text-[11px] font-mono text-muted">
                        {p.profiles?.username ? `@${p.profiles.username}` : 'unknown'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-3xl flex items-center gap-1 shrink-0 ${
                    p.status === 'recruiting' ? 'bg-success/10 text-success border border-success/20' :
                    p.status === 'full' ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' :
                    'bg-surface-container-high text-muted border border-line'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      p.status === 'recruiting' ? 'bg-success' :
                      p.status === 'full' ? 'bg-tertiary' : 'bg-muted/40'
                    }`}></span>
                    {p.status}
                  </span>
                </div>

                <p className="text-[13px] text-secondary mb-3 line-clamp-2 leading-relaxed">{p.description}</p>

                <div className="mb-3 p-2.5 rounded-xl bg-surface-container-low border border-line flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-muted text-[14px]">group_add</span>
                    <span className="text-[11px] font-mono text-muted">{p.team_members?.length || 0} members</span>
                  </div>
                  <span className="text-[11px] font-mono text-muted">{p.status === 'recruiting' ? 'Open' : 'Closed'}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(p.tech_stack || []).slice(0, 4).map(t => (
                    <span key={t} className="px-2.5 py-0.5 text-[10px] font-mono font-medium rounded-3xl bg-tag-blue-bg text-tag-blue-text border border-tag-blue-border">{t}</span>
                  ))}
                </div>
              </div>

              <div className="pt-3.5 mt-3.5 border-t border-line flex items-center justify-between">
                <div className="w-7 h-7 rounded-full bg-surface-container-high border border-line text-[10px] flex items-center justify-center font-bold text-muted">
                  {p.profiles?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex items-center gap-2" onClick={e => e.preventDefault()}>
                  <StarButton projectId={p.id} />
                  <span className="text-[12px] text-muted group-hover:text-primary transition-colors flex items-center gap-1 font-medium">
                    View <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
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
