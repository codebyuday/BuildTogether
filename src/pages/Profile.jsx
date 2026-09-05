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
    <div className="mx-auto max-w-[1200px] space-y-space-lg">
      <section className="bg-surface-container-low border border-outline-variant/30 rounded-xl overflow-hidden relative">
        <div className="h-36 w-full bg-gradient-to-r from-surface-container-lowest via-surface-container to-surface-container-high relative overflow-hidden border-b border-outline-variant/30">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#c0c1ff_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-3 right-4 flex items-center gap-space-xs">
            <span className="font-mono text-[11px] text-secondary flex items-center gap-1 bg-surface-container-lowest/80 px-space-sm py-0.5 rounded border border-outline-variant/40">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
              Online
            </span>
          </div>
        </div>

        <div className="px-space-xl pb-space-lg pt-0 relative">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md -mt-14 mb-space-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-space-md">
              <div className="relative">
                <div className="w-28 h-28 rounded-xl bg-surface-container-high border-2 border-surface-container-low flex items-center justify-center text-primary text-[40px] font-bold shadow-xl">
                  {username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-container-low flex items-center justify-center p-0.5">
                  <span className="w-full h-full rounded-full bg-secondary"></span>
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-space-xs">
                  <h2 className="text-[24px] text-on-surface font-bold tracking-tight">{fullName || username || 'User'}</h2>
                  {username && <span className="font-mono text-[13px] text-primary">@{username}</span>}
                </div>
                <p className="text-on-surface-variant text-[14px]">{bio || 'Developer at BuildTogether'}</p>
                <div className="flex flex-wrap items-center gap-y-1 gap-x-space-md text-on-surface-variant text-[12px] pt-1">
                  {github && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-outline">code</span>
                      github.com/{github}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-secondary/10 border border-secondary/30 text-secondary font-mono text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                    Open for Collabs
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm pt-space-md border-t border-outline-variant/30">
            <div className="p-space-sm rounded bg-surface-container border border-outline-variant/60">
              <span className="font-mono text-[10px] text-on-surface-variant block uppercase">Skills</span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="text-[20px] font-bold text-on-surface">{skills.length}</span>
                <span className="text-[11px] font-mono text-secondary">verified</span>
              </div>
            </div>
            <div className="p-space-sm rounded bg-surface-container border border-outline-variant/60">
              <span className="font-mono text-[10px] text-on-surface-variant block uppercase">Projects</span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="text-[20px] font-bold text-on-surface">—</span>
                <span className="text-[11px] font-mono text-on-surface-variant">contributor</span>
              </div>
            </div>
            <div className="p-space-sm rounded bg-surface-container border border-outline-variant/60">
              <span className="font-mono text-[10px] text-on-surface-variant block uppercase">Reputation</span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="text-[20px] font-bold text-on-surface">—</span>
                <span className="text-[11px] font-mono text-on-surface-variant">peer score</span>
              </div>
            </div>
            <div className="p-space-sm rounded bg-surface-container border border-outline-variant/60">
              <span className="font-mono text-[10px] text-on-surface-variant block uppercase">Code Reviews</span>
              <div className="flex items-baseline gap-space-xs mt-1">
                <span className="text-[20px] font-bold text-on-surface">—</span>
                <span className="text-[11px] font-mono text-on-surface-variant">median turnaround</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        <div className="lg:col-span-5 space-y-space-lg">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg space-y-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">layers</span>
                <h3 className="text-[16px] font-semibold text-on-surface">Core Skills</h3>
              </div>
              <span className="text-[11px] font-mono text-on-surface-variant">{skills.length} skills</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary font-mono text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {s}
                  <button type="button" onClick={() => removeSkill(s)} className="ml-1 hover:text-on-primary">&times;</button>
                </span>
              ))}
              {skills.length === 0 && (
                <span className="text-[12px] text-on-surface-variant italic">No skills added yet</span>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill(e)}
                className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Add a skill..." />
              <button type="button" onClick={addSkill}
                className="bg-surface-container-high px-3 py-2 text-[12px] text-on-surface-variant hover:text-on-surface rounded-lg border border-outline-variant/40 transition-colors">Add</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-space-lg">
          <form onSubmit={handleSave} className="bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg space-y-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="material-symbols-outlined text-secondary text-[18px]">edit</span>
                <h3 className="text-[16px] font-semibold text-on-surface">Edit Profile</h3>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Tell us about yourself..." />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">GitHub Username</label>
              <input value={github} onChange={e => setGithub(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="octocat" />
            </div>

            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary text-on-primary px-space-md py-2 text-[14px] font-semibold hover:bg-primary-container transition-colors active:scale-[0.98] disabled:opacity-50">
              <span className="material-symbols-outlined text-[16px]">save</span>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
