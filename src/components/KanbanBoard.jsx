import { useState, useCallback, useRef } from 'react'

const STATUS_COLS = ['todo', 'in_progress', 'in_review', 'done']
const STATUS_LABELS = { todo: 'To Do', in_progress: 'In Progress', in_review: 'In Review', done: 'Done' }

function TaskCard({ task, isOwner, onDelete, onEdit, dragging }) {
  const taskLabels = task.labels?.map(tl => tl.labels).filter(Boolean) || []
  return (
    <div
      draggable
      onDragStart={e => { e.dataTransfer.setData('text/plain', task.id); e.dataTransfer.effectAllowed = 'move' }}
      onClick={() => onEdit(task)}
      className={`bg-white border border-line hover:border-primary/40 transition-all p-3 rounded-xl flex flex-col gap-2 group cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md ${
        dragging ? 'opacity-40 scale-95' : ''
      }`}
      style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}
    >
      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {taskLabels.map(l => (
            <span key={l.id} className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-medium"
              style={{ backgroundColor: l.color + '15', color: l.color, border: `1px solid ${l.color}30` }}>
              {l.name}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
          task.priority === 'urgent' || task.priority === 'high' ? 'bg-tag-orange-bg text-tag-orange-text border border-tag-orange-border' :
          task.priority === 'medium' ? 'bg-surface-container-high text-muted' :
          'bg-surface-container-high text-muted/60'
        }`}>{task.priority?.toUpperCase()}</span>
        {isOwner && (
          <button onClick={e => { e.stopPropagation(); onDelete(task.id) }}
            className="hidden rounded-md p-0.5 text-muted hover:text-error group-hover:block transition-colors">
            <span className="material-symbols-outlined text-[14px]">delete</span>
          </button>
        )}
      </div>
      <h4 className="text-[13.5px] text-on-surface group-hover:text-primary transition leading-snug font-medium">{task.title}</h4>
      {task.description && <p className="text-[11px] text-muted line-clamp-2">{task.description.replace(/<[^>]*>/g, '')}</p>}
      <div className="flex items-center justify-between pt-1.5 border-t border-line/60">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className={`text-[10px] font-mono flex items-center gap-0.5 ${new Date(task.due_date) < new Date() && task.status !== 'done' ? 'text-error' : 'text-muted'}`}>
              <span className="material-symbols-outlined text-[10px]">event</span>
              {task.due_date}
            </span>
          )}
        </div>
        {task.profiles && <span className="text-[11px] font-mono text-muted">@{task.profiles.username}</span>}
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, isMember, isOwner, onEdit, onDelete, onDrop }) {
  const [dragOverCol, setDragOverCol] = useState(null)
  const [draggingId, setDraggingId] = useState(null)

  const handleDragStart = useCallback((e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId)
    e.dataTransfer.effectAllowed = 'move'
    setDraggingId(taskId)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const handleDropOnCol = useCallback((e, targetStatus) => {
    e.preventDefault()
    const taskId = e.dataTransfer.getData('text/plain')
    setDragOverCol(null)
    setDraggingId(null)
    if (taskId) onDrop(taskId, targetStatus)
  }, [onDrop])

  const handleDragEnterCol = useCallback((col) => setDragOverCol(col), [])
  const handleDragLeaveCol = useCallback(() => setDragOverCol(null), [])

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start">
      {STATUS_COLS.map(col => {
        const colTasks = tasks.filter(t => t.status === col)
        return (
          <div key={col}
            className={`w-[320px] flex-shrink-0 flex flex-col rounded-2xl border transition-colors ${
              dragOverCol === col ? 'border-primary/40 bg-primary/5' : 'border-line bg-surface/50'
            }`}
            onDragOver={handleDragOver}
            onDragEnter={() => handleDragEnterCol(col)}
            onDragLeave={handleDragLeaveCol}
            onDrop={e => handleDropOnCol(e, col)}
          >
            <div className="p-3 border-b border-line/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-on-surface">{STATUS_LABELS[col]}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-surface-container-high text-muted border border-line">{colTasks.length}</span>
              </div>
            </div>
            <div className="p-2.5 flex flex-col gap-2.5 min-h-[80px]">
              {colTasks.map(task => (
                <div key={task.id} onDragStart={e => handleDragStart(e, task.id)}
                  draggable={isMember}>
                  <TaskCard task={task} isOwner={isOwner} onDelete={onDelete} onEdit={onEdit} dragging={draggingId === task.id} />
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
