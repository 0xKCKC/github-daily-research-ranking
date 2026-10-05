export function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(maximum, Math.max(minimum, value))
}

export function percentileRanks(values: number[]): number[] {
  if (values.length <= 1) return values.map(() => 1)

  const indexed = values
    .map((value, index) => ({ value, index }))
    .sort((left, right) => left.value - right.value)
  const results = Array.from<number>({ length: values.length }).fill(0)

  // Tied values share their average position so input order cannot change a score.
  let start = 0
  while (start < indexed.length) {
    let end = start
    while (end + 1 < indexed.length && indexed[end + 1].value === indexed[start].value) end += 1
    const percentile = (start + end) / 2 / (values.length - 1)
    for (let position = start; position <= end; position += 1) {
      results[indexed[position].index] = percentile
    }
    start = end + 1
  }

  return results
}

export function daysBetween(from: string, to: string): number {
  const difference = new Date(to).getTime() - new Date(from).getTime()
  return Math.max(difference / 86_400_000, 0)
}

export function hoursBetween(from: string, to: string): number {
  const difference = new Date(to).getTime() - new Date(from).getTime()
  return Math.max(difference / 3_600_000, 0)
}
