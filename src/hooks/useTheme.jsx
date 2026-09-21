import { useEffect, useState, useCallback } from 'react'
import { ThemeContext } from './theme-context'

const THEME_KEY = 'bt-theme'
const THEME_VERSION_KEY = 'bt-theme-v'
const CURRENT_VERSION = '2'

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      const version = localStorage.getItem(THEME_VERSION_KEY)
      if (version !== CURRENT_VERSION) {
        localStorage.setItem(THEME_VERSION_KEY, CURRENT_VERSION)
        localStorage.removeItem(THEME_KEY)
        return 'light'
      }
      const stored = localStorage.getItem(THEME_KEY)
      if (stored === 'dark' || stored === 'light') return stored
    }
    return 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState(prev => prev === 'dark' ? 'light' : 'dark')
  }, [])

  const setTheme = useCallback((t) => {
    setThemeState(t)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
