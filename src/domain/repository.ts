export type RepositoryCategory =
  | 'ai'
  | 'devtools'
  | 'web'
  | 'data'
  | 'security'
  | 'mobile'
  | 'other'

export interface GithubRepository {
  id: number
  nodeId: string
  name: string
  fullName: string
  owner: string
  ownerAvatarUrl: string
  url: string
  description: string
  language: string | null
  topics: string[]
  stars: number
  forks: number
  openIssues: number
  createdAt: string
  updatedAt: string
  pushedAt: string
  license: string | null
  archived: boolean
  fork: boolean
}

export interface RepositorySnapshot {
  capturedAt: string
  repositories: Array<{
    id: number
    fullName: string
    stars: number
    forks: number
    openIssues: number
    pushedAt: string
  }>
}

export interface RankingSignals {
  stars24h: number | null
  forks24h: number | null
  relativeGrowth: number | null
  acceleration7d: number | null
  ageDays: number
  hoursSincePush: number
  starsPerDay: number
}

export interface ScoreBreakdown {
  starMomentum: number
  relativeGrowth: number
  acceleration: number
  forkMomentum: number
  developmentActivity: number
  freshness: number
}

export interface RepositoryResearch {
  summary: string
  whyNow: string
  bestFor: string
  evidence: string[]
  cautions: string[]
}

export interface RankedRepository extends GithubRepository {
  rank: number
  previousRank: number | null
  rankChange: number | null
  score: number
  categories: RepositoryCategory[]
  signals: RankingSignals
  scoreBreakdown: ScoreBreakdown
  research: RepositoryResearch
}

export interface RankingDocument {
  schemaVersion: 1
  generatedAt: string
  dataDate: string
  status: 'warmup' | 'live'
  source: 'github-live' | 'fixtures'
  methodologyVersion: string
  stats: {
    candidateCount: number
    rankedCount: number
    historyDays: number
  }
  repositories: RankedRepository[]
}

export const categoryLabels: Record<RepositoryCategory, string> = {
  ai: 'AI',
  devtools: '開發工具',
  web: 'Web',
  data: '資料',
  security: '安全',
  mobile: '流動開發',
  other: '其他'
}
