import { describe, expect, it } from 'vitest'
import { normalizeGithubText } from './github-client'

describe('normalizeGithubText', () => {
  it('normalizes long dashes and repeated whitespace from external copy', () => {
    expect(normalizeGithubText('Fast — local\n tool – ready')).toBe('Fast - local tool - ready')
  })
})
