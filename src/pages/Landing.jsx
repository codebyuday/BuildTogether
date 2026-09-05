import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const features = [
  { icon: 'sync', title: 'Real-time Collaboration', desc: 'Live updates, comments, and activity feeds powered by WebSocket connections.', color: 'primary' },
  { icon: 'group_add', title: 'Team Recruitment', desc: 'Publish projects, review applications, and build high-performing teams.', color: 'tertiary' },
  { icon: 'view_kanban', title: 'Kanban Board', desc: 'Drag-and-drop task management with labels, milestones, and priority tracking.', color: 'primary' },
  { icon: 'terminal', title: 'GitHub Integration', desc: 'Connect repos for live commit activity, contributor stats, and language breakdown.', color: 'tertiary' },
  { icon: 'analytics', title: 'Project Analytics', desc: 'Track completion rates, velocity, and team performance with built-in stats.', color: 'primary' },
  { icon: 'download', title: 'Export Anywhere', desc: 'Export project data to Markdown, CSV, JSON, or PDF with one click.', color: 'tertiary' },
]

const steps = [
  { num: '01', title: 'Create a project', desc: 'Describe your vision, set requirements, and define the tech stack. Your project goes live instantly.' },
  { num: '02', title: 'Recruit contributors', desc: 'Developers browse, apply, and you review their profiles, skills, and proof of work before accepting.' },
  { num: '03', title: 'Ship together', desc: 'Assign tasks on a Kanban board, track progress in real-time, and launch with your team.' },
]

const faqItems = [
  { q: 'Is BuildTogether free to use?', a: 'Yes. BuildTogether is free for all developers. Create unlimited projects, recruit contributors, and collaborate in real-time without any cost.' },
  { q: 'How does team recruitment work?', a: 'Publish your project with requirements and tech stack. Contributors apply with their profiles and skills. You review applications and accept the best fit for your team.' },
  { q: 'Can I connect my GitHub repository?', a: 'Yes. Connect any public or private GitHub repository to get live commit activity, contributor stats, and language breakdown directly on your project page.' },
  { q: 'What export formats are supported?', a: 'You can export project data to Markdown, CSV, JSON, or PDF. Perfect for sharing progress with stakeholders or keeping local backups.' },
  { q: 'How does real-time collaboration work?', a: 'All changes to tasks, comments, and activity feeds are synchronized in real-time using Supabase WebSocket connections. No page refresh needed.' },
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

const faqIcons = ['code', 'groups', 'terminal', 'download', 'sync']

export default function Landing() {
  const [openFaq, setOpenFaq] = useState(null)
  const revealRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') })
    }, { threshold: 0.15 })
    revealRefs.current.forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const addRevealRef = (el) => {
    if (el && !revealRefs.current.includes(el)) revealRefs.current.push(el)
  }

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 z-50 flex h-[60px] w-full items-center justify-between px-6 lg:px-10 glass-warm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white text-[13px] font-bold shadow-lg glow-primary">
            <span className="font-mono">B</span>
          </div>
          <span className="text-[16px] font-bold text-on-surface tracking-tight">BuildTogether</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-[14px] text-on-surface-variant font-medium hover:text-on-surface transition-colors px-4 py-2 rounded-[99px] hover:bg-surface-container-high/50">Login</Link>
          <Link to="/register" className="rounded-[99px] bg-primary text-white px-5 py-2 text-[14px] font-semibold hover:brightness-110 transition-all active:scale-[0.98] glow-primary btn-shimmer">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-14 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-[120px]" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-tertiary/[0.05] blur-[100px]" />
        </div>

        <div ref={addRevealRef} className="reveal relative z-10 mb-6 inline-flex items-center gap-2 rounded-[99px] border border-line bg-surface-container-low px-4 py-1.5 text-[12px] font-mono text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-success pulse-green" />
          Open Source &middot; Free Forever
        </div>

        <h1 ref={addRevealRef} className="reveal reveal-delay-1 relative z-10 max-w-4xl text-[42px] sm:text-[52px] lg:text-[62px] font-bold leading-[1.05] tracking-tight text-on-surface">
          Build projects<br />
          <span className="text-gradient">together</span>
        </h1>

        <p ref={addRevealRef} className="reveal reveal-delay-2 relative z-10 mt-5 max-w-xl text-[16px] leading-relaxed text-on-surface-variant">
          A modern workspace where developers publish projects, recruit contributors,
          and collaborate through tasks with live notifications and real-time updates.
        </p>

        <div ref={addRevealRef} className="reveal reveal-delay-3 relative z-10 mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register"
            className="rounded-[99px] bg-primary text-white px-8 py-3 text-[15px] font-semibold hover:brightness-110 transition-all active:scale-[0.98] glow-primary btn-shimmer">
            Start Building
          </Link>
          <Link to="/explore"
            className="rounded-[99px] border border-line bg-surface-container-low px-8 py-3 text-[15px] font-semibold text-on-surface hover:bg-surface-container-high hover:border-line-2 transition-all">
            Explore Projects
          </Link>
        </div>

        <div ref={addRevealRef} className="reveal reveal-delay-4 relative z-10 mt-10 flex items-center gap-3">
          <div className="avatar-stack">
            {[47, 12, 32, 68].map(id => (
              <img key={id} src={`https://i.pravatar.cc/64?img=${id}`} alt="" className="w-8 h-8 rounded-full object-cover bg-surface-container-high" />
            ))}
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white bg-ink" style={{ border: '2.5px solid var(--color-surface)', marginLeft: '-8px' }}>+5</span>
          </div>
          <span className="text-[13px] text-on-surface-variant">5 team members shipping real projects</span>
        </div>

        <div ref={addRevealRef} className="reveal relative z-10 mt-16 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: '5', label: 'Team Members' },
            { value: '27', label: 'Features Built' },
            { value: 'Real-time', label: 'Collaboration' },
            { value: '100%', label: 'Open Source' },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-[22px] font-bold text-on-surface">{value}</div>
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
              <span key={i} className={`text-on-surface-variant/40 text-lg whitespace-nowrap ${item.style}`}>
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
            <span className="inline-block px-3 py-1 rounded-[99px] bg-tertiary/10 text-tertiary text-[11px] font-bold uppercase tracking-widest mb-4">How it works</span>
            <h2 className="text-[34px] sm:text-[38px] font-bold text-on-surface tracking-tight">Three steps to ship</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map(({ num, title, desc }, i) => (
              <div key={num} ref={addRevealRef} className={`reveal reveal-delay-${i + 1} step-card group relative bg-white border border-line rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-line-2 cursor-default`}
                style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
                <div className="step-gradient-bar" />
                <div className="text-[56px] font-bold leading-none mb-4 text-gradient transition-transform duration-400 group-hover:scale-[1.04] group-hover:-translate-y-0.5">{num}</div>
                <h3 className="text-[19px] font-bold text-on-surface tracking-tight mb-2">{title}</h3>
                <p className="text-[14.5px] leading-relaxed text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-28 px-6 sm:px-8 bg-surface-container-low/30">
        <div className="mx-auto max-w-[1200px]">
          <div ref={addRevealRef} className="reveal text-center mb-16">
            <span className="inline-block px-3 py-1 rounded-[99px] bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-widest mb-4">Features</span>
            <h2 className="text-[34px] sm:text-[38px] font-bold text-on-surface tracking-tight">Everything you need</h2>
            <p className="mt-3 text-[15px] text-on-surface-variant max-w-lg mx-auto">Built for developers, by developers. No bloat, no compromise.</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon, title, desc, color }, i) => (
              <div key={title} ref={addRevealRef} className={`reveal reveal-delay-${(i % 3) + 1} group rounded-2xl border border-line bg-white p-6 card-hover`}
                style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color === 'primary' ? 'bg-primary/10 text-primary' : 'bg-tertiary/10 text-tertiary'}`}>
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
            <span className="inline-block px-3 py-1 rounded-[99px] bg-success/10 text-success text-[11px] font-bold uppercase tracking-widest mb-4">Trusted by developers</span>
            <h2 className="text-[34px] sm:text-[38px] font-bold text-on-surface tracking-tight">What people are building</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { quote: 'BuildTogether helped us recruit 4 contributors in a week. The real-time Kanban board is a game changer for our open source project.', name: 'Priya Sharma', role: 'Lead Developer', img: 47 },
              { quote: 'Finally a platform where I can show my proof of work and get recruited for real projects. The GitHub integration is seamless.', name: 'Arjun Mehta', role: 'Full-Stack Developer', img: 12 },
              { quote: 'We shipped our MVP in 3 weeks with a team we found here. The activity feeds kept everyone aligned without daily standups.', name: 'Sarah Chen', role: 'CTO, NovaTech', img: 32 },
            ].map(({ quote, name, role, img }, i) => (
              <div key={name} ref={addRevealRef} className={`reveal reveal-delay-${i + 1} group bg-white border border-line rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1`}
                style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
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

      {/* FAQ */}
      <section className="py-28 px-6 sm:px-8" style={{ background: '#0E0E10', color: '#FAF8F3' }}>
        <div className="mx-auto max-w-[880px]">
          <div ref={addRevealRef} className="reveal text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-[99px] bg-white/10 text-white/60 text-[11px] font-bold uppercase tracking-widest mb-4">FAQ</span>
            <h2 className="text-[34px] sm:text-[38px] font-bold tracking-tight">Frequently asked questions</h2>
          </div>
          <div className="flex flex-col gap-2.5">
            {faqItems.map(({ q, a }, i) => (
              <div key={i} ref={addRevealRef} className={`reveal reveal-delay-${(i % 5) + 1} faq-item rounded-[18px] px-6 py-5 transition-all duration-300 ${openFaq === i ? 'is-open bg-white/[0.04] border border-white/15' : 'border border-white/[0.08] bg-white/[0.02]'}`}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full text-left flex items-center justify-between gap-4">
                  <span className="text-[16px] font-semibold">{q}</span>
                  <span className={`shrink-0 w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-[18px] transition-all duration-300 ${openFaq === i ? 'bg-white text-ink rotate-180' : 'text-white/50'}`}>
                    {openFaq === i ? '−' : '+'}
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
        </div>
      </section>

      {/* Dark CTA */}
      <section className="py-16 px-6 sm:px-8">
        <div className="relative max-w-[1136px] mx-auto rounded-[40px] overflow-hidden text-center px-10 sm:px-14 py-[88px]" style={{ background: '#0E0E10', color: '#FAF8F3' }}>
          <div className="absolute inset-[-10%] pointer-events-none" style={{ background: 'radial-gradient(circle at 20%, rgba(232,90,44,0.22), transparent 40%), radial-gradient(circle at 80%, rgba(52,71,212,0.24), transparent 40%)', animation: 'ctaGradient 14s ease-in-out infinite' }} />
          <div className="relative max-w-[720px] mx-auto">
            <h2 className="text-[42px] sm:text-[52px] lg:text-[56px] font-bold leading-[1.05] tracking-tight">
              Ready to <span className="italic text-[#FF8A5C]">build?</span>
            </h2>
            <p className="text-[17px] mt-5 mb-8 leading-[1.55] max-w-[480px] mx-auto text-white/60">
              Join a community of developers shipping real projects together. Free to start, no credit card needed.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 h-[50px] px-8 rounded-[99px] text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-px glow-primary btn-shimmer" style={{ background: '#3447D4', boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset, 0 8px 20px -6px rgba(52,71,212,0.5)' }}>
                Start Building
              </Link>
              <Link to="/explore" className="inline-flex items-center gap-2 h-[50px] px-8 rounded-[99px] text-[15px] font-semibold text-white transition-all duration-300 hover:-translate-y-px" style={{ background: '#E85A2C', boxShadow: '0 1px 0 rgba(255,255,255,0.15) inset, 0 8px 20px -6px rgba(232,90,44,0.5)' }}>
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line px-6 sm:px-8 py-14 sm:py-20">
        <div className="mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white text-[12px] font-bold">
                  <span className="font-mono">B</span>
                </div>
                <span className="text-[15px] font-bold text-on-surface tracking-tight">BuildTogether</span>
              </div>
              <p className="text-[13.5px] leading-[1.6] text-on-surface-variant mb-5">A modern workspace for developers to build projects together.</p>
            </div>
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[0.07em] text-muted mb-4">Platform</h4>
              <ul className="space-y-2.5">
                <li><Link to="/explore" className="text-[13.5px] text-on-surface-variant hover:text-on-surface transition-colors">Discover Projects</Link></li>
                <li><Link to="/register" className="text-[13.5px] text-on-surface-variant hover:text-on-surface transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="text-[13.5px] text-on-surface-variant hover:text-on-surface transition-colors">Sign In</Link></li>
                <li><Link to="/dashboard" className="text-[13.5px] text-on-surface-variant hover:text-on-surface transition-colors">Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[0.07em] text-muted mb-4">Resources</h4>
              <ul className="space-y-2.5">
                <li><a href="https://github.com/codebyuday/BuildTogether" target="_blank" rel="noopener" className="text-[13.5px] text-on-surface-variant hover:text-on-surface transition-colors">GitHub</a></li>
                <li><Link to="/explore" className="text-[13.5px] text-on-surface-variant hover:text-on-surface transition-colors">Explore</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[12px] font-bold uppercase tracking-[0.07em] text-muted mb-4">Support</h4>
              <ul className="space-y-2.5">
                <li><a href="mailto:udaypratapwins0@gmail.com" className="text-[13.5px] text-on-surface-variant hover:text-on-surface transition-colors">Contact Us</a></li>
                <li><a href="https://github.com/codebyuday/BuildTogether/issues" target="_blank" rel="noopener" className="text-[13.5px] text-on-surface-variant hover:text-on-surface transition-colors">Report an Issue</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-14 pt-7 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-line">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <a href="https://github.com/codebyuday/BuildTogether" target="_blank" rel="noopener" className="text-[12px] text-muted hover:text-on-surface transition-colors">GitHub</a>
            </div>
            <p className="text-[12px] text-muted">&copy; {new Date().getFullYear()} BuildTogether. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
