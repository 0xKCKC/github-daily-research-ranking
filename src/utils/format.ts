export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('zh-HK', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(value)
}

export function formatInteger(value: number): string {
  return new Intl.NumberFormat('zh-HK').format(value)
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('zh-HK', {
    timeZone: 'Asia/Hong_Kong',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value))
}

export function formatAge(days: number): string {
  if (days < 2) return '今天建立'
  if (days < 30) return `${Math.round(days)} 日前建立`
  if (days < 365) return `${Math.round(days / 30)} 個月前建立`
  return `${(days / 365).toFixed(1)} 年前建立`
}
