import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signUp(email, password, username)
      toast.success('Account created! Check your email to verify.')
      navigate('/dashboard')
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
          <h1 className="text-[20px] font-semibold text-on-surface">Create your account</h1>
          <p className="text-[12px] text-on-surface-variant mt-1">Start building with developers worldwide</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Username</label>
            <input
              type="text" required value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="alex_dev"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Email</label>
            <input
              type="email" required value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-mono text-on-surface-variant uppercase">Password</label>
            <input
              type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-space-sm py-2 text-on-surface text-[14px] placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full rounded-lg bg-primary text-on-primary py-2.5 text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-outline-variant/30" />
          <span className="text-[11px] font-mono text-outline">or</span>
          <div className="h-px flex-1 bg-outline-variant/30" />
        </div>

        <button
          onClick={() => signInWithGoogle()}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/40 bg-surface-container py-2.5 text-[14px] text-on-surface hover:bg-surface-container-high transition-colors"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign up with Google
        </button>

        <div className="mt-4 text-center text-[13px] text-on-surface-variant">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
