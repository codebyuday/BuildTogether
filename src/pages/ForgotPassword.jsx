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
    <div className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>
      <div className="relative w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-ink flex items-center justify-center text-white text-[14px] font-extrabold">
              <span className="font-mono">B</span>
            </div>
            <span className="text-[20px] font-extrabold text-ink tracking-tight">BuildTogether</span>
          </Link>
          <h1 className="text-[24px] font-extrabold text-ink tracking-tight">Reset your password</h1>
          <p className="text-[14px] text-secondary mt-1">We&apos;ll send you a reset link</p>
        </div>

        <div className="bg-white border border-line rounded-[20px] p-6" style={{ boxShadow: '0px 4px 32px 0px rgba(11, 54, 88, 0.08)' }}>
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[28px] text-success">mark_email_read</span>
              </div>
              <h3 className="text-[16px] font-bold text-ink mb-2">Check your email</h3>
              <p className="text-[13.5px] text-secondary">We sent a password reset link to <span className="font-semibold text-ink">{email}</span></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-2xl bg-danger/10 border border-danger/20 px-4 py-2.5 text-[13px] text-danger font-medium">{error}</div>
              )}
              <div>
                <label className="block text-[12px] font-semibold text-secondary mb-1.5">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com"
                  className="w-full bg-surface-container-low border border-line rounded-3xl px-4 py-2.5 text-[14px] text-ink placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-primary text-white rounded-3xl py-2.5 text-[14px] font-semibold hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50">
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

        <p className="text-center mt-6 text-[14px] text-secondary">
          <Link to="/login" className="text-primary font-semibold hover:underline">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
