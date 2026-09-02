export function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(maximum, Math.max(minimum, value))
}

export function percentileRanks(values: number[]): number[] {
  if (values.length <= 1) return values.map(() => 1)

  const indexed = values
    .map((value, index) => ({ value, index }))
    .sort((left, right) => left.value - right.value)
  const results = Array.from<number>({ length: values.length }).fill(0)

  indexed.forEach((entry, position) => {
    results[entry.index] = position / (values.length - 1)
  })

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
