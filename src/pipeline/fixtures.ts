import type { GithubRepository } from '../domain/repository'

interface FixtureOptions {
  id: number
  fullName: string
  description: string
  language: string
  topics: string[]
  stars: number
  forks: number
  ageDays: number
  pushedHoursAgo: number
  license?: string | null
}

function fixture(options: FixtureOptions, now: Date): GithubRepository {
  const [owner, name] = options.fullName.split('/')
  return {
    id: options.id,
    nodeId: `fixture-${options.id}`,
    name,
    fullName: options.fullName,
    owner,
    ownerAvatarUrl: `https://github.com/${owner}.png`,
    url: `https://github.com/${options.fullName}`,
    description: options.description,
    language: options.language,
    topics: options.topics,
    stars: options.stars,
    forks: options.forks,
    openIssues: Math.max(3, Math.round(options.forks * 0.12)),
    createdAt: new Date(now.getTime() - options.ageDays * 86_400_000).toISOString(),
    updatedAt: new Date(now.getTime() - options.pushedHoursAgo * 3_600_000).toISOString(),
    pushedAt: new Date(now.getTime() - options.pushedHoursAgo * 3_600_000).toISOString(),
    license: options.license === undefined ? 'MIT' : options.license,
    archived: false,
    fork: false
  }
}

export function fixtureRepositories(now: Date): GithubRepository[] {
  return [
    fixture({ id: 1, fullName: 'ollama/ollama', description: 'Get up and running with large language models.', language: 'Go', topics: ['llm', 'ai'], stars: 152_430, forks: 12_640, ageDays: 1_170, pushedHoursAgo: 2 }, now),
    fixture({ id: 2, fullName: 'astral-sh/uv', description: 'An extremely fast Python package and project manager.', language: 'Rust', topics: ['python', 'developer-tools'], stars: 78_320, forks: 2_410, ageDays: 920, pushedHoursAgo: 1 }, now),
    fixture({ id: 3, fullName: 'zed-industries/zed', description: 'A high-performance, multiplayer code editor.', language: 'Rust', topics: ['editor', 'developer-tools'], stars: 72_810, forks: 5_520, ageDays: 1_450, pushedHoursAgo: 3 }, now),
    fixture({ id: 4, fullName: 'shadcn-ui/ui', description: 'A set of beautifully designed components you can customize.', language: 'TypeScript', topics: ['react', 'web', 'components'], stars: 101_760, forks: 6_880, ageDays: 1_320, pushedHoursAgo: 5 }, now),
    fixture({ id: 5, fullName: 'open-webui/open-webui', description: 'A user-friendly AI interface supporting multiple model runners.', language: 'Svelte', topics: ['ai', 'llm', 'web'], stars: 112_670, forks: 15_210, ageDays: 1_060, pushedHoursAgo: 2 }, now),
    fixture({ id: 6, fullName: 'microsoft/terminal', description: 'The new Windows Terminal and its original console host.', language: 'C++', topics: ['terminal', 'developer-tools'], stars: 101_230, forks: 8_960, ageDays: 2_680, pushedHoursAgo: 8 }, now),
    fixture({ id: 7, fullName: 'fastapi/fastapi', description: 'A modern, fast web framework for building APIs with Python.', language: 'Python', topics: ['web', 'api', 'python'], stars: 89_540, forks: 7_540, ageDays: 2_820, pushedHoursAgo: 7 }, now),
    fixture({ id: 8, fullName: 'duckdb/duckdb', description: 'An analytical in-process SQL database management system.', language: 'C++', topics: ['database', 'analytics', 'data'], stars: 31_920, forks: 2_610, ageDays: 2_610, pushedHoursAgo: 1 }, now),
    fixture({ id: 9, fullName: 'aquasecurity/trivy', description: 'Find vulnerabilities and misconfigurations in code and cloud.', language: 'Go', topics: ['security', 'vulnerability'], stars: 29_870, forks: 2_930, ageDays: 2_540, pushedHoursAgo: 4 }, now),
    fixture({ id: 10, fullName: 'flutter/flutter', description: 'Build applications for mobile, web and desktop from one codebase.', language: 'Dart', topics: ['mobile', 'android', 'ios'], stars: 173_250, forks: 29_140, ageDays: 3_930, pushedHoursAgo: 2 }, now),
    fixture({ id: 11, fullName: 'sample-labs/young-tool', description: 'Fixture-only example of a newly rising developer tool.', language: 'TypeScript', topics: ['developer-tools', 'cli'], stars: 4_280, forks: 140, ageDays: 12, pushedHoursAgo: 1, license: null }, now),
    fixture({ id: 12, fullName: 'sample-labs/local-agent', description: 'Fixture-only example of a local-first coding agent.', language: 'Rust', topics: ['ai', 'agents'], stars: 7_930, forks: 310, ageDays: 21, pushedHoursAgo: 2 }, now)
  ]
}
