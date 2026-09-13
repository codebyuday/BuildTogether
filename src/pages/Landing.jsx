import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import NumberTicker from '../components/NumberTicker'

const features = [
  { icon: 'sync', title: 'Real-time Collaboration', desc: 'Live updates, comments, and activity feeds. No page refresh needed.' },
  { icon: 'group_add', title: 'Team Recruitment', desc: 'Publish projects, review applications, and build high-performing teams.' },
  { icon: 'view_kanban', title: 'Kanban Board', desc: 'Drag-and-drop tasks with labels, milestones, and priority tracking.' },
  { icon: 'terminal', title: 'GitHub Integration', desc: 'Connect repos for live commits, contributors, and language breakdown.' },
  { icon: 'analytics', title: 'Project Analytics', desc: 'Track completion rates, velocity, and team performance with built-in stats.' },
  { icon: 'download', title: 'Export Anywhere', desc: 'Markdown, CSV, JSON, or PDF. Share progress with one click.' },
]

const steps = [
  { num: '01', title: 'Create', desc: 'Describe your vision, set requirements, and define the tech stack.' },
  { num: '02', title: 'Recruit', desc: 'Developers apply. You review profiles, skills, and proof of work.' },
  { num: '03', title: 'Ship', desc: 'Assign tasks on a Kanban board, track progress, launch together.' },
]

const faqCategories = ['All', 'Getting Started', 'Features', 'Technical']

const faqItems = [
  { q: 'Is BuildTogether free?', a: 'Yes. Free for all developers. Unlimited projects, unlimited collaborators, real-time collaboration. No catch.', cat: 'Getting Started' },
  { q: 'How does recruitment work?', a: 'Publish your project with requirements. Contributors apply with their profiles. You review and accept the best fit.', cat: 'Getting Started' },
  { q: 'How do I contribute?', a: 'Sign up, complete your profile, browse open projects in Explore, and apply. Wait for the owner to review.', cat: 'Getting Started' },
  { q: 'Can I connect GitHub?', a: 'Yes. Any public or private repo. Get live commit activity, contributor stats, and language breakdown.', cat: 'Features' },
  { q: 'What export formats?', a: 'Markdown, CSV, JSON, or PDF. Perfect for stakeholders or local backups.', cat: 'Features' },
  { q: 'How does real-time work?', a: 'Supabase WebSocket connections synchronize all changes instantly. Tasks, comments, activity feeds — zero refresh.', cat: 'Technical' },
  { q: 'Tech stack?', a: 'React 19, Tailwind CSS v4, Supabase (PostgreSQL + Auth + Realtime). Deployed on Vercel.', cat: 'Technical' },
  { q: 'Is my data secure?', a: 'Row Level Security on every table. You only access what you own or are a member of. Supabase Auth for identity.', cat: 'Technical' },
]

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null)
  const [faqCategory, setFaqCategory] = useState('All')
  const revealRefs = useRef([])
  const observerRef = useRef(null)
  const [stats, setStats] = useState({ projects: 0, members: 0 })

  useEffect(() => {
    async function fetchStats() {
      const [projectsRes, membersRes] = await Promise.all([
        supabase.from('projects').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ])
      setStats({
        projects: projectsRes.count || 0,
        members: membersRes.count || 0,
      })
    }
    fetchStats()
  }, [])

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') })
    }, { threshold: 0.15 })
    revealRefs.current.forEach(el => { if (el) observerRef.current.observe(el) })
    return () => { observerRef.current.disconnect(); observerRef.current = null }
  }, [])

  const addRevealRef = useCallback((el) => {
    if (!el) return
    if (!revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
      observerRef.current?.observe(el)
    }
  }, [])

  return (
    <div className="min-h-screen bg-surface overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 z-50 flex h-[60px] w-full items-center justify-between px-6 lg:px-10 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-on-surface flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="" className="w-full h-full object-cover dark:invert" />
          </div>
          <span className="text-[18px] font-bold text-on-surface tracking-tight">BuildTogether</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-[14px] text-muted font-semibold hover:text-on-surface transition-colors px-4 py-2 rounded-lg hover:bg-surface-container-low">Login</Link>
          <Link to="/register" className="rounded-lg bg-primary text-white px-5 py-2 text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-14 text-center">
        <div ref={addRevealRef} className="reveal relative z-10 mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-container-low px-4 py-1.5 text-[12px] font-mono text-muted mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            Open Source &middot; Free Forever
          </div>
        </div>

        <h1 ref={addRevealRef} className="reveal reveal-delay-1 relative z-10 max-w-[820px] font-heading text-[48px] sm:text-[64px] lg:text-[80px] font-light leading-[1.02] tracking-[-0.025em] text-on-surface">
          Where developers<br />
          <span className="text-primary">ship together</span>
        </h1>

        <p ref={addRevealRef} className="reveal reveal-delay-2 relative z-10 mt-6 max-w-[520px] text-[17px] leading-[1.7] text-on-surface-variant">
          Publish projects. Recruit contributors. Collaborate through a real-time Kanban board with live notifications and activity feeds.
        </p>

        <div ref={addRevealRef} className="reveal reveal-delay-3 relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register"
            className="rounded-lg bg-primary text-white px-8 py-3.5 text-[15px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
            Start Building — It's Free
          </Link>
          <Link to="/explore"
            className="rounded-lg border border-line bg-white px-8 py-3.5 text-[15px] font-semibold text-on-surface hover:bg-surface-container-low transition-all">
            Explore Projects
          </Link>
        </div>

        <div ref={addRevealRef} className="reveal reveal-delay-4 relative z-10 mt-12 flex items-center gap-4">
          <div className="flex -space-x-2">
            {[47, 12, 32, 68].map(id => (
              <img key={id} src={`https://i.pravatar.cc/64?img=${id}`} alt="" className="w-8 h-8 rounded-full object-cover bg-surface-container-high border-2 border-surface" />
            ))}
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-on-surface border-2 border-surface">+{stats.members > 5 ? stats.members - 5 : 0}</span>
          </div>
          <span className="text-[13px] text-on-surface-variant"><span className="font-semibold text-on-surface">{stats.members || 0}</span> developers already shipping</span>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-line bg-surface-container-low/40">
        <div className="mx-auto max-w-[1080px] grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-line">
          {[
            { value: stats.members || 0, label: 'Developers' },
            { value: stats.projects || 0, label: 'Projects' },
            { value: 'Real-time', label: 'Sync' },
            { value: '100%', label: 'Open Source' },
          ].map(({ value, label }) => (
            <div key={label} className="py-8 px-6 text-center">
              <div className="font-heading text-[28px] font-light text-on-surface">
                {typeof value === 'number' ? <NumberTicker value={value} /> : value}
              </div>
              <div className="text-[11px] text-muted mt-1 font-semibold uppercase tracking-widest">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-28 px-6 sm:px-8">
        <div className="mx-auto max-w-[1080px]">
          <div ref={addRevealRef} className="reveal mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/8 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">How it works</span>
            <h2 className="font-heading text-[34px] sm:text-[40px] font-light text-on-surface tracking-[-0.01em]">Three steps to ship</h2>
          </div>
          <div className="grid gap-0 md:grid-cols-3 md:gap-8">
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} ref={addRevealRef} className={`reveal reveal-delay-${i + 1} relative ${i < 2 ? 'pb-10 md:pb-0 border-b md:border-b-0 border-line' : ''} ${i < 2 ? 'md:border-r md:border-line md:pr-8' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-heading text-[48px] font-light leading-none text-primary/20">{num}</span>
                  <h3 className="font-heading text-[22px] font-normal text-on-surface">{title}</h3>
                </div>
                <p className="text-[14px] leading-[1.7] text-on-surface-variant pl-[60px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6 sm:px-8 bg-surface-container-low/40 border-t border-line">
        <div className="mx-auto max-w-[1080px]">
          <div ref={addRevealRef} className="reveal mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/8 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">Features</span>
            <h2 className="font-heading text-[34px] sm:text-[40px] font-light text-on-surface tracking-[-0.01em]">Everything you need</h2>
            <p className="mt-3 text-[15px] text-on-surface-variant max-w-lg">Built for developers, by developers. No bloat, no compromise.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon, title, desc }, i) => (
              <div key={title} ref={addRevealRef} className={`reveal reveal-delay-${(i % 3) + 1} group rounded-xl border border-line bg-surface-container-lowest p-6 card-hover`}>
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-primary/8 text-primary">
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                </div>
                <h3 className="font-heading mb-1.5 text-[18px] font-normal text-on-surface">{title}</h3>
                <p className="text-[13px] leading-relaxed text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-28 px-6 sm:px-8 border-t border-line">
        <div className="mx-auto max-w-[1080px]">
          <div ref={addRevealRef} className="reveal mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-tertiary/10 text-tertiary text-[11px] font-bold uppercase tracking-widest mb-4">Trusted by developers</span>
            <h2 className="font-heading text-[34px] sm:text-[40px] font-light text-on-surface tracking-[-0.01em]">What people are building</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { quote: 'BuildTogether helped us recruit 4 contributors in a week. The real-time Kanban board is a game changer.', name: 'Priya Sharma', role: 'Lead Developer', img: 47 },
              { quote: 'Finally a platform where I can show proof of work and get recruited. The GitHub integration is seamless.', name: 'Arjun Mehta', role: 'Full-Stack Developer', img: 12 },
              { quote: 'We shipped our MVP in 3 weeks with a team we found here. The activity feeds kept everyone aligned.', name: 'Sarah Chen', role: 'CTO, NovaTech', img: 32 },
            ].map(({ quote, name, role, img }, i) => (
              <div key={name} ref={addRevealRef} className={`reveal reveal-delay-${i + 1} group bg-surface-container-lowest border border-line rounded-xl p-6 flex flex-col transition-all duration-300 hover:-translate-y-0.5`}>
                <span className="text-primary/20 font-heading text-[64px] leading-[0.5] h-[20px] block italic">&ldquo;</span>
                <p className="font-heading text-[16px] leading-[1.6] text-on-surface flex-1 mt-3 font-normal">{quote}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-line mt-4">
                  <img src={`https://i.pravatar.cc/72?img=${img}`} alt={name} className="w-9 h-9 rounded-full object-cover bg-surface-container-high" />
                  <div>
                    <div className="text-[13px] font-semibold text-on-surface">{name}</div>
                    <div className="text-[11px] text-muted">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-28 px-6 sm:px-8 border-t border-line" style={{ background: 'var(--color-inverse-surface)' }}>
        <div className="mx-auto max-w-[960px]">
          <div className="text-center mb-14">
            <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest mb-4"
              style={{ background: 'color-mix(in srgb, var(--color-on-inverse-surface) 8%, transparent)', color: 'color-mix(in srgb, var(--color-on-inverse-surface) 50%, transparent)' }}>FAQ</span>
            <h2 className="font-heading text-[34px] sm:text-[40px] font-light tracking-[-0.01em]"
              style={{ color: 'var(--color-on-inverse-surface)' }}>Frequently asked</h2>
          </div>

          <div className="grid md:grid-cols-[180px_1fr] gap-10">
            {/* Category sidebar */}
            <div className="flex md:flex-col gap-1.5">
              {faqCategories.map(cat => (
                <button key={cat} onClick={() => { setFaqCategory(cat); setOpenFaq(null) }}
                  className="text-left px-3 py-2 rounded-lg text-[13px] font-medium transition-all"
                  style={{
                    background: faqCategory === cat ? 'var(--color-on-inverse-surface)' : 'transparent',
                    color: faqCategory === cat ? 'var(--color-inverse-surface)' : 'color-mix(in srgb, var(--color-on-inverse-surface) 40%, transparent)',
                  }}
                  onMouseEnter={e => { if (faqCategory !== cat) e.currentTarget.style.color = 'color-mix(in srgb, var(--color-on-inverse-surface) 70%, transparent)' }}
                  onMouseLeave={e => { if (faqCategory !== cat) e.currentTarget.style.color = 'color-mix(in srgb, var(--color-on-inverse-surface) 40%, transparent)' }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Questions */}
            <div className="flex flex-col gap-2">
              {faqItems
                .filter(item => faqCategory === 'All' || item.cat === faqCategory)
                .map(({ q, a, cat }) => (
                <div key={q}
                  className="rounded-xl transition-all duration-200 overflow-hidden"
                  style={{ background: openFaq === q ? 'color-mix(in srgb, var(--color-on-inverse-surface) 6%, transparent)' : 'transparent' }}
                  onMouseEnter={e => { if (openFaq !== q) e.currentTarget.style.background = 'color-mix(in srgb, var(--color-on-inverse-surface) 3%, transparent)' }}
                  onMouseLeave={e => { if (openFaq !== q) e.currentTarget.style.background = 'transparent' }}>
                  <button onClick={() => setOpenFaq(openFaq === q ? null : q)} className="w-full text-left flex items-center gap-4 px-5 py-4">
                    <span
                      className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200"
                      style={{
                        background: openFaq === q ? 'var(--color-on-inverse-surface)' : 'transparent',
                        border: openFaq === q ? 'none' : '1px solid color-mix(in srgb, var(--color-on-inverse-surface) 10%, transparent)',
                        color: openFaq === q ? 'var(--color-inverse-surface)' : 'color-mix(in srgb, var(--color-on-inverse-surface) 30%, transparent)',
                        transform: openFaq === q ? 'rotate(90deg)' : 'rotate(0deg)',
                      }}>
                      <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                        <path d="M5.25 3.5L8.75 7L5.25 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                    <div className="flex-1">
                      <span className="font-heading text-[16px] font-normal" style={{ color: 'var(--color-on-inverse-surface)' }}>{q}</span>
                      {faqCategory === 'All' && (
                        <span className="ml-2 text-[10px] font-mono align-middle" style={{ color: 'color-mix(in srgb, var(--color-on-inverse-surface) 20%, transparent)' }}>{cat}</span>
                      )}
                    </div>
                  </button>
                  {openFaq === q && (
                    <div className="px-5 pb-4 pl-[52px]">
                      <p className="text-[13px] leading-[1.7]" style={{ color: 'color-mix(in srgb, var(--color-on-inverse-surface) 50%, transparent)' }}>{a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 pt-8 text-center" style={{ borderTop: '1px solid color-mix(in srgb, var(--color-on-inverse-surface) 6%, transparent)' }}>
            <p className="text-[13px] mb-3" style={{ color: 'color-mix(in srgb, var(--color-on-inverse-surface) 30%, transparent)' }}>Can't find what you're looking for?</p>
            <a href="mailto:buildtogether.contact@gmail.com"
              className="inline-flex items-center gap-2 text-[13px] font-medium transition-colors"
              style={{ color: 'color-mix(in srgb, var(--color-on-inverse-surface) 60%, transparent)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--color-on-inverse-surface)'}
              onMouseLeave={e => e.currentTarget.style.color = 'color-mix(in srgb, var(--color-on-inverse-surface) 60%, transparent)'}>
              <span className="material-symbols-outlined text-[16px]">mail</span>
              Contact us
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 sm:px-8 border-t border-line">
        <div className="max-w-[640px] mx-auto text-center">
          <h2 className="font-heading text-[40px] sm:text-[48px] font-light leading-[1.1] tracking-[-0.02em] text-on-surface mb-4">
            Ready to build?
          </h2>
          <p className="text-[16px] text-on-surface-variant mb-8 max-w-[420px] mx-auto leading-relaxed">
            Join {stats.members || 0} developers shipping real projects together. Free forever.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/register"
              className="inline-flex items-center gap-2 h-[48px] px-8 rounded-lg text-[15px] font-semibold text-white bg-primary hover:bg-primary-container transition-all">
              Get Started Free
            </Link>
            <Link to="/explore" className="inline-flex items-center gap-2 h-[48px] px-8 rounded-lg text-[15px] font-semibold text-on-surface border border-line hover:bg-surface-container-low transition-all">
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-24 px-6 sm:px-8 border-t border-line bg-surface-container-low/30">
        <div className="mx-auto max-w-[720px] text-center">
          <div className="mb-6">
            <img src="/uday.jpg" alt="Uday Pratap Singh"
              className="w-20 h-20 rounded-2xl object-cover bg-surface-container-high mx-auto ring-4 ring-surface ring-offset-2 ring-offset-surface-container-low" />
          </div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/8 text-primary text-[11px] font-bold uppercase tracking-widest mb-5">The story behind it</span>
          <h2 className="font-heading text-[26px] sm:text-[30px] font-light text-on-surface tracking-tight leading-snug mb-5">
            Started as a final year B.Tech project.<br className="hidden sm:block" /> Became something real.
          </h2>
          <p className="text-[15px] leading-[1.8] text-on-surface-variant max-w-[540px] mx-auto mb-6">
            BuildTogether was born from a simple frustration: collaboration tools for developers
            were either too bloated or too barebones. The goal for a semester project was to
            build a workspace where you publish a project, find the right contributors, and ship
            together — with real-time Kanban boards, live notifications, and GitHub integration.
          </p>
          <p className="text-[15px] leading-[1.8] text-on-surface-variant max-w-[540px] mx-auto mb-8">
            What started as coursework became a platform used by real developers building real
            projects. That's the best kind of project — one that doesn't stop at the deadline.
          </p>
          <div className="flex items-center justify-center gap-3">
            <img src="/uday.jpg" alt="" className="w-8 h-8 rounded-full object-cover bg-surface-container-high" />
            <div className="text-left">
              <p className="text-[13px] font-semibold text-on-surface leading-none">Uday Pratap Singh</p>
              <p className="text-[11px] text-muted mt-0.5">Creator & Developer</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line px-6 sm:px-8 py-12 bg-surface">
        <div className="mx-auto max-w-[1080px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 rounded-lg bg-on-surface flex items-center justify-center overflow-hidden">
                  <img src="/logo.png" alt="" className="w-full h-full object-cover dark:invert" />
                </div>
                <span className="text-[16px] font-bold text-on-surface tracking-tight">BuildTogether</span>
              </div>
              <p className="text-[13px] leading-relaxed text-on-surface-variant">A modern workspace for developers to build projects together.</p>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-on-surface mb-3">Platform</h4>
              <ul className="space-y-2">
                <li><Link to="/explore" className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors">Discover Projects</Link></li>
                <li><Link to="/register" className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-on-surface mb-3">Resources</h4>
              <ul className="space-y-2">
                <li><a href="https://github.com/codebyuday/BuildTogether" target="_blank" rel="noopener" className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors">GitHub</a></li>
                <li><Link to="/explore" className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors">Explore</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[13px] font-semibold text-on-surface mb-3">Support</h4>
              <ul className="space-y-2">
                <li><a href="mailto:buildtogether.contact@gmail.com" className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors">Contact Us</a></li>
                <li><a href="https://github.com/codebyuday/BuildTogether/issues" target="_blank" rel="noopener" className="text-[13px] text-on-surface-variant hover:text-on-surface transition-colors">Report an Issue</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line">
            <p className="text-[11px] text-muted">Created by <a href="https://www.linkedin.com/in/udaypratap-singh-285823288/" target="_blank" rel="noopener" className="hover:text-on-surface transition-colors font-semibold">Uday Pratap Singh</a></p>
            <p className="text-[11px] text-muted">&copy; {new Date().getFullYear()} BuildTogether</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
