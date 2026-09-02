import type { GithubRepository, RepositoryCategory } from './repository'

const categoryTerms: Record<Exclude<RepositoryCategory, 'other'>, string[]> = {
  ai: [
    'ai',
    'artificial-intelligence',
    'machine-learning',
    'deep-learning',
    'llm',
    'large-language-model',
    'generative-ai',
    'agents',
    'rag'
  ],
  devtools: [
    'developer-tools',
    'cli',
    'terminal',
    'compiler',
    'runtime',
    'ide',
    'editor',
    'devops',
    'testing'
  ],
  web: [
    'web',
    'frontend',
    'backend',
    'react',
    'vue',
    'svelte',
    'nextjs',
    'css',
    'javascript',
    'typescript'
  ],
  data: [
    'data',
    'database',
    'analytics',
    'data-science',
    'etl',
    'sql',
    'visualization'
  ],
  security: [
    'security',
    'cybersecurity',
    'privacy',
    'vulnerability',
    'pentesting',
    'infosec'
  ],
  mobile: [
    'mobile',
    'android',
    'ios',
    'swift',
    'kotlin',
    'flutter',
    'react-native'
  ]
}

function normalizedHaystack(repository: GithubRepository): string[] {
  return [
    repository.name,
    repository.description,
    repository.language ?? '',
    ...repository.topics
  ].map((value) => value.toLowerCase())
}

export function categorizeRepository(repository: GithubRepository): RepositoryCategory[] {
  const haystack = normalizedHaystack(repository)
  const categories = Object.entries(categoryTerms)
    .filter(([, terms]) => terms.some((term) => haystack.some((value) => matchesTerm(value, term))))
    .map(([category]) => category as RepositoryCategory)

  return categories.length > 0 ? categories : ['other']
}

function matchesTerm(value: string, term: string): boolean {
  if (term.length > 2) return value.includes(term)
  return value
    .split(/[^a-z0-9+#.-]+/)
    .filter(Boolean)
    .includes(term)
}
