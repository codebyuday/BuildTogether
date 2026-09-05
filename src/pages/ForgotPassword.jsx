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
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 border border-primary/40 text-primary text-sm font-bold">
            <span className="font-mono">B</span>
          </div>
          <h1 className="text-[20px] font-semibold text-on-surface">Reset your password</h1>
        </div>

        {sent ? (
          <div className="rounded-lg border border-outline-variant/40 bg-surface-container-low p-4 text-center text-[14px] text-on-surface">
            Check your email for a password reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full rounded-lg bg-primary text-on-primary py-2.5 text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-[13px] text-on-surface-variant">
          <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}
