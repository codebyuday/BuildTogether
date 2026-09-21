import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../hooks/useAuthHook'
import { supabase } from '../lib/supabase'
import { friendlyError } from '../lib/utils'
import toast from 'react-hot-toast'
import TechStackPanel from '../components/TechStackPanel'

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
  const [isPublic, setIsPublic] = useState(profile?.is_public !== false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

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

  useEffect(() => {
    if (profile) {
      setIsPublic(profile.is_public !== false)
      setAvatarUrl(profile.avatar_url || '')
    }
  }, [profile])

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

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Avatar must be under 2MB'); return }
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(publicUrl)
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      await fetchProfile(user.id)
      toast.success('Avatar updated!')
    } catch (err) {
      toast.error(friendlyError(err))
    } finally {
      setUploading(false)
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username, full_name: fullName, bio, github_username: github, skills, is_public: isPublic, avatar_url: avatarUrl })
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
      <section className="bg-surface-container-lowest border border-line rounded-2xl overflow-hidden" style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
        <div className="h-32 bg-gradient-to-r from-primary/5 via-surface-container to-tertiary/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(var(--color-primary)_1px,transparent_1px)] [background-size:16px_16px]" />
        </div>

        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mb-5">
            <div className="relative">
              <button onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-2xl bg-surface-container-lowest border-2 border-line flex items-center justify-center text-primary text-[32px] font-bold shadow-lg overflow-hidden hover:border-primary/40 transition-colors group">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  username?.[0]?.toUpperCase() || 'U'
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                  <span className="material-symbols-outlined text-white text-[20px]">photo_camera</span>
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface-container-lowest border-2 border-line flex items-center justify-center">
                <span className="w-3 h-3 rounded-full bg-success"></span>
              </span>
              {uploading && (
                <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                </div>
              )}
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
          <div className="bg-surface-container-lowest border border-line rounded-[20px] p-5 space-y-4" style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">layers</span>
                Skills
              </h3>
              <span className="text-[11px] font-mono text-muted">{skills.length}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map(s => (
                <span key={s} className="px-2.5 py-1 rounded-3xl bg-tag-blue-bg text-tag-blue-text border border-tag-blue-border font-mono text-[11px] font-medium flex items-center gap-1.5">
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
                className="flex-1 bg-surface-container-low border border-line rounded-3xl px-3 py-2 text-on-surface text-[13px] placeholder:text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                placeholder="Add a skill..." />
              <button type="button" onClick={addSkill}
                className="bg-surface-container-high px-3 py-2 text-[12px] text-muted hover:text-on-surface rounded-3xl border border-line font-semibold transition-colors">Add</button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-5">
          <div className="lg:hidden">
            <TechStackPanel skills={skills} projectCount={projectCount} />
          </div>

          <form onSubmit={handleSave} className="bg-surface-container-lowest border border-line rounded-[20px] p-5 space-y-4" style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
            <div className="flex items-center gap-2 border-b border-line pb-3">
              <span className="material-symbols-outlined text-[18px] text-primary">edit</span>
              <h3 className="text-[14px] font-bold text-on-surface">Edit Profile</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-on-surface-variant">Username</label>
                <input value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full bg-surface-container-low border border-line rounded-3xl px-3.5 py-2.5 text-on-surface text-[14px] focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12px] font-bold text-on-surface-variant">Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  className="w-full bg-surface-container-low border border-line rounded-3xl px-3.5 py-2.5 text-on-surface text-[14px] focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-on-surface-variant">Bio</label>
              <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                className="w-full bg-surface-container-low border border-line rounded-3xl px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                placeholder="Tell us about yourself..." />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-bold text-on-surface-variant">GitHub Username</label>
              <input value={github} onChange={e => setGithub(e.target.value)}
                className="w-full bg-surface-container-low border border-line rounded-3xl px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all"
                placeholder="octocat" />
            </div>

            <div className="flex items-center justify-between py-3 border-t border-line">
              <div>
                <span className="text-[12px] font-bold text-on-surface-variant block">Public Profile</span>
                <span className="text-[11px] text-muted">Allow others to view your profile</span>
              </div>
              <button type="button" onClick={() => setIsPublic(!isPublic)}
                className={`relative w-10 h-5 rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-surface-container-high'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>

            <button type="submit" disabled={loading}
              className="flex items-center gap-2 rounded-3xl bg-primary text-white px-5 py-2.5 text-[13px] font-semibold hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 glow-primary btn-shimmer">
              <span className="material-symbols-outlined text-[16px]">save</span>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>

          <div className="hidden lg:block">
            <TechStackPanel skills={skills} projectCount={projectCount} />
          </div>
        </div>
      </div>
    </div>
  )
}
