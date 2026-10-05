import { describe, expect, it } from 'vitest'
import { percentileRanks } from './numbers'

describe('percentileRanks', () => {
  it('spreads distinct values from 0 to 1', () => {
    expect(percentileRanks([30, 10, 20])).toEqual([1, 0, 0.5])
  })

  it('gives tied values the same percentile', () => {
    expect(percentileRanks([0, 5, 0, 0, 9])).toEqual([0.25, 0.75, 0.25, 0.25, 1])
  })

  it('handles a single value', () => {
    expect(percentileRanks([7])).toEqual([1])
  })
})
