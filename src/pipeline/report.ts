import { categoryLabels, type RankingDocument } from '../domain/repository'

export function buildMarkdownReport(document: RankingDocument): string {
  const status = document.status === 'warmup'
    ? '暖機中：首日使用年齡校正速度，下一次快照後使用真實 24 小時增量。'
    : '已使用真實每日快照計算增長。'
  const rows = document.repositories.slice(0, 20).map((repository) => {
    const growth = repository.signals.stars24h === null
      ? `${repository.signals.starsPerDay.toFixed(1)} stars/day 基線`
      : `+${repository.signals.stars24h} stars/24h`
    const categories = repository.categories.map((category) => categoryLabels[category]).join('、')
    return `| ${repository.rank} | [${repository.fullName}](${repository.url}) | ${repository.score.toFixed(1)} | ${growth} | ${categories} |`
  })

  return [
    `# GitHub 日研榜 ${document.dataDate}`,
    '',
    status,
    '',
    `候選池：${document.stats.candidateCount} 個 repo。資料來源：GitHub 公開 API。`,
    '',
    '| 排名 | Repository | 分數 | 動能 | 分類 |',
    '| ---: | --- | ---: | --- | --- |',
    ...rows,
    '',
    '## 今日研究',
    '',
    ...document.repositories.slice(0, 10).flatMap((repository) => [
      `### ${repository.rank}. [${repository.fullName}](${repository.url})`,
      '',
      repository.research.summary,
      '',
      `**為何上榜：** ${repository.research.whyNow}`,
      '',
      `**適合：** ${repository.research.bestFor}`,
      '',
      `**注意：** ${repository.research.cautions.join(' ')}`,
      ''
    ]),
    '## 方法',
    '',
    '排名不由 AI 決定。分數綜合 star 動能、相對增長、七日加速度、fork 動能、開發活躍度與項目新鮮度。',
    ''
  ].join('\n')
}
