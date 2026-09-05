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
  if (!profile) return <div className="text-center py-12 text-[14px] text-on-surface-variant">User not found.</div>

  return (
    <div className="mx-auto max-w-[900px] space-y-space-lg">
      <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-surface-container-lowest via-surface-container to-surface-container-high" />
        <div className="px-space-xl pb-space-lg -mt-12 relative">
          <div className="flex items-end gap-space-md mb-space-md">
            <div className="w-24 h-24 rounded-xl bg-surface-container-high border-2 border-surface-container-low flex items-center justify-center text-primary text-[36px] font-bold shadow-xl">
              {profile.username?.[0]?.toUpperCase()}
            </div>
            <div className="pb-1">
              <h1 className="text-[20px] font-bold text-on-surface">{profile.full_name || profile.username}</h1>
              <span className="text-[13px] font-mono text-primary">@{profile.username}</span>
            </div>
          </div>
          {profile.bio && <p className="text-[14px] text-on-surface-variant mb-3">{profile.bio}</p>}
          {profile.github_username && (
            <a href={`https://github.com/${profile.github_username}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[12px] font-mono text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[14px]">code</span>
              github.com/{profile.github_username}
            </a>
          )}
        </div>
      </section>

      {profile.skills && profile.skills.length > 0 && (
        <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg">
          <h2 className="text-[14px] font-semibold text-on-surface mb-3">Skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.map(s => (
              <span key={s} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[11px]">{s}</span>
            ))}
          </div>
        </section>
      )}

      {projects.length > 0 && (
        <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg">
          <h2 className="text-[14px] font-semibold text-on-surface mb-3">Projects ({projects.length})</h2>
          <div className="space-y-2">
            {projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-outline-variant/40 hover:border-outline transition">
                <div>
                  <span className="text-[14px] font-medium text-on-surface">{p.title}</span>
                  <p className="text-[12px] text-on-surface-variant line-clamp-1">{p.description}</p>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant">{p.team_members?.length || 0} members</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {contributions.length > 0 && (
        <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg">
          <h2 className="text-[14px] font-semibold text-on-surface mb-3">Contributions ({contributions.length})</h2>
          <div className="space-y-2">
            {contributions.map(c => (
              <Link key={c.id} to={`/projects/${c.projects?.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-outline-variant/40 hover:border-outline transition">
                <div>
                  <span className="text-[14px] font-medium text-on-surface">{c.projects?.title}</span>
                  <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant border border-outline-variant/40">{c.role}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
