export type RepositoryCategory =
  | 'ai'
  | 'devtools'
  | 'web'
  | 'data'
  | 'security'
  | 'infra'
  | 'mobile'
  | 'desktop'
  | 'creative'
  | 'games'
  | 'learning'
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
  /** Stars per day blended from the 24h and 3-day windows; null without a baseline. */
  starVelocity?: number | null
  relativeGrowth: number | null
  acceleration7d: number | null
  /** New forks per new star over about a week; null below 200 new stars. */
  forkRatio7d?: number | null
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
  /** 'jev' when TypeSafe's Jev model chose the categories; absent means the keyword rules. */
  categorySource?: 'jev'
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
  infra: '雲端與基建',
  security: '安全',
  mobile: '手機應用',
  desktop: '桌面與系統',
  creative: '設計與多媒體',
  games: '遊戲',
  learning: '學習資源',
  other: '其他'
}

export const repositoryCategories = Object.keys(categoryLabels) as RepositoryCategory[]
