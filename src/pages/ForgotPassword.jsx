import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { resetPassword } = useAuth()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Reset link sent!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.03] blur-[120px]" />
      </div>
      <div className="w-full max-w-[380px] relative z-10">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 border border-primary/25 text-primary text-sm font-bold">
              <span className="font-mono">B</span>
            </div>
            <span className="text-[16px] font-semibold text-on-surface tracking-tight">BuildTogether</span>
          </Link>
          <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Reset your password</h1>
          <p className="text-[13px] text-on-surface-variant/70 mt-1.5">We&apos;ll send you a reset link</p>
        </div>

        <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-6">
          {sent ? (
            <div className="text-center py-4">
              <span className="material-symbols-outlined text-[36px] text-success/70 mb-3 block">mark_email_read</span>
              <p className="text-[14px] text-on-surface mb-1">Check your email</p>
              <p className="text-[12px] text-on-surface-variant/60">We sent a password reset link to <strong className="text-on-surface/80">{email}</strong></p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Email</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-outline/60 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full rounded-lg bg-primary text-on-primary py-2.5 text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                    Sending...
                  </span>
                ) : 'Send Reset Link'}
              </button>
            </form>
          )}
        </div>

        <p className="mt-5 text-center text-[13px] text-on-surface-variant/70">
          <Link to="/login" className="text-primary/80 hover:text-primary font-medium transition-colors">Back to sign in</Link>
        </p>
      </div>
    </div>
  )
}
