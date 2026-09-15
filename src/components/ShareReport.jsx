import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ShareReport({ projectId }) {
  const [show, setShow] = useState(false)

  const { data: project } = useQuery({
    queryKey: ['share-report-project', projectId],
    queryFn: async () => {
      const { data } = await supabase.from('projects').select('title, description, status, created_at').eq('id', projectId).single()
      return data
    },
    enabled: !!projectId,
  })

  const { data: stats } = useQuery({
    queryKey: ['share-report-stats', projectId],
    queryFn: async () => {
      const [tasksRes, membersRes] = await Promise.all([
        supabase.from('tasks').select('status, priority').eq('project_id', projectId),
        supabase.from('team_members').select('id').eq('project_id', projectId),
      ])
      const tasks = tasksRes.data || []
      return {
        total: tasks.length,
        done: tasks.filter(t => t.status === 'done').length,
        inProgress: tasks.filter(t => t.status === 'in_progress').length,
        members: membersRes.data?.length || 0,
      }
    },
    enabled: !!projectId,
  })

  if (!project || !stats) return null

  const report = `# ${project.title}
${project.description ? `> ${project.description}` : ''}

## Status: ${project.status}
## Created: ${new Date(project.created_at).toLocaleDateString()}

## Progress: ${stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}%
- Total tasks: ${stats.total}
- Completed: ${stats.done}
- In progress: ${stats.inProgress}
- Team members: ${stats.members}

---
Shared from BuildTogether`

  function handleShare() {
    navigator.clipboard.writeText(report).then(() => {
      toast.success('Report copied to clipboard!')
      setShow(false)
    })
  }

  function handleDownload() {
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title.replace(/\s+/g, '-').toLowerCase()}-report.md`
    a.click()
    URL.revokeObjectURL(url)
    setShow(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setShow(!show)}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-on-surface-variant hover:text-primary transition-colors px-3 py-1.5 rounded-lg border border-line hover:border-primary/30">
        <span className="material-symbols-outlined text-[14px]">ios_share</span>
        Share Report
      </button>
      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-surface-container-lowest border border-line rounded-xl shadow-lg p-2 min-w-[160px]">
            <button onClick={handleShare} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-on-surface hover:bg-surface-container-high rounded-lg transition-colors text-left">
              <span className="material-symbols-outlined text-[14px]">content_copy</span>
              Copy to clipboard
            </button>
            <button onClick={handleDownload} className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-on-surface hover:bg-surface-container-high rounded-lg transition-colors text-left">
              <span className="material-symbols-outlined text-[14px]">download</span>
              Download .md
            </button>
          </div>
        </>
      )}
    </div>
  )
}
