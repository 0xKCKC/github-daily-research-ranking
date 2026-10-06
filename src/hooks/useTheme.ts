import { useEffect, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark' | 'black'

const STORAGE_KEY = 'theme'
const themeColors: Record<Exclude<Theme, 'system'>, string> = {
  light: '#f6f8fa',
  dark: '#0d1117',
  black: '#000000'
}

function readTheme(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'black') return saved
  } catch {
    // Storage can be blocked; the system theme still works.
  }
  return 'system'
}

function prefersDark(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme

  const effective = theme === 'system' ? (prefersDark() ? 'dark' : 'light') : theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColors[effective])
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    applyTheme(theme)
    try {
      if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
      else localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Not saved; the choice still applies for this visit.
    }
    if (theme !== 'system' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const update = () => applyTheme('system')
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [theme])

  return [theme, setTheme]
}
