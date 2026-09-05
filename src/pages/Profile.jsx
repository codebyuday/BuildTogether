import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
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
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-5">
      <section className="bg-surface-container-low border border-outline-variant/20 rounded-xl overflow-hidden">
        <div className="h-28 bg-gradient-to-r from-surface-container-lowest via-surface-container to-surface-container-high relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#b8baff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-surface-container-high border-2 border-surface-container-low flex items-center justify-center text-primary text-[32px] font-bold shadow-lg">
                {username?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-container-low flex items-center justify-center p-0.5">
                <span className="w-full h-full rounded-full bg-success"></span>
              </span>
            </div>
            <div className="space-y-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[20px] text-on-surface font-bold tracking-tight">{fullName || username || 'User'}</h2>
                {username && <span className="font-mono text-[12px] text-primary/70">@{username}</span>}
              </div>
              <p className="text-on-surface-variant/60 text-[13px]">{bio || 'Developer at BuildTogether'}</p>
              <div className="flex flex-wrap items-center gap-3 text-on-surface-variant/50 text-[12px] pt-1">
                {github && (
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">code</span>
                    github.com/{github}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-outline-variant/15">
            <div className="p-3 rounded-lg bg-surface-container-lowest/50 border border-outline-variant/15">
              <span className="text-[11px] text-on-surface-variant/50 block uppercase tracking-wider">Skills</span>
              <span className="text-[20px] font-bold text-on-surface mt-0.5 block">{skills.length}</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-lowest/50 border border-outline-variant/15">
              <span className="text-[11px] text-on-surface-variant/50 block uppercase tracking-wider">Projects</span>
              <span className="text-[20px] font-bold text-on-surface mt-0.5 block">&mdash;</span>
            </div>
            <div className="p-3 rounded-lg bg-surface-container-lowest/50 border border-outline-variant/15">
              <span className="text-[11px] text-on-surface-variant/50 block uppercase tracking-wider">Reputation</span>
              <span className="text-[20px] font-bold text-on-surface mt-0.5 block">&mdash;</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-4">
          <div className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">layers</span>
                Skills
              </h3>
              <span className="text-[11px] font-mono text-on-surface-variant/40">{skills.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-md bg-primary/10 border border-primary/15 text-primary font-mono text-[11px] flex items-center gap-1.5">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="ml-0.5 hover:text-on-primary transition-colors">&times;</button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-[12px] text-on-surface-variant/40">No skills added yet</span>
              )}
            </div>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill(e)}
                className="flex-1 bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3 py-2 text-on-surface text-[13px] placeholder:text-outline/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="Add a skill..." />
              <button type="button" onClick={addSkill}
                className="bg-surface-container-high/60 px-3 py-2 text-[12px] text-on-surface-variant hover:text-on-surface rounded-lg border border-outline-variant/20 transition-colors">Add</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <form onSubmit={handleSave} className="bg-surface-container-low border border-outline-variant/20 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-outline-variant/15 pb-3">
              <span className="material-symbols-outlined text-[16px] text-secondary">edit</span>
              <h3 className="text-[14px] font-semibold text-on-surface">Edit Profile</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-outline/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="Tell us about yourself..." />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">GitHub Username</label>
              <input value={github} onChange={e => setGithub(e.target.value)}
                className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-outline/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
                placeholder="octocat" />
            </div>

            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary text-on-primary px-4 py-2.5 text-[13px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50">
              <span className="material-symbols-outlined text-[16px]">save</span>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
