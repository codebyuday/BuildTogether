import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, X } from 'lucide-react'

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
          owner_id: user.id,
          title: form.title,
          description: form.description,
          tech_stack: techStack,
          status: form.status,
          visibility: form.visibility,
          repo_url: form.repo_url || null,
        })
        .select()
        .single()
      if (error) throw error

      // Add owner as team member
      await supabase.from('team_members').insert({
        project_id: data.id,
        user_id: user.id,
        role: 'owner',
      })

      return data
    },
    onSuccess: (data) => {
      toast.success('Project created!')
      navigate(`/projects/${data.id}`)
    },
    onError: (err) => toast.error(err.message),
  })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={14} /> Back
      </button>

      <div>
        <h1 className="text-2xl font-bold text-white">Create Project</h1>
        <p className="text-sm text-slate-400">Publish a new project to recruit contributors.</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); createMutation.mutate() }}
        className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Title *</label>
          <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
            placeholder="My Awesome Project" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Description *</label>
          <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
            rows={4} placeholder="What does this project do? What help do you need?" />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">Tech Stack</label>
          <div className="mb-2 flex flex-wrap gap-1">
            {techStack.map(t => (
              <span key={t} className="flex items-center gap-1 rounded bg-primary-600/20 px-2 py-0.5 text-xs text-primary-400">
                {t}
                <button type="button" onClick={() => removeTech(t)} className="hover:text-white"><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={techInput} onChange={e => setTechInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTech(e)}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              placeholder="e.g. React, Node.js, MongoDB" />
            <button type="button" onClick={addTech}
              className="rounded-lg bg-slate-800 px-3 py-2 text-xs text-slate-300 hover:bg-slate-700">Add</button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none">
              <option value="recruiting">Recruiting</option>
              <option value="full">Full</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Visibility</label>
            <select value={form.visibility} onChange={e => setForm({ ...form, visibility: e.target.value })}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white focus:border-primary-500 focus:outline-none">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-400">GitHub Repository URL (optional)</label>
          <input value={form.repo_url} onChange={e => setForm({ ...form, repo_url: e.target.value })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
            placeholder="https://github.com/owner/repo" />
        </div>

        <button type="submit" disabled={createMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50">
          <Plus size={16} /> {createMutation.isPending ? 'Creating...' : 'Create Project'}
        </button>
      </form>
    </div>
  )
}
