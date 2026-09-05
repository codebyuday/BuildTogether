import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'

export default function PublicProfile() {
  const { username } = useParams()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['public-profile', username],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').eq('username', username).single()
      return data
    },
    enabled: !!username,
  })

  const { data: projects = [] } = useQuery({
    queryKey: ['user-projects', profile?.id],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('*, team_members(id)').eq('owner_id', profile.id).eq('visibility', 'public')
      return data || []
    },
    enabled: !!profile?.id,
  })

  const { data: contributions = [] } = useQuery({
    queryKey: ['user-contributions', profile?.id],
    queryFn: async () => {
      const { data } = await supabase.from('team_members').select('*, projects(title, id, status)').eq('user_id', profile.id)
      return data || []
    },
    enabled: !!profile?.id,
  })

  if (isLoading) return <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" /></div>
  if (!profile) return <div className="text-center py-12 text-[14px] text-muted">User not found.</div>

  return (
    <div className="mx-auto max-w-[900px] space-y-6">
      <section className="bg-white border border-line rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
        <div className="h-32 bg-gradient-to-r from-primary/5 via-surface-container to-tertiary/5" />
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex items-end gap-4 mb-5">
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-line flex items-center justify-center text-primary text-[36px] font-bold shadow-lg">
              {profile.username?.[0]?.toUpperCase()}
            </div>
            <div className="pb-1">
              <h1 className="text-[22px] font-bold text-on-surface tracking-tight">{profile.full_name || profile.username}</h1>
              <span className="text-[13px] font-mono text-primary font-medium">@{profile.username}</span>
            </div>
          </div>
          {profile.bio && <p className="text-[14px] text-on-surface-variant mb-3">{profile.bio}</p>}
          {profile.github_username && (
            <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] font-mono text-muted hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[14px]">code</span>
              github.com/{profile.github_username}
            </a>
          )}
        </div>
      </section>

      {profile.skills && profile.skills.length > 0 && (
        <section className="bg-white border border-line rounded-2xl p-6" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
          <h2 className="text-[15px] font-bold text-on-surface mb-3">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map(s => (
              <span key={s} className="px-3 py-1 rounded-[99px] bg-tag-blue-bg text-tag-blue-text border border-tag-blue-border font-mono text-[11px] font-medium">{s}</span>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="bg-white border border-line rounded-2xl p-6" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
          <h2 className="text-[15px] font-bold text-on-surface mb-3">Projects ({projects.length})</h2>
          <div className="space-y-2">
            {projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-line hover:border-line-2 hover:-translate-y-0.5 transition-all">
                <div>
                  <span className="text-[14px] font-semibold text-on-surface">{p.title}</span>
                  <p className="text-[12px] text-muted line-clamp-1">{p.description}</p>
                </div>
                <span className="text-[11px] font-mono text-muted">{p.team_members?.length || 0} members</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {contributions.length > 0 && (
        <section className="bg-white border border-line rounded-2xl p-6" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
          <h2 className="text-[15px] font-bold text-on-surface mb-3">Contributions ({contributions.length})</h2>
          <div className="space-y-2">
            {contributions.map(c => (
              <Link key={c.id} to={`/projects/${c.projects?.id}`}
                className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-low border border-line hover:border-line-2 hover:-translate-y-0.5 transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-on-surface">{c.projects?.title}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[99px] bg-surface-container-high text-muted border border-line">{c.role}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
