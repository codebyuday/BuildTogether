import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import StarButton from '../components/StarButton'

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
    <div className="mx-auto max-w-[1200px] space-y-space-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold text-on-surface tracking-tight">Discover Projects</h1>
          <p className="text-[12px] text-on-surface-variant">Find open-source projects to contribute to.</p>
        </div>
        <span className="text-[11px] font-mono text-on-surface-variant">{projects.length} projects found</span>
      </div>

      <div className="bg-surface-container-low border-b border-outline-variant/30 px-space-lg py-space-md space-y-space-md">
        <div className="flex flex-col md:flex-row gap-space-md items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
            <input
              type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects by name or description..."
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-12 py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 font-mono text-[11px] text-outline bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant/40">
              <span>Cmd+K</span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <span className="text-[12px] text-on-surface-variant">Sort:</span>
            <select className="bg-surface border border-outline-variant text-on-surface rounded-lg px-space-sm py-1.5 text-[14px] focus:border-primary outline-none">
              <option>Most Active</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-1.5 pt-2 border-t border-outline-variant/50">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-2.5 py-1 text-[11px] font-mono font-semibold rounded transition-all ${
                status === s
                  ? 'bg-primary-container text-on-primary-container'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border border-outline-variant/40'
              }`}>
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant/40 bg-surface-container-low/50 p-12 text-center">
          <p className="text-[14px] text-on-surface-variant">No projects found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-lg">
          {projects.map(p => (
            <Link key={p.id} to={`/projects/${p.id}`}
              className="bg-surface-container-low border border-outline-variant/40 hover:border-outline rounded-xl p-space-md flex flex-col justify-between transition-all duration-150 hover:bg-surface-container group">
              <div>
                <div className="flex items-start justify-between gap-2 mb-space-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-surface-variant border border-outline-variant/40 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">code_blocks</span>
                    </div>
                    <div>
                      <h2 className="text-[16px] font-semibold text-on-surface group-hover:text-primary transition-colors">{p.title}</h2>
                      <span className="text-[11px] font-mono text-on-surface-variant">
                        {p.profiles?.username ? `@${p.profiles.username}` : 'unknown'}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                    p.status === 'recruiting' ? 'bg-secondary/10 text-secondary border border-secondary/20' :
                    p.status === 'full' ? 'bg-tertiary/10 text-tertiary border border-tertiary/20' :
                    'bg-surface-container-high text-on-surface-variant border border-outline-variant/40'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      p.status === 'recruiting' ? 'bg-secondary' :
                      p.status === 'full' ? 'bg-tertiary' : 'bg-outline'
                    }`}></span>
                    {p.status}
                  </span>
                </div>

                <p className="text-[12px] text-on-surface-variant mb-space-md line-clamp-2">{p.description}</p>

                <div className="mb-space-md p-2 rounded bg-surface-container-lowest border border-outline-variant/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[14px]">group_add</span>
                    <span className="text-[11px] font-mono text-on-surface font-medium">{p.team_members?.length || 0} members</span>
                  </div>
                  <span className="text-[11px] font-mono text-tertiary">{p.status === 'recruiting' ? 'Open' : 'Closed'}</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(p.tech_stack || []).slice(0, 4).map(t => (
                    <span key={t} className="px-2 py-0.5 text-[11px] font-mono rounded bg-surface-container-high border border-outline-variant/40 text-on-surface-variant">{t}</span>
                  ))}
                </div>
              </div>

              <div className="pt-space-sm border-t border-outline-variant/60 mt-space-md flex items-center justify-between">
                <div className="flex items-center -space-x-1.5">
                  <div className="w-6 h-6 rounded-full bg-surface-bright border border-surface text-[10px] flex items-center justify-center font-bold text-on-surface">
                    {p.profiles?.username?.[0]?.toUpperCase() || '?'}
                  </div>
                </div>
                <div className="flex items-center gap-2" onClick={e => e.preventDefault()}>
                  <StarButton projectId={p.id} />
                  <span className="text-[14px] text-on-surface-variant group-hover:text-primary transition-colors flex items-center gap-1">
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
