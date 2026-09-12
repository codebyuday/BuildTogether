import { useState } from 'react'
import { jsPDF } from 'jspdf'

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
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    let y = 20

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(project.title, 20, y)
    y += 10

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Status: ${project.status} | Visibility: ${project.visibility}`, 20, y)
    y += 8

    if (project.description) {
      doc.setFontSize(11)
      doc.setTextColor(0)
      const descLines = doc.splitTextToSize(project.description, pageWidth - 40)
      doc.text(descLines, 20, y)
      y += descLines.length * 5 + 5
    }

    if (project.tech_stack?.length) {
      doc.setFontSize(10)
      doc.setTextColor(80)
      doc.text(`Tech Stack: ${project.tech_stack.join(', ')}`, 20, y)
      y += 8
    }

    y += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.setTextColor(0)
    doc.text('Tasks', 20, y)
    y += 8

    const statuses = ['todo', 'in_progress', 'in_review', 'done']
    const statusLabels = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }

    statuses.forEach(s => {
      const colTasks = tasks.filter(t => t.status === s)
      if (colTasks.length === 0) return
      if (y > 270) { doc.addPage(); y = 20 }

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text(`${statusLabels[s]} (${colTasks.length})`, 20, y)
      y += 6

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      colTasks.forEach(t => {
        if (y > 270) { doc.addPage(); y = 20 }
        const line = `• ${t.title} [${t.priority}]${t.due_date ? ` due ${t.due_date}` : ''}`
        doc.text(line, 25, y)
        y += 5
      })
      y += 3
    })

    if (milestones.length > 0) {
      if (y > 260) { doc.addPage(); y = 20 }
      y += 5
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.setTextColor(0)
      doc.text('Roadmap', 20, y)
      y += 8

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(9)
      milestones.forEach(m => {
        if (y > 270) { doc.addPage(); y = 20 }
        doc.text(`• ${m.title} (${m.status})${m.start_date ? ` — ${m.start_date}` : ''}${m.end_date ? ` → ${m.end_date}` : ''}`, 25, y)
        y += 5
      })
    }

    doc.save(`${project.title}.pdf`)
    setOpen(false)
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-outline-variant/40 bg-surface-container text-[12px] text-secondary hover:bg-surface-container-high transition-colors">
        <span className="material-symbols-outlined text-[14px]">download</span>
        Export
        <span className="material-symbols-outlined text-[12px]">expand_more</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-48 bg-surface-container-low border border-outline-variant/40 rounded-lg shadow-2xl overflow-hidden">
            <button onClick={exportMarkdown} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-ink hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[14px]">description</span> Markdown
            </button>
            <button onClick={exportCSV} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-ink hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[14px]">table_chart</span> CSV
            </button>
            <button onClick={exportJSON} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-ink hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[14px]">data_object</span> JSON
            </button>
            <button onClick={exportPDF} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-ink hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span> PDF
            </button>
          </div>
        </>
      )}
    </div>
  )
}
