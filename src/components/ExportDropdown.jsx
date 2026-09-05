import { useState } from 'react'

export default function ExportDropdown({ project, tasks = [], milestones = [] }) {
  const [open, setOpen] = useState(false)

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  function exportMarkdown() {
    let md = `# ${project.title}\n\n${project.description || ''}\n\n## Tech Stack\n${(project.tech_stack || []).map(t => `- ${t}`).join('\n')}\n\n`
    if (milestones.length > 0) {
      md += `## Roadmap\n\n`
      milestones.forEach(m => {
        md += `### ${m.title} (${m.status})\n`
        if (m.phase) md += `Phase: ${m.phase}\n`
        if (m.start_date) md += `Start: ${m.start_date}${m.end_date ? ` → End: ${m.end_date}` : ''}\n`
        md += '\n'
      })
    }
    md += `## Tasks\n\n`
    const statuses = ['todo', 'in_progress', 'in_review', 'done']
    const labels = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }
    statuses.forEach(s => {
      md += `### ${labels[s]}\n`
      tasks.filter(t => t.status === s).forEach(t => {
        md += `- [ ] ${t.title} (${t.priority})${t.assignee_id ? ' — assigned' : ''}${t.due_date ? ` — due ${t.due_date}` : ''}\n`
      })
      md += '\n'
    })
    downloadFile(md, `${project.title}.md`, 'text/markdown')
    setOpen(false)
  }

  function exportCSV() {
    let csv = 'Title,Status,Priority,Assignee,Due Date,Milestone\n'
    tasks.forEach(t => {
      csv += `"${t.title}","${t.status}","${t.priority}","${t.profiles?.username || ''}","${t.due_date || ''}","${t.milestone_id || ''}"\n`
    })
    downloadFile(csv, `${project.title}-tasks.csv`, 'text/csv')
    setOpen(false)
  }

  function exportJSON() {
    downloadFile(JSON.stringify({ project, tasks, milestones }, null, 2), `${project.title}.json`, 'application/json')
    setOpen(false)
  }

  function exportPDF() {
    window.print()
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container text-[12px] text-on-surface-variant hover:bg-surface-container-high transition-colors">
        <span className="material-symbols-outlined text-[14px]">download</span>
        Export
        <span className="material-symbols-outlined text-[12px]">expand_more</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 bg-surface-container-low border border-outline-variant/40 rounded-lg shadow-2xl overflow-hidden">
            <button onClick={exportMarkdown} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[14px]">description</span> Markdown
            </button>
            <button onClick={exportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[14px]">table_chart</span> CSV
            </button>
            <button onClick={exportJSON} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[14px]">data_object</span> JSON
            </button>
            <button onClick={exportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span> PDF (Print)
            </button>
          </div>
        </>
      )}
    </div>
  )
}
