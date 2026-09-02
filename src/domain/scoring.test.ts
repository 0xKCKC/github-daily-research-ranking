import { describe, expect, it } from 'vitest'
import { scoreRepositories } from './scoring'
import type { GithubRepository, RepositorySnapshot } from './repository'

function repository(overrides: Partial<GithubRepository> & Pick<GithubRepository, 'id' | 'fullName'>): GithubRepository {
  const { id, fullName, ...rest } = overrides
  const [owner, name] = fullName.split('/')
  return {
    id,
    nodeId: `node-${id}`,
    name,
    fullName,
    owner,
    ownerAvatarUrl: '',
    url: `https://github.com/${overrides.fullName}`,
    description: 'A test repository',
    language: 'TypeScript',
    topics: [],
    stars: 100,
    forks: 10,
    openIssues: 2,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-02T00:00:00Z',
    pushedAt: '2026-09-02T00:00:00Z',
    license: 'MIT',
    archived: false,
    fork: false,
    ...rest
  }
}

describe('scoreRepositories', () => {
  it('uses daily growth once a baseline exists', () => {
    const repositories = [
      repository({ id: 1, fullName: 'fast/rising', stars: 160 }),
      repository({ id: 2, fullName: 'large/steady', stars: 10_010 })
    ]
    const history: RepositorySnapshot[] = [{
      capturedAt: '2026-09-01T00:00:00Z',
      repositories: [
        { id: 1, fullName: 'fast/rising', stars: 100, forks: 5, openIssues: 2, pushedAt: '2026-09-01T00:00:00Z' },
        { id: 2, fullName: 'large/steady', stars: 10_000, forks: 500, openIssues: 20, pushedAt: '2026-09-01T00:00:00Z' }
      ]
    }]

    const result = scoreRepositories(repositories, {
      now: '2026-09-02T00:00:00Z',
      history
    })

    expect(result[0].fullName).toBe('fast/rising')
    expect(result[0].signals.stars24h).toBe(60)
    expect(result[1].signals.stars24h).toBe(10)
  })

  it('excludes archived repositories and forks', () => {
    const result = scoreRepositories([
      repository({ id: 1, fullName: 'active/repo' }),
      repository({ id: 2, fullName: 'old/repo', archived: true }),
      repository({ id: 3, fullName: 'copy/repo', fork: true })
    ], { now: '2026-09-02T00:00:00Z' })

    expect(result.map(({ fullName }) => fullName)).toEqual(['active/repo'])
  })

  it('reports rank movement from the prior ranking', () => {
    const previousRanking = scoreRepositories([
      repository({ id: 1, fullName: 'one/repo', stars: 500 }),
      repository({ id: 2, fullName: 'two/repo', stars: 100 })
    ], { now: '2026-09-01T00:00:00Z' })
    const result = scoreRepositories([
      repository({ id: 1, fullName: 'one/repo', stars: 500 }),
      repository({ id: 2, fullName: 'two/repo', stars: 800, createdAt: '2026-08-30T00:00:00Z' })
    ], {
      now: '2026-09-02T00:00:00Z',
      previousRanking
    })

    expect(result.find(({ id }) => id === 2)?.rankChange).toBe(1)
  })
})
