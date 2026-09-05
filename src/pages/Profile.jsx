import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { Save } from 'lucide-react'

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
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="text-sm text-slate-400">Manage your developer profile.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Full Name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
            placeholder="Tell us about yourself..." />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">GitHub Username</label>
          <input value={github} onChange={e => setGithub(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
            placeholder="octocat" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Skills</label>
          <div className="mb-2 flex flex-wrap gap-1">
            {skills.map(s => (
              <span key={s} className="flex items-center gap-1 rounded bg-primary-600/20 px-2 py-0.5 text-xs text-primary-400">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="hover:text-white">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSkill(e)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              placeholder="Add a skill (e.g. React, Node.js)" />
            <button type="button" onClick={addSkill}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700">Add</button>
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50">
          <Save size={14} /> {loading ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
