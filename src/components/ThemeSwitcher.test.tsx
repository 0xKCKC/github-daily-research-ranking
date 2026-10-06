import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { ThemeSwitcher } from './ThemeSwitcher'

describe('ThemeSwitcher', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
    delete document.documentElement.dataset.theme
  })

  it('applies and remembers the black theme', () => {
    render(<ThemeSwitcher />)
    fireEvent.click(screen.getByRole('radio', { name: '黑色' }))

    expect(document.documentElement.dataset.theme).toBe('black')
    expect(localStorage.getItem('theme')).toBe('black')
    expect(screen.getByRole('radio', { name: '黑色' })).toHaveAttribute('aria-checked', 'true')
  })

  it('returns to the system theme', () => {
    localStorage.setItem('theme', 'dark')
    render(<ThemeSwitcher />)
    expect(document.documentElement.dataset.theme).toBe('dark')

    fireEvent.click(screen.getByRole('radio', { name: '跟隨系統' }))

    expect(document.documentElement.dataset.theme).toBeUndefined()
    expect(localStorage.getItem('theme')).toBeNull()
  })
})
