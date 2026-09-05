import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface px-6 text-center">
      <span className="material-symbols-outlined text-[64px] text-outline mb-4">explore_off</span>
      <h1 className="text-[32px] font-bold text-on-surface mb-2">404</h1>
      <p className="text-[15px] text-on-surface-variant mb-6">This page doesn't exist or has been moved.</p>
      <Link to="/" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98]">
        Back to Home
      </Link>
    </div>
  )
}
