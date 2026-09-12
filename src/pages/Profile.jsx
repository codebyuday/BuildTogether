import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { friendlyError } from '../lib/utils'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, profile, fetchProfile } = useAuth()
  const [username, setUsername] = useState(profile?.username || '')
  const [fullName, setFullName] = useState(profile?.full_name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [github, setGithub] = useState(profile?.github_username || '')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState(profile?.skills || [])
  const [loading, setLoading] = useState(false)
  const [projectCount, setProjectCount] = useState(0)

  useEffect(() => {
    async function count() {
      const { count } = await supabase
        .from('team_members')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      setProjectCount(count || 0)
    }
    if (user) count()
  }, [user])

  const completionFields = [username, fullName, bio, github, skills.length > 0]
  const completion = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100)

  function addSkill(e) {
    e.preventDefault()
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  function removeSkill(skill) {
    setSkills(skills.filter(s => s !== skill))
  }

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username, full_name: fullName, bio, github_username: github, skills })
        .eq('id', user.id)
      if (error) throw error
      await fetchProfile(user.id)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <section className="bg-white border border-line rounded-2xl overflow-hidden" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
        <div className="h-32 bg-gradient-to-r from-primary/5 via-surface-container to-tertiary/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl bg-white border-2 border-line flex items-center justify-center text-primary text-[32px] font-bold shadow-lg">
                {username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border-2 border-line flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-success"></span>
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[22px] text-on-surface font-bold tracking-tight">{fullName || username || 'User'}</h2>
                {username && <span className="font-mono text-[12px] text-primary font-medium">@{username}</span>}
              </div>
              <p className="text-muted text-[14px]">{bio || 'Developer at BuildTogether'}</p>
              <div className="flex flex-wrap items-center gap-3 text-muted text-[12px] pt-1">
                {github && (
                  <a href={`https://github.com/${github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[14px]">code</span>
                    github.com/{github}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Profile Completion</span>
                <span className="text-[12px] font-bold text-primary">{completion}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-line">
            <div className="p-3 rounded-xl bg-surface-container-low border border-line">
              <span className="text-[11px] text-muted block uppercase tracking-wider font-bold">Skills</span>
              <span className="text-[22px] font-bold text-on-surface mt-0.5 block">{skills.length}</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-line">
              <span className="text-[11px] text-muted block uppercase tracking-wider font-bold">Projects</span>
              <span className="text-[22px] font-bold text-on-surface mt-0.5 block">{projectCount}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4">
          <div className="bg-white border border-line rounded-2xl p-5 space-y-4" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">layers</span>
                Skills
              </h3>
              <span className="text-[11px] font-mono text-muted">{skills.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-[99px] bg-tag-blue-bg text-tag-blue-text border border-tag-blue-border font-mono text-[11px] font-medium flex items-center gap-1.5">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="ml-0.5 hover:opacity-70 transition-opacity">&times;</button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-[12px] text-muted">No skills added yet</span>
              )}
            </div>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill(e)}
                className="flex-1 bg-surface-container-low border border-line rounded-[12px] px-3 py-2 text-on-surface text-[13px] placeholder:text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                placeholder="Add a skill..." />
              <button type="button" onClick={addSkill}
                className="bg-surface-container-high px-3 py-2 text-[12px] text-muted hover:text-on-surface rounded-[12px] border border-line font-semibold transition-colors">Add</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="bg-white border border-line rounded-2xl p-5 space-y-4" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
              <h3 className="text-[14px] font-bold text-on-surface">Edit Profile</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-on-surface-variant">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-surface-container-low border border-line rounded-[12px] px-3.5 py-2.5 text-on-surface text-[14px] focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-on-surface-variant">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-surface-container-low border border-line rounded-[12px] px-3.5 py-2.5 text-on-surface text-[14px] focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-on-surface-variant">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                className="w-full bg-surface-container-low border border-line rounded-[12px] px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                placeholder="Tell us about yourself..." />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-on-surface-variant">GitHub Username</label>
              <input value={github} onChange={e => setGithub(e.target.value)}
                className="w-full bg-surface-container-low border border-line rounded-[12px] px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                placeholder="octocat" />
            </div>

            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-[99px] bg-primary text-white px-5 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 glow-primary btn-shimmer">
              <span className="material-symbols-outlined text-[16px]">save</span>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
