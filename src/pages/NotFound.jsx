import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>
      <div className="relative z-10">
        <span className="material-symbols-outlined text-[56px] text-outline/25 mb-4 block">explore_off</span>
        <h1 className="text-[40px] font-bold text-on-surface mb-2 tracking-tight">404</h1>
        <p className="text-[15px] text-on-surface-variant/60 mb-8">This page doesn&apos;t exist or has been moved.</p>
        <Link to="/" className="inline-flex rounded-xl bg-primary text-on-primary px-6 py-2.5 text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
          Back to Home
        </Link>
      </div>
    </div>
  )
}
