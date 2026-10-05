import { readFile, readdir } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { percentileRanks } from '../domain/numbers'
import type { GithubRepository, RepositorySnapshot } from '../domain/repository'
import { scoreRepositories } from '../domain/scoring'

// Replays the ranking on each stored snapshot using only the history available that day,
// then checks it against the star growth that actually happened over the next days.
// Snapshots do not store createdAt, so every repository gets the same age and the
// freshness component is neutral; everything else is the production scoring.

const HISTORY_SIZE = 8
const TOP = 50

function spearman(left: number[], right: number[]): number {
  const leftRanks = percentileRanks(left)
  const rightRanks = percentileRanks(right)
  const mean = (values: number[]) => values.reduce((total, value) => total + value, 0) / values.length
  const leftMean = mean(leftRanks)
  const rightMean = mean(rightRanks)
  let covariance = 0
  let leftVariance = 0
  let rightVariance = 0
  leftRanks.forEach((value, index) => {
    covariance += (value - leftMean) * (rightRanks[index] - rightMean)
    leftVariance += (value - leftMean) ** 2
    rightVariance += (rightRanks[index] - rightMean) ** 2
  })
  return covariance / Math.sqrt(leftVariance * rightVariance)
}

function toRepository(entry: RepositorySnapshot['repositories'][number]): GithubRepository {
  const [owner, name] = entry.fullName.split('/')
  return {
    id: entry.id,
    nodeId: '',
    name,
    fullName: entry.fullName,
    owner,
    ownerAvatarUrl: '',
    url: '',
    description: '',
    language: null,
    topics: [],
    stars: entry.stars,
    forks: entry.forks,
    openIssues: entry.openIssues,
    createdAt: '2000-01-01T00:00:00Z',
    updatedAt: entry.pushedAt,
    pushedAt: entry.pushedAt,
    license: null,
    archived: false,
    fork: false
  }
}

async function loadSnapshots(root: string): Promise<RepositorySnapshot[]> {
  const directory = join(root, 'data', 'snapshots')
  const names = (await readdir(directory)).filter((name) => /^\d{4}-\d{2}-\d{2}\.json$/.test(name)).sort()
  return Promise.all(names.map(async (name) =>
    JSON.parse(await readFile(join(directory, name), 'utf8')) as RepositorySnapshot
  ))
}

function evaluate(snapshots: RepositorySnapshot[], horizon: number) {
  const totals = { spearman: 0, precision: 0, stability: 0, days: 0, stabilityDays: 0 }
  let previousTop: Set<number> | null = null

  for (let day = HISTORY_SIZE; day + horizon < snapshots.length; day += 1) {
    const today = snapshots[day]
    const future = new Map(snapshots[day + horizon].repositories.map((entry) => [entry.id, entry]))
    const elapsedDays = (Date.parse(snapshots[day + horizon].capturedAt) - Date.parse(today.capturedAt)) / 86_400_000
    const ranked = scoreRepositories(today.repositories.map(toRepository), {
      now: today.capturedAt,
      history: snapshots.slice(day - HISTORY_SIZE, day)
    }).filter((repository) => future.has(repository.id))

    // Target mirrors the ranking's intent: absolute and size-adjusted forward growth.
    const forward = ranked.map((repository) =>
      Math.max(0, future.get(repository.id)!.stars - repository.stars) / elapsedDays
    )
    const absolute = percentileRanks(forward.map((gain) => Math.log1p(gain)))
    const relative = percentileRanks(forward.map((gain, index) =>
      Math.log1p(gain / Math.sqrt(ranked[index].stars + 25))
    ))
    const target = absolute.map((value, index) => 0.6 * value + 0.4 * relative[index])

    const targetTop = new Set(
      ranked.map((repository, index) => [repository.id, target[index]] as const)
        .sort((left, right) => right[1] - left[1])
        .slice(0, TOP)
        .map(([id]) => id)
    )
    const top = new Set(ranked.slice(0, TOP).map(({ id }) => id))

    totals.spearman += spearman(ranked.map(({ score }) => score), target)
    totals.precision += [...top].filter((id) => targetTop.has(id)).length / TOP
    if (previousTop) {
      totals.stability += [...top].filter((id) => previousTop!.has(id)).length / TOP
      totals.stabilityDays += 1
    }
    previousTop = top
    totals.days += 1
  }

  return {
    horizon,
    days: totals.days,
    spearman: totals.spearman / totals.days,
    precisionAt50: totals.precision / totals.days,
    top50Stability: totals.stability / totals.stabilityDays
  }
}

async function run(): Promise<void> {
  const snapshots = await loadSnapshots(resolve(process.cwd()))
  if (snapshots.length < HISTORY_SIZE + 2) {
    throw new Error(`Need at least ${HISTORY_SIZE + 2} snapshots, found ${snapshots.length}`)
  }

  for (const horizon of [1, 3, 7]) {
    const result = evaluate(snapshots, horizon)
    if (result.days === 0) continue
    process.stdout.write(
      `forward ${result.horizon}d (${result.days} days): ` +
      `spearman=${result.spearman.toFixed(3)} ` +
      `precision@${TOP}=${result.precisionAt50.toFixed(3)} ` +
      `stability=${result.top50Stability.toFixed(3)}\n`
    )
  }
}

run().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exitCode = 1
})
