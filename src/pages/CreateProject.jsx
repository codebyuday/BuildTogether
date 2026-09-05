import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function CreateProject() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '', description: '', status: 'recruiting', visibility: 'public', repo_url: '',
  })
  const [techInput, setTechInput] = useState('')
  const [techStack, setTechStack] = useState([])

  function addTech(e) {
    e.preventDefault()
    if (techInput.trim() && !techStack.includes(techInput.trim())) {
      setTechStack([...techStack, techInput.trim()])
      setTechInput('')
    }
  }

  function removeTech(t) {
    setTechStack(techStack.filter(s => s !== t))
  }

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          owner_id: user.id, title: form.title, description: form.description,
          tech_stack: techStack, status: form.status, visibility: form.visibility,
          repo_url: form.repo_url || null,
        })
        .select()
        .single()
      if (error) throw error
      await supabase.from('team_members').insert({ project_id: data.id, user_id: user.id, role: 'owner' })
      return data
    },
    onSuccess: (data) => { toast.success('Project created!'); navigate(`/projects/${data.id}`) },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="mx-auto max-w-2xl space-y-space-lg">
      <div>
        <h1 className="text-[20px] font-semibold text-on-surface tracking-tight">Create Project</h1>
        <p className="text-[12px] text-on-surface-variant">Publish a new project to recruit contributors.</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); createMutation.mutate() }}
        className="space-y-4 bg-surface-container-low border border-outline-variant/30 rounded-xl p-space-lg">
        <div>
          <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Title *</label>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="My Awesome Project" />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Description *</label>
          <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            rows={4} placeholder="What does this project do? What help do you need?" />
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Tech Stack</label>
          <div className="mb-2 flex flex-wrap gap-1">
            {techStack.map(t => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-primary/10 border border-primary/30 px-2.5 py-1 text-[11px] font-mono text-primary">
                {t}
                <button type="button" onClick={() => removeTech(t)} className="ml-1 hover:text-on-primary">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={techInput} onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTech(e)}
              className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="e.g. React, Node.js, MongoDB" />
            <button type="button" onClick={addTech}
              className="bg-surface-container-high px-3 py-2 text-[12px] text-on-surface-variant hover:text-on-surface rounded-lg border border-outline-variant/40 transition-colors">Add</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none">
              <option value="recruiting">Recruiting</option>
              <option value="full">Full</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Visibility</label>
            <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] focus:border-primary focus:ring-1 focus:ring-primary outline-none">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">GitHub Repository URL (optional)</label>
          <input value={form.repo_url} onChange={e => setForm({ ...form, repo_url: e.target.value })}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            placeholder="https://github.com/owner/repo" />
        </div>

        <button type="submit" disabled={createMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary text-on-primary py-2.5 text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50">
          <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
          {createMutation.isPending ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  )
}
