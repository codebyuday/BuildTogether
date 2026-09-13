import { useState, useEffect } from 'react'

const shortcuts = [
  { keys: ['⌘', 'K'], label: 'Search users' },
  { keys: ['⌘', 'Enter'], label: 'Submit form' },
  { keys: ['Esc'], label: 'Close modal / panel' },
  { keys: ['?'], label: 'Show shortcuts' },
  { keys: ['S'], label: 'Sort tasks' },
  { keys: ['Shift', 'I'], label: 'Assign to self' },
  { keys: ['⌘', 'B'], label: 'Toggle sidebar' },
]

export default function ShortcutsModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handleKey(e) {
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault()
        setOpen(prev => !prev)
      }
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
      <div className="w-full max-w-sm bg-surface-container-lowest border border-line rounded-xl shadow-2xl p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[16px] font-semibold text-on-surface">Keyboard Shortcuts</h3>
          <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map(({ keys, label }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[13px] text-on-surface">{label}</span>
              <div className="flex items-center gap-1">
                {keys.map(k => (
                  <kbd key={k} className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-semibold bg-surface-container-high border border-line/60 rounded text-on-surface-variant">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-on-surface-variant text-center">Press <kbd className="px-1 py-0.5 text-[10px] font-mono bg-surface-container-high border border-line/60 rounded">?</kbd> to toggle</p>
      </div>
    </div>
  )
}
