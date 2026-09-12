import { useState } from 'react'

const PRESET_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

export default function LabelPicker({ labels = [], selectedLabels = [], onToggle }) {
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {labels.map(label => {
          const isSelected = selectedLabels.includes(label.id)
          return (
            <button key={label.id} type="button" onClick={() => onToggle(label.id)}
              className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-medium border transition-all flex items-center gap-1.5 ${
                isSelected ? 'border-transparent' : 'border-outline-variant/40 text-secondary hover:border-outline'
              }`}
              style={isSelected ? { backgroundColor: label.color + '20', borderColor: label.color + '60', color: label.color } : {}}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: label.color }} />
              {label.name}
            </button>
          )
        })}
      </div>
      {creating ? (
        <div className="flex items-center gap-2">
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Label name"
            className="flex-1 bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-[12px] text-ink placeholder:text-outline focus:border-primary outline-none" />
          <div className="flex gap-1">
            {PRESET_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setNewColor(c)}
                className={`w-4 h-4 rounded-full border-2 ${newColor === c ? 'border-ink' : 'border-transparent'}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <button type="button" onClick={() => { if (newName.trim()) { onToggle('create', { name: newName.trim(), color: newColor }); setNewName(''); setCreating(false) } }}
            className="text-[11px] text-primary hover:underline">Save</button>
          <button type="button" onClick={() => setCreating(false)} className="text-[11px] text-secondary hover:underline">Cancel</button>
        </div>
      ) : (
        <button type="button" onClick={() => setCreating(true)}
          className="text-[11px] text-primary hover:underline flex items-center gap-1">
          <span className="material-symbols-outlined text-[12px]">add</span>
          Create label
        </button>
      )}
    </div>
  )
}
