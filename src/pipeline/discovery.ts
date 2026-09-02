import type { GithubRepository } from '../domain/repository'
import { GithubClient } from './github-client'

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function daysAgo(now: Date, days: number): string {
  return isoDate(new Date(now.getTime() - days * 86_400_000))
}

export function discoveryQueries(now: Date): string[] {
  const pushedRecently = `pushed:>=${daysAgo(now, 7)} archived:false stars:>=30`

  return [
    `created:>=${daysAgo(now, 7)} archived:false stars:>=3`,
    `created:>=${daysAgo(now, 30)} archived:false stars:>=10`,
    `pushed:>=${daysAgo(now, 2)} archived:false stars:>=200`,
    `topic:artificial-intelligence ${pushedRecently}`,
    `topic:developer-tools ${pushedRecently}`,
    `topic:web ${pushedRecently}`,
    `topic:data-science ${pushedRecently}`,
    `topic:security ${pushedRecently}`,
    `topic:mobile ${pushedRecently}`
  ]
}

export async function discoverRepositories(
  client: GithubClient,
  now: Date,
  onProgress?: (completed: number, total: number) => void
): Promise<GithubRepository[]> {
  const queries = discoveryQueries(now)
  const repositories = new Map<number, GithubRepository>()

  for (const [index, query] of queries.entries()) {
    const results = await client.searchRepositories(query)
    results.forEach((repository) => repositories.set(repository.id, repository))
    onProgress?.(index + 1, queries.length)
  }

  return [...repositories.values()]
}
