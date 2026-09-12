import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { signUp, signInWithGoogle, loading } = useAuth()
  const [formData, setFormData] = useState({ username: '', full_name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await signUp(formData.email, formData.password, formData.username, formData.full_name)
    } catch (err) {
      setError(err.message)
    }
  }

  const update = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
      </div>
      <div className="relative w-full max-w-[400px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <img src="/logo.png" alt="BuildTogether" className="h-10 dark:invert" />
          </Link>
          <h1 className="text-[24px] font-bold text-on-surface tracking-tight">Create your account</h1>
          <p className="text-[14px] text-on-surface-variant mt-1">Start building with your team</p>
        </div>

        <div className="bg-white border border-line rounded-2xl p-6" style={{ boxShadow: '0 1px 2px rgba(15,15,20,0.04)' }}>
          <button onClick={signInWithGoogle} disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-line bg-surface-container-low rounded-[99px] py-2.5 text-[14px] font-semibold text-on-surface hover:bg-surface-container-high transition-all disabled:opacity-50">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-line/50" />
            <span className="text-[12px] text-muted font-medium">or</span>
            <div className="flex-1 h-px bg-line/50" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="rounded-xl bg-danger/10 border border-danger/20 px-4 py-2.5 text-[13px] text-danger font-medium">{error}</div>
            )}
            <div>
              <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">Username</label>
              <input type="text" value={formData.username} onChange={update('username')} required placeholder="johndoe"
                className="w-full bg-surface-container-low border border-line rounded-[12px] px-4 py-2.5 text-[14px] text-on-surface placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">Full Name</label>
              <input type="text" value={formData.full_name} onChange={update('full_name')} required placeholder="John Doe"
                className="w-full bg-surface-container-low border border-line rounded-[12px] px-4 py-2.5 text-[14px] text-on-surface placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">Email</label>
              <input type="email" value={formData.email} onChange={update('email')} required placeholder="you@example.com"
                className="w-full bg-surface-container-low border border-line rounded-[12px] px-4 py-2.5 text-[14px] text-on-surface placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-on-surface-variant mb-1.5">Password</label>
              <input type="password" value={formData.password} onChange={update('password')} required placeholder="Min. 6 characters"
                className="w-full bg-surface-container-low border border-line rounded-[12px] px-4 py-2.5 text-[14px] text-on-surface placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white rounded-[99px] py-2.5 text-[14px] font-semibold hover:brightness-110 transition-all active:scale-[0.98] disabled:opacity-50 glow-primary btn-shimmer">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Creating account...
                </span>
              ) : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-[14px] text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
