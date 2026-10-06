import { Info, TrendUp } from '@phosphor-icons/react'
import { formatDateTime } from '../utils/format'
import { Logo } from './Logo'
import { ThemeSwitcher } from './ThemeSwitcher'

interface HeaderProps {
  generatedAt: string
}

export function Header({ generatedAt }: HeaderProps) {
  return (
    <header className="site-header">
      <nav className="container nav-row" aria-label="主要導覽">
        <a className="brand" href="#top" aria-label="星勢 StarMomentum 首頁">
          <Logo size={26} />
          <span>星勢</span>
          <span className="brand-latin">StarMomentum</span>
        </a>
        <div className="nav-links">
          <a href="#ranking"><TrendUp size={17} aria-hidden="true" />排行</a>
          <a href="#methodology"><Info size={17} aria-hidden="true" />計分方法</a>
        </div>
        <div className="nav-end">
          <p className="updated-at">更新 {formatDateTime(generatedAt)}</p>
          <ThemeSwitcher />
        </div>
      </nav>
    </header>
  )
}
