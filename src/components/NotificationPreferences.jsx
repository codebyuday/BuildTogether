import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuthHook'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function NotificationPreferences({ onClose }) {
  const { user } = useAuth()
  const [prefs, setPrefs] = useState({
    task_assigned: true, comment: true, mention: true,
    application: true, application_accepted: true,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('notification_prefs').eq('id', user.id).single()
      if (data?.notification_prefs) setPrefs(data.notification_prefs)
    }
    load()
  }, [user.id])

  async function handleSave() {
    setSaving(true)
    try {
      await supabase.from('profiles').update({ notification_prefs: prefs }).eq('id', user.id)
      toast.success('Preferences saved')
      onClose()
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const types = [
    { key: 'task_assigned', label: 'Task assignments', desc: 'When someone assigns you a task' },
    { key: 'comment', label: 'Comments', desc: 'When someone comments on your task' },
    { key: 'mention', label: 'Mentions', desc: 'When someone @mentions you' },
    { key: 'application', label: 'Applications', desc: 'When someone applies to your project' },
    { key: 'application_accepted', label: 'Application accepted', desc: 'When your application is accepted' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-surface-container-lowest border border-line rounded-xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h3 className="text-[15px] font-semibold text-on-surface">Notification Preferences</h3>
          <button onClick={onClose} className="text-muted hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        <div className="p-5 space-y-3">
          {types.map(t => (
            <div key={t.key} className="flex items-center justify-between py-2">
              <div>
                <span className="text-[13px] font-medium text-on-surface block">{t.label}</span>
                <span className="text-[11px] text-muted">{t.desc}</span>
              </div>
              <button onClick={() => setPrefs({ ...prefs, [t.key]: !prefs[t.key] })}
                className={`relative w-10 h-5 rounded-full transition-colors ${prefs[t.key] ? 'bg-primary' : 'bg-surface-container-high'}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${prefs[t.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-5 py-3">
          <button onClick={onClose} className="px-3 py-1.5 text-[13px] text-on-surface-variant hover:text-on-surface">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="bg-primary text-on-primary px-4 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-primary-container disabled:opacity-50 transition-all">
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}
