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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">B</div>
          <h1 className="text-xl font-bold text-white">Reset your password</h1>
        </div>

        {sent ? (
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-center text-sm text-slate-300">
            Check your email for a password reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-400">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full rounded-lg bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <div className="mt-4 text-center text-sm text-slate-400">
          <Link to="/login" className="text-primary-400 hover:underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  )
}
