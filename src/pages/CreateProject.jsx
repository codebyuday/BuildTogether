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
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Create Project</h1>
        <p className="text-[13px] text-on-surface-variant/60 mt-0.5">Publish a new project to recruit contributors.</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); createMutation.mutate() }}
        className="space-y-5 bg-surface-container-low border border-outline-variant/20 rounded-xl p-6">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Title *</label>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-outline/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            placeholder="My Awesome Project" />
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Description *</label>
          <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-outline/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            rows={4} placeholder="What does this project do? What help do you need?" />
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Tech Stack</label>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {techStack.map(t => (
              <span key={t} className="flex items-center gap-1 rounded-md bg-primary/10 border border-primary/15 px-2.5 py-1 text-[11px] font-mono text-primary">
                {t}
                <button type="button" onClick={() => removeTech(t)} className="ml-0.5 hover:text-on-primary transition-colors">&times;</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={techInput} onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTech(e)}
              className="flex-1 bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-outline/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. React, Node.js, MongoDB" />
            <button type="button" onClick={addTech}
              className="bg-surface-container-high/60 px-3 py-2 text-[12px] font-medium text-on-surface-variant hover:text-on-surface rounded-lg border border-outline-variant/20 transition-colors">Add</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all">
              <option value="recruiting">Recruiting</option>
              <option value="full">Full</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Visibility</label>
            <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}
              className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">GitHub Repository URL (optional)</label>
          <input value={form.repo_url} onChange={e => setForm({ ...form, repo_url: e.target.value })}
            className="w-full bg-surface-container-lowest/80 border border-outline-variant/30 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-outline/50 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-all"
            placeholder="https://github.com/owner/repo" />
        </div>

        <div className="pt-2">
          <button type="submit" disabled={createMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary text-on-primary py-2.5 text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            {createMutation.isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                Create Project
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
