import { ArrowDown, ArrowUp, GitFork, Minus, Star, TrendUp } from '@phosphor-icons/react'
import type { RankedRepository } from '../domain/repository'
import { formatCompactNumber } from '../utils/format'

interface RepositoryMetaProps {
  repository: RankedRepository
  compact?: boolean
}

function RankMovement({ change }: { change: number | null }) {
  if (change === null) return <span className="rank-movement is-new">新</span>
  if (change > 0) return <span className="rank-movement is-up"><ArrowUp size={13} />{change}</span>
  if (change < 0) return <span className="rank-movement is-down"><ArrowDown size={13} />{Math.abs(change)}</span>
  return <span className="rank-movement"><Minus size={13} />0</span>
}

export function RepositoryMeta({ repository, compact = false }: RepositoryMetaProps) {
  const momentum = repository.signals.stars24h === null
    ? `${repository.signals.starsPerDay.toFixed(1)}/日基線`
    : `+${formatCompactNumber(repository.signals.stars24h)}/24h`

  return (
    <div className={compact ? 'repo-meta is-compact' : 'repo-meta'}>
      <span title="總 stars"><Star size={16} weight="fill" />{formatCompactNumber(repository.stars)}</span>
      <span title="總 forks"><GitFork size={16} />{formatCompactNumber(repository.forks)}</span>
      <span className="momentum" title="star 動能"><TrendUp size={16} />{momentum}</span>
      {!compact && <RankMovement change={repository.rankChange} />}
    </div>
  )
}
