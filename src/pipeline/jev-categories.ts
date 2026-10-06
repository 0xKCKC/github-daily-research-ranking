import { choice, TypeSafeClient, APIError } from '@typesafe-ai/sdk'
import { buildResearch } from '../domain/research'
import { repositoryCategories, type RankedRepository, type RepositoryCategory } from '../domain/repository'

// Optional category judgments from TypeSafe's Jev model. Jev returns a typed choice with
// probabilities instead of generated text, so there is nothing to parse or sanitize.
// Without TYPESAFE_API_KEY, or on any failure, the rule-based categories stay.
// Categories never change scores or ranks.

const CONCURRENCY = 5
/** A second category is shown when Jev gives it at least this probability. */
const SECONDARY_MIN_PROBABILITY = 0.25

const categoryCriteria: Record<RepositoryCategory, string> = {
  ai: 'AI models, LLM applications, AI agents, skills or plugins for AI coding assistants, machine learning research and tooling',
  devtools: 'Tools for programmers: command-line tools, editors, testing, build tools, libraries and SDKs that fit no more specific category',
  web: 'Websites, web apps, frontend frameworks, UI component libraries, browser extensions, web servers',
  data: 'Databases, data pipelines, analytics, scraping, search, data visualization',
  infra: 'Cloud, DevOps, self-hosting, servers, networking, proxies and VPNs, containers, deployment, monitoring',
  security: 'Security, privacy, vulnerabilities and exploits, malware analysis, OSINT, authentication',
  mobile: 'Apps or tools for iOS and Android phones and tablets, or for building them',
  desktop: 'Desktop apps and system utilities for macOS, Windows or Linux; operating systems, drivers, hardware and embedded devices',
  creative: 'Creating or editing images, photos, video, audio, music, 3D, design or documents',
  games: 'Games, game mods, emulators, game engines, and graphics or performance tools for games',
  learning: 'Guides, tutorials, courses, books, awesome lists and other curated reading or learning material',
  other: 'None of the above, or the description is too vague to tell what the project does'
}

const categoryQuestion = choice(
  {
    task: 'Which category best describes what `repository` is?',
    rules: [
      'Judge by what the project does and who uses it, not by its programming language.',
      'Platforms it merely supports do not decide the category; a model that also runs on phones is still AI.',
      'Choose ai when AI is the main point of the project, such as a model, an agent, or a skill for an AI coding assistant.'
    ]
  },
  categoryCriteria
)

interface JevClient {
  systemOne: TypeSafeClient['systemOne']
}

interface JevOptions {
  apiKey?: string
  client?: JevClient
  log?: (message: string) => void
}

export interface JevJudgment {
  categories: RepositoryCategory[]
  confidence: number
}

export function categoriesFromProbabilities(
  selected: string,
  probabilities: Record<string, number>
): RepositoryCategory[] | null {
  if (!repositoryCategories.includes(selected as RepositoryCategory)) return null
  const primary = selected as RepositoryCategory
  const secondary = Object.entries(probabilities)
    .filter(([label, probability]) =>
      label !== primary && label !== 'other' && probability >= SECONDARY_MIN_PROBABILITY &&
      repositoryCategories.includes(label as RepositoryCategory))
    .sort((left, right) => right[1] - left[1])[0]
  return secondary && primary !== 'other' ? [primary, secondary[0] as RepositoryCategory] : [primary]
}

async function judge(client: JevClient, repository: RankedRepository): Promise<JevJudgment | null> {
  const { answers } = await client.systemOne({
    state: {
      repository: {
        name: repository.fullName,
        description: repository.description.slice(0, 500),
        language: repository.language,
        topics: repository.topics.slice(0, 15)
      }
    },
    questions: { category: categoryQuestion }
  })
  const answer = answers.category
  const categories = categoriesFromProbabilities(answer.choice, answer.probabilities)
  return categories ? { categories, confidence: answer.confidence } : null
}

function isFatal(error: unknown): boolean {
  return error instanceof APIError && [400, 401, 403, 404, 422].includes(error.status)
}

export async function categorizeWithJev(
  repositories: RankedRepository[],
  options: JevOptions = {}
): Promise<RankedRepository[]> {
  const log = options.log ?? (() => undefined)
  if (!options.client && !options.apiKey) {
    log('Jev categories skipped: no TYPESAFE_API_KEY.')
    return repositories
  }
  const client = options.client ?? new TypeSafeClient({ apiKey: options.apiKey, timeout: 15_000, logLevel: 'off' })

  // With neither a description nor topics Jev would only be guessing from the name.
  const pending = repositories.filter((repository) => repository.description.trim() || repository.topics.length > 0)
  const judgments = new Map<number, JevJudgment>()
  let failures = 0
  let stopped = false

  const worker = async () => {
    while (!stopped) {
      const repository = pending.shift()
      if (!repository) return
      try {
        const judgment = await judge(client, repository)
        if (judgment) judgments.set(repository.id, judgment)
      } catch (error) {
        failures += 1
        const message = error instanceof Error ? error.message : String(error)
        if (failures <= 3) log(`Jev failed for ${repository.fullName}: ${message}`)
        if (isFatal(error)) {
          stopped = true
          log('Jev categories stopped: the API rejected the request or the key.')
        }
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  let agreed = 0
  const result = repositories.map((repository) => {
    const judgment = judgments.get(repository.id)
    if (!judgment) return repository
    if (judgment.categories[0] === repository.categories[0]) agreed += 1
    return {
      ...repository,
      categories: judgment.categories,
      research: {
        ...buildResearch(repository, repository.signals, judgment.categories),
        categorySource: 'jev' as const
      }
    }
  })
  log(`Jev categorized ${judgments.size}/${repositories.length} repositories (${failures} failed); ` +
    `primary category matched the rules for ${agreed}/${judgments.size}.`)
  return result
}
