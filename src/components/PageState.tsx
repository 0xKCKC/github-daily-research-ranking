import { MagnifyingGlass, WarningCircle } from '@phosphor-icons/react'

interface PageStateProps {
  type: 'loading' | 'error' | 'empty'
  message?: string
}

export function PageState({ type, message }: PageStateProps) {
  if (type === 'loading') {
    return (
      <main className="page-state loading-state" aria-busy="true" aria-label="正在載入排行榜">
        <div className="loading-brand" />
        <div className="loading-line is-wide" />
        <div className="loading-line" />
        <div className="loading-grid">
          <div /><div /><div />
        </div>
      </main>
    )
  }

  if (type === 'empty') {
    return (
      <div className="empty-state">
        <MagnifyingGlass size={32} aria-hidden="true" />
        <h3>沒有符合條件的 repo</h3>
        <p>試試另一個分類，或縮短搜尋字詞。</p>
      </div>
    )
  }

  return (
    <main className="page-state error-state">
      <WarningCircle size={38} aria-hidden="true" />
      <h1>排行榜暫時讀不到</h1>
      <p>{message ?? '請稍後再試。'}</p>
      <button type="button" onClick={() => window.location.reload()}>重新載入</button>
    </main>
  )
}
