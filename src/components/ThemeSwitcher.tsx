import { Circle, Desktop, Moon, Sun, type Icon } from '@phosphor-icons/react'
import { useTheme, type Theme } from '../hooks/useTheme'

const options: Array<{ value: Theme, label: string, icon: Icon, weight?: 'fill' }> = [
  { value: 'system', label: '跟隨系統', icon: Desktop },
  { value: 'light', label: '淺色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'black', label: '黑色', icon: Circle, weight: 'fill' }
]

export function ThemeSwitcher() {
  const [theme, setTheme] = useTheme()

  return (
    <div className="theme-switcher" role="radiogroup" aria-label="配色">
      {options.map(({ value, label, icon: OptionIcon, weight }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          className={theme === value ? 'is-active' : undefined}
          onClick={() => setTheme(value)}
        >
          <OptionIcon size={15} weight={weight ?? (theme === value ? 'bold' : 'regular')} aria-hidden="true" />
        </button>
      ))}
    </div>
  )
}
