import { ArrowDown, Database, GithubLogo, Pulse, Timer } from '@phosphor-icons/react'
import type { RankingDocument } from '../domain/repository'
import { formatInteger } from '../utils/format'

interface HeroSummaryProps {
  document: RankingDocument
}

export function HeroSummary({ document }: HeroSummaryProps) {
  const topRepository = document.repositories[0]
  const isWarmup = document.status === 'warmup'

  return (
    <section className="hero" id="top">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="hero-kicker"><GithubLogo size={17} weight="fill" aria-hidden="true" /> 開源情報，每日一榜</p>
          <h1>找到正在上升的<br />開源項目。</h1>
          <p className="hero-lede">用可解釋增長數據排名，再把榜首研究成人話。</p>
          <div className="hero-actions">
            <a className="primary-action" href="#ranking">看今日榜 <ArrowDown size={18} aria-hidden="true" /></a>
            <a className="secondary-action" href="#methodology">分數怎樣算</a>
          </div>
        </div>
        <div className="hero-status" role="group" aria-label="今日資料概況">
          <div className="status-heading">
            {isWarmup ? <Timer size={24} aria-hidden="true" /> : <Pulse size={24} aria-hidden="true" />}
            <div>
              <strong>{isWarmup ? '首日暖機中' : '每日增長已啟用'}</strong>
              <span>{isWarmup ? '下一次快照後顯示真實 24 小時增長' : '使用昨日快照計算今日動能'}</span>
            </div>
          </div>
          <dl className="hero-metrics">
            <div>
              <dt>候選池</dt>
              <dd>{formatInteger(document.stats.candidateCount)}</dd>
            </div>
            <div>
              <dt>入榜</dt>
              <dd>{formatInteger(document.stats.rankedCount)}</dd>
            </div>
            <div>
              <dt>快照日數</dt>
              <dd>{document.stats.historyDays}</dd>
            </div>
          </dl>
          {topRepository && (
            <div className="top-signal">
              <Database size={18} aria-hidden="true" />
              <span>今日第一</span>
              <a href={topRepository.url} target="_blank" rel="noreferrer">{topRepository.fullName}</a>
            </div>
          )}
          {document.source === 'fixtures' && (
            <p className="fixture-notice">目前顯示離線示例資料，執行每日抓取後會換成 GitHub 實時資料。</p>
          )}
        </div>
      </div>
    </section>
  )
}
