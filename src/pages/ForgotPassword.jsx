import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ForgotPassword() {
  const { resetPassword, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const { error } = await resetPassword(email)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>
      <div className="relative w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <img src="/logo.png" alt="BuildTogether" className="h-8" />
          </Link>
          <h1 className="text-[24px] font-bold text-on-surface tracking-tight">Reset your password</h1>
          <p className="text-[14px] text-on-surface-variant mt-1">We&apos;ll send you a reset link</p>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[28px] text-success">mark_email_read</span>
              </div>
              <h3 className="text-[16px] font-bold text-on-surface mb-2">Check your email</h3>
              <p className="text-[13.5px] text-on-surface-variant">We sent a password reset link to <span className="font-semibold text-on-surface">{email}</span></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-2.5 text-[13px] text-danger font-medium">{error}</div>
              )}
              <div>
                <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                  className="w-full bg-surface-container-low border border-line rounded-[12px] px-4 py-2.5 text-[14px] text-on-surface placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary text-white rounded-[99px] py-2.5 text-[14px] font-semibold hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 glow-primary btn-shimmer">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-[14px] text-on-surface-variant">
          <Link to="/login" className="text-primary font-semibold hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
