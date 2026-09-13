import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  { title: 'Create a project', desc: 'Start by creating your first project with a description and tech stack.', target: null, action: '/projects/new' },
  { title: 'Add a task', desc: 'Open the Board tab and create tasks for your team to work on.', target: 'board-tab' },
  { title: 'Invite a team member', desc: 'Go to the Team tab and share your project with collaborators.', target: 'team-tab' },
  { title: 'Connect GitHub', desc: 'Link your repository to see commits and contributors in real-time.', target: 'github-tab' },
]

export default function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const completed = localStorage.getItem('bt-onboarding-done')
    if (!completed) {
      const timer = setTimeout(() => setVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const dismiss = () => {
    setVisible(false)
    localStorage.setItem('bt-onboarding-done', '1')
  }

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      dismiss()
    }
  }

  const handleAction = () => {
    if (STEPS[step].action) {
      navigate(STEPS[step].action)
    }
    dismiss()
  }

  if (!visible) return null

  const current = STEPS[step]

  return (
    <>
      <div className="tour-backdrop" onClick={dismiss} />
      <div className="tour-tooltip" style={{ bottom: '80px', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono text-muted">{step + 1} / {STEPS.length}</span>
        </div>
        <h4 className="text-[15px] font-semibold text-on-surface mb-1">{current.title}</h4>
        <p className="text-[13px] text-on-surface-variant mb-4 leading-relaxed">{current.desc}</p>
        <div className="flex items-center justify-between">
          <button onClick={dismiss} className="text-[12px] text-muted hover:text-on-surface transition-colors">
            Skip tour
          </button>
          <div className="flex items-center gap-2">
            {current.action && (
              <button onClick={handleAction}
                className="bg-primary text-on-primary px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-primary-container transition-all">
                Go there now
              </button>
            )}
            <button onClick={next}
              className="bg-surface-container-high text-on-surface px-3 py-1.5 rounded-lg text-[12px] font-semibold hover:bg-surface-container-highest transition-all">
              {step < STEPS.length - 1 ? 'Next' : 'Done'}
            </button>
          </div>
        </div>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === step ? 'bg-primary' : 'bg-line'}`} />
          ))}
        </div>
      </div>
    </>
  )
}
