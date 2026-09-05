import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('Welcome back!')
      navigate('/dashboard')
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
          <h1 className="text-[22px] font-bold text-on-surface tracking-tight">Welcome back</h1>
          <p className="text-[13px] text-on-surface-variant/70 mt-1.5">Sign in to your developer workspace</p>
        </div>

        <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Email</label>
              <input
                type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-outline/60 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-on-surface-variant">Password</label>
              <input
                type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant/50 rounded-lg px-3.5 py-2.5 text-on-surface text-[14px] placeholder:text-outline/60 focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                placeholder="Enter your password"
              />
            </div>
            <div className="flex items-center justify-end">
              <Link to="/forgot-password" className="text-[12px] text-primary/80 hover:text-primary transition-colors">Forgot password?</Link>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full rounded-lg bg-primary text-on-primary py-2.5 text-[14px] font-semibold hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-outline-variant/30" />
            <span className="text-[11px] font-medium text-on-surface-variant/50 uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-outline-variant/30" />
          </div>

          <button
            onClick={() => signInWithGoogle()}
            className="flex w-full items-center justify-center gap-2.5 rounded-lg border border-outline-variant/40 bg-surface-container py-2.5 text-[13px] font-medium text-on-surface hover:bg-surface-container-high hover:border-outline-variant/60 transition-all"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-5 text-center text-[13px] text-on-surface-variant/70">
          Don&apos;t have an account? <Link to="/register" className="text-primary font-medium hover:text-primary-container transition-colors">Create one</Link>
        </p>
      </div>
    </div>
  )
}
