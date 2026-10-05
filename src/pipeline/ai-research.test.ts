import { describe, expect, it, vi } from 'vitest'
import type { RankedRepository } from '../domain/repository'
import { enrichResearchWithAi, parseAiResearch } from './ai-research'

function ranked(id: number): RankedRepository {
  return {
    id,
    nodeId: `node-${id}`,
    name: `repo-${id}`,
    fullName: `owner/repo-${id}`,
    owner: 'owner',
    ownerAvatarUrl: '',
    url: '',
    description: 'A fast CLI',
    language: 'Go',
    topics: ['cli'],
    stars: 100,
    forks: 10,
    openIssues: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    pushedAt: '2026-09-01T00:00:00Z',
    license: 'MIT',
    archived: false,
    fork: false,
    rank: id,
    previousRank: null,
    rankChange: null,
    score: 50,
    categories: ['other'],
    signals: {
      stars24h: 5,
      forks24h: 1,
      relativeGrowth: 0.4,
      acceleration7d: null,
      ageDays: 200,
      hoursSincePush: 10,
      starsPerDay: 0.5
    },
    scoreBreakdown: {
      starMomentum: 10,
      relativeGrowth: 10,
      acceleration: 0,
      forkMomentum: 5,
      developmentActivity: 15,
      freshness: 10
    },
    research: {
      summary: 'template summary',
      whyNow: 'template why',
      bestFor: 'template best for',
      evidence: [],
      cautions: []
    }
  }
}

function modelResponse(content: string) {
  return new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 })
}

describe('parseAiResearch', () => {
  it('keeps only valid items for expected repositories', () => {
    const content = JSON.stringify({
      repositories: [
        { id: 1, summary: '<b>快速</b> 命令列工具', bestFor: '終端用戶', categories: ['devtools', 'hacking'] },
        { id: 2, summary: '', bestFor: '任何人', categories: ['web'] },
        { id: 99, summary: '不應出現', bestFor: '不應出現', categories: ['ai'] }
      ]
    })

    const result = parseAiResearch(content, new Set([1, 2]))

    expect([...result.keys()]).toEqual([1])
    expect(result.get(1)).toEqual({ id: 1, summary: '快速 命令列工具', bestFor: '終端用戶', categories: ['devtools'] })
  })

  it('returns nothing for malformed output', () => {
    expect(parseAiResearch('not json', new Set([1])).size).toBe(0)
  })
})

describe('enrichResearchWithAi', () => {
  it('replaces summary, audience and categories but never scores', async () => {
    const fetchImpl = vi.fn(async () => modelResponse(JSON.stringify({
      repositories: [{ id: 1, summary: '一個快速的命令列工具', bestFor: '常用終端的開發者', categories: ['devtools'] }]
    })))

    const [result] = await enrichResearchWithAi([ranked(1)], { token: 'token', fetchImpl })

    expect(result.research.summary).toBe('一個快速的命令列工具')
    expect(result.research.bestFor).toBe('常用終端的開發者')
    expect(result.research.whyNow).toBe('template why')
    expect(result.research.source).toBe('github-models')
    expect(result.categories).toEqual(['devtools'])
    expect(result.score).toBe(50)
    expect(result.rank).toBe(1)
  })

  it('keeps template research when the API fails or no token is available', async () => {
    const fetchImpl = vi.fn(async () => new Response('rate limited', { status: 429 }))
    const repositories = Array.from({ length: 25 }, (_, index) => ranked(index + 1))

    const failed = await enrichResearchWithAi(repositories, { token: 'token', fetchImpl })
    const skipped = await enrichResearchWithAi(repositories, {})

    expect(failed).toEqual(repositories)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    expect(skipped).toEqual(repositories)
  })
})
