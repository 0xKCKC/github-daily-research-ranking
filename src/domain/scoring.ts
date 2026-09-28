import { categorizeRepository } from './categories'
import { buildResearch } from './research'
import { clamp, daysBetween, hoursBetween, percentileRanks } from './numbers'
import type {
  GithubRepository,
  RankedRepository,
  RankingSignals,
  RepositorySnapshot,
  ScoreBreakdown
} from './repository'

interface ScoreRepositoriesOptions {
  now: string
  history?: RepositorySnapshot[]
  previousRanking?: RankedRepository[]
}

interface PreparedRepository {
  repository: GithubRepository
  signals: RankingSignals
}

type SnapshotEntry = RepositorySnapshot['repositories'][number]

interface HistoryBaselines {
  previous: Map<number, SnapshotEntry>
  week: Map<number, SnapshotEntry>
}

function indexSnapshot(snapshot: RepositorySnapshot | undefined): Map<number, SnapshotEntry> {
  return new Map((snapshot?.repositories ?? []).map((entry) => [entry.id, entry]))
}

function historyBaselines(history: RepositorySnapshot[], now: string): HistoryBaselines {
  const sortedHistory = [...history].sort((left, right) => right.capturedAt.localeCompare(left.capturedAt))
  const sevenDaysAgo = sortedHistory.find((snapshot) => daysBetween(snapshot.capturedAt, now) >= 6.5)
  return {
    previous: indexSnapshot(sortedHistory[0]),
    week: indexSnapshot(sevenDaysAgo)
  }
}

function buildSignals(
  repository: GithubRepository,
  now: string,
  baselines: HistoryBaselines
): RankingSignals {
  const previous = baselines.previous.get(repository.id)
  const weekEntry = baselines.week.get(repository.id)
  const stars24h = previous ? Math.max(0, repository.stars - previous.stars) : null
  const forks24h = previous ? Math.max(0, repository.forks - previous.forks) : null
  const ageDays = Math.max(daysBetween(repository.createdAt, now), 0.25)
  const starsPerDay = repository.stars / ageDays
  const relativeGrowth = stars24h === null
    ? null
    : stars24h / Math.sqrt(Math.max(repository.stars, 0) + 25)

  let acceleration7d: number | null = null
  if (stars24h !== null && weekEntry) {
    const weeklyGain = Math.max(0, repository.stars - weekEntry.stars)
    const earlierDailyAverage = Math.max((weeklyGain - stars24h) / 6, 0.25)
    acceleration7d = stars24h / earlierDailyAverage
  }

  return {
    stars24h,
    forks24h,
    relativeGrowth,
    acceleration7d,
    ageDays,
    hoursSincePush: hoursBetween(repository.pushedAt, now),
    starsPerDay
  }
}

function liveBreakdowns(prepared: PreparedRepository[]): ScoreBreakdown[] {
  const starMomentum = percentileRanks(prepared.map(({ signals }) => Math.log1p(signals.stars24h ?? 0)))
  const relativeGrowth = percentileRanks(prepared.map(({ signals }) => Math.log1p(signals.relativeGrowth ?? 0)))
  const acceleration = percentileRanks(prepared.map(({ signals }) => Math.log1p(signals.acceleration7d ?? 0)))
  const forkMomentum = percentileRanks(prepared.map(({ signals }) => Math.log1p(signals.forks24h ?? 0)))

  return prepared.map(({ signals }, index) => ({
    starMomentum: starMomentum[index] * 35,
    relativeGrowth: relativeGrowth[index] * 20,
    acceleration: acceleration[index] * 10,
    forkMomentum: forkMomentum[index] * 10,
    developmentActivity: clamp(Math.exp(-signals.hoursSincePush / (24 * 14))) * 15,
    freshness: clamp(Math.exp(-signals.ageDays / 120)) * 10
  }))
}

function warmupBreakdowns(prepared: PreparedRepository[]): ScoreBreakdown[] {
  const velocity = percentileRanks(prepared.map(({ signals }) => Math.log1p(signals.starsPerDay)))
  const popularity = percentileRanks(prepared.map(({ repository }) => Math.log1p(repository.stars)))

  return prepared.map(({ signals }, index) => ({
    starMomentum: velocity[index] * 35,
    relativeGrowth: velocity[index] * 20,
    acceleration: 0,
    forkMomentum: popularity[index] * 10,
    developmentActivity: clamp(Math.exp(-signals.hoursSincePush / (24 * 14))) * 20,
    freshness: clamp(Math.exp(-signals.ageDays / 120)) * 15
  }))
}

function totalScore(breakdown: ScoreBreakdown): number {
  return Object.values(breakdown).reduce((total, value) => total + value, 0)
}

export function scoreRepositories(
  repositories: GithubRepository[],
  options: ScoreRepositoriesOptions
): RankedRepository[] {
  const baselines = historyBaselines(options.history ?? [], options.now)
  const prepared = repositories
    .filter((repository) => !repository.archived && !repository.fork)
    .map((repository) => ({
      repository,
      signals: buildSignals(repository, options.now, baselines)
    }))
  const hasDailyBaseline = prepared.some(({ signals }) => signals.stars24h !== null)
  const breakdowns = hasDailyBaseline ? liveBreakdowns(prepared) : warmupBreakdowns(prepared)
  const previousRanks = new Map(
    (options.previousRanking ?? []).map((repository) => [repository.id, repository.rank])
  )

  return prepared
    .map(({ repository, signals }, index) => {
      const categories = categorizeRepository(repository)
      const score = totalScore(breakdowns[index])
      return {
        ...repository,
        rank: 0,
        previousRank: previousRanks.get(repository.id) ?? null,
        rankChange: null,
        score: Math.round(score * 10) / 10,
        categories,
        signals,
        scoreBreakdown: breakdowns[index],
        research: buildResearch(repository, signals, categories)
      }
    })
    .sort((left, right) => right.score - left.score || right.stars - left.stars)
    .map((repository, index) => {
      const rank = index + 1
      return {
        ...repository,
        rank,
        rankChange: repository.previousRank === null ? null : repository.previousRank - rank
      }
    })
}
