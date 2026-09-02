import { GithubLogo, Info, TrendUp } from '@phosphor-icons/react'
import { formatDateTime } from '../utils/format'

interface HeaderProps {
  generatedAt: string
}

export function Header({ generatedAt }: HeaderProps) {
  return (
    <header className="site-header">
      <nav className="container nav-row" aria-label="主要導覽">
        <a className="brand" href="#top" aria-label="GitHub 日研榜首頁">
          <GithubLogo size={24} weight="fill" aria-hidden="true" />
          <span>GitHub 日研榜</span>
        </a>
        <div className="nav-links">
          <a href="#ranking"><TrendUp size={17} aria-hidden="true" />排行</a>
          <a href="#methodology"><Info size={17} aria-hidden="true" />計分方法</a>
        </div>
        <p className="updated-at">更新 {formatDateTime(generatedAt)}</p>
      </nav>
    </header>
  )
}
