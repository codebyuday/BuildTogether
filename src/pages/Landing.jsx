import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import NumberTicker from '../components/NumberTicker'
import HeroParticles from '../components/HeroParticles'
import ShimmerButton from '../components/ShimmerButton'

const features = [
  { icon: 'sync', title: 'Real-time Collaboration', desc: 'Live updates, comments, and activity feeds powered by WebSocket connections.', color: 'primary' },
  { icon: 'group_add', title: 'Team Recruitment', desc: 'Publish projects, review applications, and build high-performing teams.', color: 'teal' },
  { icon: 'view_kanban', title: 'Kanban Board', desc: 'Drag-and-drop task management with labels, milestones, and priority tracking.', color: 'primary' },
  { icon: 'terminal', title: 'GitHub Integration', desc: 'Connect repos for live commit activity, contributor stats, and language breakdown.', color: 'teal' },
  { icon: 'analytics', title: 'Project Analytics', desc: 'Track completion rates, velocity, and team performance with built-in stats.', color: 'primary' },
  { icon: 'download', title: 'Export Anywhere', desc: 'Export project data to Markdown, CSV, JSON, or PDF with one click.', color: 'teal' },
]

const steps = [
  { num: '01', title: 'Create a project', desc: 'Describe your vision, set requirements, and define the tech stack. Your project goes live instantly.' },
  { num: '02', title: 'Recruit contributors', desc: 'Developers browse, apply, and you review their profiles, skills, and proof of work before accepting.' },
  { num: '03', title: 'Ship together', desc: 'Assign tasks on a Kanban board, track progress in real-time, and launch with your team.' },
]

const faqCategories = ['All', 'Getting Started', 'Features', 'Technical']

const faqItems = [
  { q: 'Is BuildTogether free to use?', a: 'Yes. BuildTogether is free for all developers. Create unlimited projects, recruit contributors, and collaborate in real-time without any cost.', cat: 'Getting Started' },
  { q: 'How does team recruitment work?', a: 'Publish your project with requirements and tech stack. Contributors apply with their profiles and skills. You review applications and accept the best fit for your team.', cat: 'Getting Started' },
  { q: 'How do I get started as a contributor?', a: 'Sign up, complete your profile with skills and experience, then browse open projects in the Explore tab. Apply to projects that match your interests and wait for the project owner to review your application.', cat: 'Getting Started' },
  { q: 'Can I connect my GitHub repository?', a: 'Yes. Connect any public or private GitHub repository to get live commit activity, contributor stats, and language breakdown directly on your project page.', cat: 'Features' },
  { q: 'What export formats are supported?', a: 'You can export project data to Markdown, CSV, JSON, or PDF. Perfect for sharing progress with stakeholders or keeping local backups.', cat: 'Features' },
  { q: 'How does real-time collaboration work?', a: 'All changes to tasks, comments, and activity feeds are synchronized in real-time using Supabase WebSocket connections. No page refresh needed.', cat: 'Technical' },
  { q: 'What tech stack does BuildTogether use?', a: 'BuildTogether is built with React 19, Tailwind CSS v4, and Supabase (PostgreSQL + Auth + Realtime). The frontend is deployed on Vercel with automatic deployments from GitHub.', cat: 'Technical' },
  { q: 'Is my data secure?', a: 'Yes. All data is stored in Supabase with Row Level Security (RLS) policies ensuring users can only access projects they own or are members of. Authentication is handled by Supabase Auth with support for email/password and Google OAuth.', cat: 'Technical' },
]

const marqueeItems = [
  { text: 'React', style: 'font-bold' },
  { text: 'Supabase', style: 'font-semibold' },
  { text: 'Tailwind CSS', style: 'font-mono text-sm' },
  { text: 'TypeScript', style: 'font-bold' },
  { text: 'Node.js', style: 'font-semibold' },
  { text: 'Python', style: 'font-mono text-sm' },
  { text: 'Go', style: 'font-bold' },
  { text: 'Docker', style: 'font-semibold' },
  { text: 'PostgreSQL', style: 'font-mono text-sm' },
  { text: 'GraphQL', style: 'font-bold' },
  { text: 'Next.js', style: 'font-semibold' },
  { text: 'Rust', style: 'font-mono text-sm' },
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
    return () => observerRef.current?.disconnect()
  }, [])

  const addRevealRef = useCallback((el) => {
    if (!el) return
    if (!revealRefs.current.includes(el)) {
      revealRefs.current.push(el)
      observerRef.current?.observe(el)
    }
  }, [])

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 z-50 flex h-[60px] w-full items-center justify-between px-6 lg:px-10 glass">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-on-surface flex items-center justify-center text-white text-[12px] font-extrabold">
            <span className="font-mono">B</span>
          </div>
          <span className="text-[18px] font-extrabold text-on-surface tracking-tight">BuildTogether</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-[14px] text-muted font-semibold hover:text-on-surface transition-colors px-4 py-2 rounded-3xl hover:bg-surface-container-low">Login</Link>
          <Link to="/register" className="rounded-3xl bg-primary text-white px-6 py-2 text-[14px] font-semibold hover:brightness-110 transition-all active:scale-[0.98]">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-14 text-center">
        <HeroParticles />

        <div ref={addRevealRef} className="reveal relative z-10 mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-container-low px-4 py-1.5 text-[12px] font-mono text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-success pulse-green" />
          Open Source &middot; Free Forever
        </div>

        <h1 ref={addRevealRef} className="reveal reveal-delay-1 relative z-10 max-w-4xl text-[42px] sm:text-[56px] lg:text-[72px] font-extrabold leading-[1.05] tracking-[-0.02em] text-on-surface">
          Build projects<br />
          <span className="text-primary">together</span>
        </h1>

        <p ref={addRevealRef} className="reveal reveal-delay-2 relative z-10 mt-5 max-w-xl text-[17px] leading-relaxed text-on-surface-variant">
          A modern workspace where developers publish projects, recruit contributors,
          and collaborate through tasks with live notifications and real-time updates.
        </p>

        <div ref={addRevealRef} className="reveal reveal-delay-3 relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <ShimmerButton className="rounded-3xl bg-primary text-white px-8 py-3.5 text-[15px] font-semibold">
              Start Building
            </ShimmerButton>
          </Link>
          <Link to="/explore"
            className="rounded-3xl border border-line bg-white px-8 py-3.5 text-[15px] font-semibold text-on-surface hover:bg-surface-container-low transition-all">
            Explore Projects
          </Link>
        </div>

        <div ref={addRevealRef} className="reveal reveal-delay-4 relative z-10 mt-10 flex items-center gap-3">
          <div className="avatar-stack">
            {[47, 12, 32, 68].map(id => (
              <img key={id} src={`https://i.pravatar.cc/64?img=${id}`} alt="" className="w-8 h-8 rounded-full object-cover bg-surface-container-high" />
            ))}
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-on-surface" style={{ border: '2.5px solid white', marginLeft: '-8px' }}>+5</span>
          </div>
          <span className="text-[13px] text-on-surface-variant">{stats.members || 0} developers shipping real projects</span>
        </div>

        <div ref={addRevealRef} className="reveal relative z-10 mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: stats.members || 0, label: 'Developers' },
            { value: stats.projects || 0, label: 'Projects' },
            { value: 'Real-time', label: 'Collaboration' },
            { value: '100%', label: 'Open Source' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-[22px] font-extrabold text-on-surface">
                {typeof value === 'number' ? <NumberTicker value={value} /> : value}
              </div>
              <div className="text-[12px] text-muted mt-1 font-medium">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee */}
      <div ref={addRevealRef} className="reveal border-y border-line py-6 overflow-hidden">
        <div className="marquee-container">
          <div className="marquee-track">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className={`text-muted/40 text-lg whitespace-nowrap ${item.style}`}>
                {item.text}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-28 px-6 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div ref={addRevealRef} className="reveal text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-surface-container text-primary text-[11px] font-bold uppercase tracking-widest mb-4">How it works</span>
            <h2 className="text-[34px] sm:text-[40px] font-extrabold text-on-surface tracking-[-0.01em]">Three steps to ship</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} ref={addRevealRef} className={`reveal reveal-delay-${i + 1} step-card group relative bg-white border border-line rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1.5 cursor-default`}
                style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
                <div className="step-gradient-bar" />
                <div className="text-[56px] font-extrabold leading-none mb-4 text-gradient transition-transform duration-400 group-hover:scale-[1.04] group-hover:-translate-y-0.5">{num}</div>
                <h3 className="text-[19px] font-bold text-on-surface tracking-tight mb-2">{title}</h3>
                <p className="text-[14.5px] leading-relaxed text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6 sm:px-8 bg-surface-container-low/40">
        <div className="mx-auto max-w-[1200px]">
          <div ref={addRevealRef} className="reveal text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-surface-container text-primary text-[11px] font-bold uppercase tracking-widest mb-4">Features</span>
            <h2 className="text-[34px] sm:text-[40px] font-extrabold text-on-surface tracking-[-0.01em]">Everything you need</h2>
            <p className="mt-3 text-[15px] text-on-surface-variant max-w-lg mx-auto">Built for developers, by developers. No bloat, no compromise.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon, title, desc, color }, i) => (
              <div key={title} ref={addRevealRef} className={`reveal reveal-delay-${(i % 3) + 1} group rounded-[20px] border border-line bg-white p-6 card-hover`}
                style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${color === 'primary' ? 'bg-surface-container text-primary' : 'bg-surface-container text-tertiary'}`}>
                  <span className="material-symbols-outlined text-[22px]">{icon}</span>
                </div>
                <h3 className="mb-2 text-[15px] font-bold text-on-surface">{title}</h3>
                <p className="text-[13.5px] leading-relaxed text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-28 px-6 sm:px-8">
        <div className="mx-auto max-w-[1200px]">
          <div ref={addRevealRef} className="reveal text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-full bg-surface-container text-tertiary text-[11px] font-bold uppercase tracking-widest mb-4">Trusted by developers</span>
            <h2 className="text-[34px] sm:text-[40px] font-extrabold text-on-surface tracking-[-0.01em]">What people are building</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { quote: 'BuildTogether helped us recruit 4 contributors in a week. The real-time Kanban board is a game changer for our open source project.', name: 'Priya Sharma', role: 'Lead Developer', img: 47 },
              { quote: 'Finally a platform where I can show my proof of work and get recruited for real projects. The GitHub integration is seamless.', name: 'Arjun Mehta', role: 'Full-Stack Developer', img: 12 },
              { quote: 'We shipped our MVP in 3 weeks with a team we found here. The activity feeds kept everyone aligned without daily standups.', name: 'Sarah Chen', role: 'CTO, NovaTech', img: 32 },
            ].map(({ quote, name, role, img }, i) => (
              <div key={name} ref={addRevealRef} className={`reveal reveal-delay-${i + 1} group bg-white border border-line rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1`}
                style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
                <span className="text-primary text-[72px] leading-[0.5] h-[22px] block font-serif italic transition-transform duration-400 group-hover:scale-110 group-hover:-rotate-3 origin-left">&ldquo;</span>
                <p className="text-[17px] leading-[1.5] text-on-surface flex-1 mt-4 font-medium">{quote}</p>
                <div className="flex items-center gap-3 pt-5 border-t border-line mt-5">
                  <img src={`https://i.pravatar.cc/72?img=${img}`} alt={name} className="w-10 h-10 rounded-full object-cover bg-surface-container-high" />
                  <div>
                    <div className="text-[13.5px] font-bold text-on-surface">{name}</div>
                    <div className="text-[12px] text-muted">{role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ — dark section */}
      <section className="py-28 px-6 sm:px-8 bg-on-surface">
        <div className="mx-auto max-w-[880px]">
          <div ref={addRevealRef} className="reveal text-center mb-10">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/60 text-[11px] font-bold uppercase tracking-widest mb-4">FAQ</span>
            <h2 className="text-[34px] sm:text-[40px] font-extrabold text-white tracking-[-0.01em]">Frequently asked questions</h2>
            <p className="text-[15px] text-white/50 mt-3">Everything you need to know about BuildTogether.</p>
          </div>

          <div ref={addRevealRef} className="reveal flex items-center justify-center gap-2 mb-8 flex-wrap">
            {faqCategories.map(cat => (
              <button key={cat} onClick={() => { setFaqCategory(cat); setOpenFaq(null) }}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 ${faqCategory === cat ? 'bg-white text-on-surface' : 'text-white/50 hover:text-white/80 hover:bg-white/[0.06]'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2.5">
            {faqItems
              .filter(item => faqCategory === 'All' || item.cat === faqCategory)
              .map(({ q, a }, i) => (
              <div key={q} ref={addRevealRef} className={`reveal reveal-delay-${(i % 5) + 1} faq-item rounded-2xl px-6 py-5 transition-all duration-300 ${openFaq === q ? 'is-open bg-white/[0.06] border border-white/15' : 'border border-white/[0.08] bg-white/[0.02]'}`}>
                <button onClick={() => setOpenFaq(openFaq === q ? null : q)} className="w-full text-left flex items-center justify-between gap-4">
                  <span className="text-[16px] font-semibold text-white">{q}</span>
                  <span className={`shrink-0 w-8 h-8 rounded-full border border-white/15 flex items-center justify-center transition-all duration-300 ${openFaq === q ? 'bg-white rotate-180' : 'text-white/50'}`}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={`transition-colors duration-300 ${openFaq === q ? 'text-on-surface' : 'text-white/50'}`}>
                      <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                </button>
                <div className="faq-body">
                  <div>
                    <p className="text-[14.5px] leading-[1.65] mt-4 text-white/60">{a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div ref={addRevealRef} className="reveal mt-10 text-center">
            <p className="text-[14px] text-white/40">Still have questions?{' '}
              <a href="mailto:udaypratapwins0@gmail.com" className="text-white/70 underline decoration-white/20 hover:text-white transition-colors">Contact us</a>
            </p>
          </div>
        </div>
      </section>

      {/* Dark CTA — full-bleed navy */}
      <section className="py-16 px-6 sm:px-8">
        <div className="relative max-w-[1136px] mx-auto rounded-[32px] overflow-hidden text-center px-10 sm:px-14 py-[88px] bg-on-surface">
          <div className="relative max-w-[720px] mx-auto">
            <h2 className="text-[42px] sm:text-[52px] lg:text-[56px] font-extrabold leading-[1.05] tracking-[-0.02em] text-white">
              Ready to build?
            </h2>
            <p className="text-[17px] mt-5 mb-8 leading-[1.55] max-w-[480px] mx-auto text-white/60">
              Join a community of developers shipping real projects together. Free to start, no credit card needed.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/register">
                <ShimmerButton className="inline-flex items-center gap-2 h-[50px] px-8 rounded-3xl text-[15px] font-semibold text-white bg-primary">
                  Start Building
                </ShimmerButton>
              </Link>
              <Link to="/explore" className="inline-flex items-center gap-2 h-[50px] px-8 rounded-3xl text-[15px] font-semibold text-white border border-white/20 hover:bg-white/10 transition-all duration-300 hover:-translate-y-px">
                Explore Projects
              </Link>
            </div>
            <div className="flex items-center justify-center gap-3 mt-8">
              <div className="avatar-stack">
                {[47, 12, 32, 68].map(id => (
                  <img key={id} src={`https://i.pravatar.cc/64?img=${id}`} alt="" className="w-7 h-7 rounded-full object-cover" style={{ border: '2px solid #0b3658' }} />
                ))}
              </div>
              <span className="text-[13px] text-white/60">+{stats.members || 0} joined last week</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line px-6 sm:px-8 py-14 sm:py-20 bg-surface">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-2xl bg-on-surface flex items-center justify-center text-white text-[12px] font-extrabold">
                  <span className="font-mono">B</span>
                </div>
                <span className="text-[18px] font-extrabold text-on-surface tracking-tight">BuildTogether</span>
              </div>
              <p className="text-[13.5px] leading-[1.6] text-on-surface-variant mb-5">A modern workspace for developers to build projects together.</p>
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-on-surface mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li><Link to="/explore" className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors">Discover Projects</Link></li>
                <li><Link to="/register" className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors">Sign In</Link></li>
                <li><Link to="/dashboard" className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-on-surface mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><a href="https://github.com/codebyuday/BuildTogether" target="_blank" rel="noopener" className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors">GitHub</a></li>
                <li><Link to="/explore" className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors">Explore</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[16px] font-bold text-on-surface mb-4">Support</h4>
              <ul className="space-y-2.5">
                <li><a href="mailto:udaypratapwins0@gmail.com" className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors">Contact Us</a></li>
                <li><a href="https://github.com/codebyuday/BuildTogether/issues" target="_blank" rel="noopener" className="text-[14px] text-on-surface-variant hover:text-on-surface transition-colors">Report an Issue</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line">
            <p className="text-[12px] text-muted">Created &amp; Administered by <a href="https://www.linkedin.com/in/udaypratap-singh-285823288/" target="_blank" rel="noopener" className="hover:text-on-surface transition-colors font-semibold">Uday Pratap Singh</a></p>
            <p className="text-[12px] text-muted">&copy; {new Date().getFullYear()} BuildTogether. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
