import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { friendlyError } from '../lib/utils'
import { throttle } from '../lib/rateLimit'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
        fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(email, password, username, fullName) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw new Error(friendlyError(error))
    if (data.user) {
      setUser(data.user)
      const { error: profileError } = await supabase.from('profiles').upsert(
        { id: data.user.id, username, full_name: fullName || username, email },
        { onConflict: 'id' }
      )
      if (profileError) console.error('Profile upsert error:', profileError)
      await fetchProfile(data.user.id)
    }
    return data
  }

  const throttledSignIn = throttle(async (email, password, options = {}) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password, options })
    if (error) throw new Error(friendlyError(error))
    setUser(data.user)
    await fetchProfile(data.user.id)
    return data
  }, 2000)

  async function signIn(email, password, options = {}) {
    return throttledSignIn(email, password, options)
  }

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
    if (error) throw new Error(friendlyError(error))
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })
    if (error) throw new Error(friendlyError(error))
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signInWithGoogle, signOut, resetPassword, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
