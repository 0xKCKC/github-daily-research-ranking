import { ChartLineUp, Code, GitFork, Lightning, Sparkle, Timer } from '@phosphor-icons/react'

interface MethodologyProps {
  status: 'warmup' | 'live'
  historyDays: number
}

const factors = [
  { name: 'star 動能', weight: '35%', text: '24 小時新增 stars 的絕對強度', icon: Lightning },
  { name: '相對增長', weight: '20%', text: '按目前體量校正，小 repo 也有機會', icon: Sparkle },
  { name: '七日加速度', weight: '10%', text: '今日速度相比前六日是否加快', icon: ChartLineUp },
  { name: 'fork 動能', weight: '10%', text: '新增 forks 反映進一步採用意圖', icon: GitFork },
  { name: '開發活動', weight: '15%', text: '最後 push 距今時間的衰減分數', icon: Code },
  { name: '項目新鮮度', weight: '10%', text: '適度提升真正新項目的能見度', icon: Timer }
]

export function Methodology({ status, historyDays }: MethodologyProps) {
  return (
    <section className="methodology" id="methodology" aria-labelledby="methodology-title">
      <div className="container methodology-inner">
        <div className="methodology-copy">
          <h2 id="methodology-title">名次有證據，摘要不投票。</h2>
          <p>研究文字只解釋數據，不會替喜歡的項目加分。所有分數都能在每個 repo 的研究摘要中拆開核對。</p>
          <div className="method-note">
            <strong>{status === 'warmup' ? '目前是暖機排名' : `已有 ${historyDays} 日快照`}</strong>
            <span>{status === 'warmup' ? '首日以 stars/day、項目年齡和活躍度建立基線。' : '每日增量和排名升跌已採用真實快照。'}</span>
          </div>
        </div>
        <div className="factor-grid">
          {factors.map(({ name, weight, text, icon: Icon }) => (
            <article key={name}>
              <Icon size={22} aria-hidden="true" />
              <div className="factor-title"><h3>{name}</h3><strong>{weight}</strong></div>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
