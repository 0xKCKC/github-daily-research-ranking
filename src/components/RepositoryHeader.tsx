import { ArrowSquareOut } from '@phosphor-icons/react'
import type { RankedRepository } from '../domain/repository'

interface RepositoryHeaderProps {
  repository: RankedRepository
}

export function RepositoryHeader({ repository }: RepositoryHeaderProps) {
  return (
    <div className="repository-heading">
      <img
        src={repository.ownerAvatarUrl}
        width="40"
        height="40"
        alt={`${repository.owner} 的頭像`}
        loading="lazy"
      />
      <div>
        <a href={repository.url} target="_blank" rel="noreferrer">
          {repository.fullName}
          <ArrowSquareOut size={16} aria-hidden="true" />
        </a>
        <p>{repository.language ?? '未識別語言'} {repository.license ? `/ ${repository.license}` : '/ 未標示授權'}</p>
      </div>
    </div>
  )
}
