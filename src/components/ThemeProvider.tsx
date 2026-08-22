'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = 'pdsk-theme'

/**
 * ThemeProvider — dark/light cyberpunk theme.
 *
 * Defaults to dark (the cyberpunk aesthetic). The user's explicit choice is
 * persisted to localStorage and mirrored to a cookie so server rendering can
 * read it via `cookies()` and avoid a flash of the wrong theme. The no-flash
 * inline script in the root layout sets `data-theme` before hydration.
 *
 * `light` is a softer "neon-on-ink" variant — it does not disable the shader
 * background (still cyberpunk), only lifts base surfaces for readability.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark')

  // Sync from the attribute the no-flash script set, then from storage.
  useEffect(() => {
    const initial =
      (document.documentElement.getAttribute('data-theme') as Theme | null) ??
      (localStorage.getItem(STORAGE_KEY) as Theme | null) ??
      'dark'
    setThemeState(initial)
  }, [])

  const apply = useCallback((t: Theme) => {
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem(STORAGE_KEY, t)
    // Mirror to cookie so server can read it (avoids FOUC on hard reload).
    document.cookie = `${STORAGE_KEY}=${t}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`
  }, [])

  const setTheme = useCallback(
    (t: Theme) => {
      setThemeState(t)
      apply(t)
    },
    [apply],
  )

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      apply(next)
      return next
    })
  }, [apply])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    // Safe fallback for components rendered outside the provider.
    return {
      theme: 'dark',
      toggleTheme: () => {},
      setTheme: () => {},
    }
  }
  return ctx
}
