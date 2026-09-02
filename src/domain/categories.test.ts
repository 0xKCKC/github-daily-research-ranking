import { describe, expect, it } from 'vitest'
import type { GithubRepository } from './repository'
import { categorizeRepository } from './categories'

function repository(description: string, topics: string[] = []): GithubRepository {
  return {
    id: 1,
    nodeId: 'node-1',
    name: 'tool',
    fullName: 'owner/tool',
    owner: 'owner',
    ownerAvatarUrl: '',
    url: 'https://github.com/owner/tool',
    description,
    language: 'Go',
    topics,
    stars: 10,
    forks: 1,
    openIssues: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-02T00:00:00Z',
    pushedAt: '2026-09-02T00:00:00Z',
    license: 'MIT',
    archived: false,
    fork: false
  }
}

describe('categorizeRepository', () => {
  it('matches AI as a complete short term', () => {
    expect(categorizeRepository(repository('A local AI assistant'))).toContain('ai')
  })

  it('does not mistake a substring for AI', () => {
    expect(categorizeRepository(repository('A utility for repository maintainers'))).not.toContain('ai')
  })
})
