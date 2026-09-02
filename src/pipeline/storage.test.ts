import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import type { RankingDocument, RepositorySnapshot } from '../domain/repository'
import { saveDailyOutputs } from './storage'

const temporaryDirectories: string[] = []

function document(generatedAt: string): RankingDocument {
  return {
    schemaVersion: 1,
    generatedAt,
    dataDate: '2026-09-02',
    status: 'warmup',
    source: 'fixtures',
    methodologyVersion: '1.0.0',
    stats: { candidateCount: 0, rankedCount: 0, historyDays: 1 },
    repositories: []
  }
}

const snapshot: RepositorySnapshot = {
  capturedAt: '2026-09-02T00:00:00Z',
  repositories: []
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })))
})

describe('saveDailyOutputs', () => {
  it('replaces an existing same-day ranking safely', async () => {
    const root = await mkdtemp(join(tmpdir(), 'ranking-storage-'))
    temporaryDirectories.push(root)

    await saveDailyOutputs(root, document('2026-09-02T00:00:00Z'), snapshot, '# first')
    await saveDailyOutputs(root, document('2026-09-02T01:00:00Z'), snapshot, '# second')

    const current = JSON.parse(await readFile(join(root, 'public', 'data', 'current.json'), 'utf8')) as RankingDocument
    expect(current.generatedAt).toBe('2026-09-02T01:00:00Z')
  })
})
