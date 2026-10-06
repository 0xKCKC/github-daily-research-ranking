import { describe, expect, it } from 'vitest'
import type { GithubRepository } from './repository'
import { categorizeRepository } from './categories'

function repository(description: string, topics: string[] = [], overrides: Partial<GithubRepository> = {}): GithubRepository {
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
    fork: false,
    ...overrides
  }
}

describe('categorizeRepository', () => {
  it('matches AI as a complete short term', () => {
    expect(categorizeRepository(repository('A local AI assistant'))).toContain('ai')
  })

  it('does not mistake a substring for AI', () => {
    expect(categorizeRepository(repository('A utility for repository maintainers'))).not.toContain('ai')
  })

  it('does not treat every Swift project as a phone app', () => {
    const result = categorizeRepository(repository('A native Mac app that lives in the menu bar', [], { language: 'Swift' }))
    expect(result).toEqual(['desktop'])
  })

  it('reads iOS and macOS in descriptions as whole words', () => {
    expect(categorizeRepository(repository('Run iOS apps on your Mac'))).toContain('mobile')
  })

  it('matches whole words only', () => {
    const result = categorizeRepository(repository('A video player with access control for clients'))
    expect(result).not.toContain('devtools')
    expect(result).not.toContain('web')
  })

  it('recognizes games, creative tools and learning resources', () => {
    expect(categorizeRepository(repository('Experimental port for PS5', ['game-modding']))[0]).toBe('games')
    expect(categorizeRepository(repository('A clean-room reimplementation of Photoshop', ['image-editing']))[0]).toBe('creative')
    expect(categorizeRepository(repository('高性价比人生指南：每条写明成本'))[0]).toBe('learning')
  })

  it('recognizes versioned model names', () => {
    expect(categorizeRepository(repository('Fine-tunes of Qwen3.5 and Gemma 4 for classification'))).toContain('ai')
  })

  it('returns at most two categories, strongest first', () => {
    const result = categorizeRepository(repository('An AI agent CLI for your terminal', ['ai-agents', 'llm', 'cli', 'react', 'docker']))
    expect(result.length).toBeLessThanOrEqual(2)
    expect(result[0]).toBe('ai')
  })

  it('falls back to other without evidence', () => {
    expect(categorizeRepository(repository(''))).toEqual(['other'])
  })
})
