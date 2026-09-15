const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']

const SKILL_COLORS = {
  javascript: { bg: 'bg-tag-orange-bg', text: 'text-tag-orange-text', border: 'border-tag-orange-border' },
  typescript: { bg: 'bg-tag-blue-bg', text: 'text-tag-blue-text', border: 'border-tag-blue-border' },
  react: { bg: 'bg-tag-blue-bg', text: 'text-tag-blue-text', border: 'border-tag-blue-border' },
  python: { bg: 'bg-tag-orange-bg', text: 'text-tag-orange-text', border: 'border-tag-orange-border' },
  rust: { bg: 'bg-tag-orange-bg', text: 'text-tag-orange-text', border: 'border-tag-orange-border' },
  default: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', border: 'border-outline-variant/40' },
}

function getSkillColor(skill) {
  const lower = skill.toLowerCase()
  for (const [key, val] of Object.entries(SKILL_COLORS)) {
    if (lower.includes(key)) return val
  }
  return SKILL_COLORS.default
}

function estimateProficiency(skill, projectCount) {
  const lower = skill.toLowerCase()
  const knownComplex = ['rust', 'c++', 'go', 'kubernetes', 'terraform', 'graphql']
  const isComplex = knownComplex.some(k => lower.includes(k))
  if (projectCount > 3 && isComplex) return 'Advanced'
  if (projectCount > 2) return 'Advanced'
  if (projectCount > 1) return 'Intermediate'
  if (projectCount > 0) return 'Beginner'
  return 'Beginner'
}

export default function TechStackPanel({ skills, projectCount }) {
  if (!skills || skills.length === 0) return null

  return (
    <div className="bg-surface-container-lowest border border-line rounded-[20px] p-5" style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-bold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-primary">code</span>
          Tech Stack
        </h3>
        <span className="text-[11px] font-mono text-muted">{skills.length} skills</span>
      </div>
      <div className="space-y-2">
        {skills.map(skill => {
          const colors = getSkillColor(skill)
          const proficiency = estimateProficiency(skill, projectCount)
          const barWidth = proficiency === 'Expert' ? 100 : proficiency === 'Advanced' ? 75 : proficiency === 'Intermediate' ? 50 : 25
          return (
            <div key={skill} className="p-3 rounded-lg bg-surface-container-low border border-line">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-[12px] font-mono font-medium px-2 py-0.5 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>{skill}</span>
                <span className="text-[10px] font-bold text-muted uppercase tracking-wider">{proficiency}</span>
              </div>
              <div className="h-1 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${barWidth}%` }} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
