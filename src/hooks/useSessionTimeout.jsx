import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuthHook'

const TIMEOUT_KEY = 'bt_inactivity_timeout'
const WARNING_MS = 5 * 60 * 1000

export function useSessionTimeout() {
  const { signOut } = useAuth()
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const timeoutRef = useRef(null)
  const warningRef = useRef(null)
  const countdownRef = useRef(null)

  const getTimeoutMinutes = useCallback(() => {
    return parseInt(localStorage.getItem(TIMEOUT_KEY) || '30', 10)
  }, [])

  const resetTimer = useCallback(() => {
    const minutes = getTimeoutMinutes()
    const ms = minutes * 60 * 1000
    clearTimeout(timeoutRef.current)
    clearTimeout(warningRef.current)
    clearInterval(countdownRef.current)
    setShowWarning(false)

    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      setCountdown(300)
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current)
            signOut()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, ms - WARNING_MS)

    timeoutRef.current = setTimeout(() => {
      signOut()
    }, ms)
  }, [getTimeoutMinutes, signOut])

  /* eslint-disable react/set-state-in-effect */
  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => document.addEventListener(e, resetTimer))
    resetTimer()
    return () => {
      events.forEach(e => document.removeEventListener(e, resetTimer))
      clearTimeout(timeoutRef.current)
      clearTimeout(warningRef.current)
      clearInterval(countdownRef.current)
    }
  }, [resetTimer])

  const stayLoggedIn = () => { setShowWarning(false); resetTimer() }

  if (!showWarning) return null

  const mins = Math.floor(countdown / 60)
  const secs = countdown % 60

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-surface-container-lowest border border-line rounded-xl shadow-2xl p-6 text-center">
        <span className="material-symbols-outlined text-[36px] text-warning mb-3 block">timer</span>
        <h3 className="text-[16px] font-semibold text-on-surface mb-1">Session Expiring</h3>
        <p className="text-[13px] text-on-surface-variant mb-4">
          You'll be signed out in <span className="font-mono font-bold text-warning">{mins}:{secs.toString().padStart(2, '0')}</span>
        </p>
        <button onClick={stayLoggedIn}
          className="bg-primary text-on-primary px-5 py-2 rounded-lg text-[13px] font-semibold hover:bg-primary-container transition-all">
          Stay logged in
        </button>
      </div>
    </div>
  )
}
