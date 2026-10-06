import type { GithubRepository, RepositoryCategory } from './repository'

// Each category lists weighted evidence. Topics are chosen by the author, so they count most;
// name and description words count less; the primary language only nudges.
// Terms match whole words (hyphens and spaces are equivalent), never substrings,
// so "ide" cannot match "video" and "ai" cannot match "repository".
interface CategoryRule {
  terms: string[]
  /** Words too ambiguous in prose; they only count when the author used them as a topic. */
  topicTerms?: string[]
  /** Substrings for CJK descriptions, which have no word boundaries. */
  cjk?: string[]
  /** Patterns on the normalized text, e.g. versioned model names such as "qwen3 5". */
  patterns?: RegExp[]
  languages?: string[]
}

const TOPIC_WEIGHT = 3
const TEXT_WEIGHT = 2
const LANGUAGE_WEIGHT = 1
const MIN_SCORE = 2
const MAX_CATEGORIES = 2

export const categoryRules: Record<Exclude<RepositoryCategory, 'other'>, CategoryRule> = {
  ai: {
    terms: [
      'ai', 'artificial intelligence', 'machine learning', 'deep learning', 'ml', 'llm', 'llms',
      'large language model', 'large language models', 'generative ai', 'genai', 'gpt', 'chatgpt', 'openai',
      'anthropic', 'claude', 'claude code', 'codex', 'gemini', 'gemini cli', 'deepseek', 'qwen', 'kimi', 'llama',
      'llama cpp', 'ollama', 'mistral', 'agents', 'ai agent', 'ai agents', 'agentic', 'agent skill', 'agent skills',
      'claude skills', 'mcp', 'mcp server', 'model context protocol', 'rag', 'embeddings', 'transformer',
      'transformers', 'stable diffusion', 'llm inference', 'fine tuning', 'prompt engineering', 'copilot',
      'vibe coding', 'chatbot', 'nlp', 'computer vision', 'huggingface', 'pytorch', 'tensorflow', 'neural network',
      'speech recognition', 'tts', 'text to speech',
      'open model', 'open models', 'multimodal', 'multimodal model', 'fine tunes', 'agi', 'model evaluation', 'web agent', 'agent harness', 'agent harnesses', 'grok', 'gemma', 'jev', 'pretraining', 'robot policy', 'world model'
    ],
    topicTerms: [
      'prompt', 'prompts', 'agent', 'inference', 'moe', 'diffusion'
    ],
    patterns: [/\b(qwen|gemma|llama|gpt|claude|opus|sonnet|haiku|fable|deepseek|kimi|glm|mistral|phi)\s?\d/],
    cjk: ['人工智能', '人工智慧', '大模型', '大語言模型', '大语言模型', '智能體', '智能体', '模型', '提示詞', '提示词']
  },
  devtools: {
    terms: [
      'developer tools', 'developer tool', 'devtools', 'cli', 'command line', 'terminal', 'tui', 'compiler', 'ide',
      'code editor', 'vscode', 'vscode extension', 'neovim', 'vim', 'emacs', 'testing', 'end to end testing',
      'test framework', 'unit testing', 'debugger', 'debugging', 'linter', 'formatter', 'build tool',
      'package manager', 'github', 'github actions', 'code review', 'coding agent', 'programming language',
      'code generation', 'monorepo', 'profiler'
    ],
    topicTerms: [
      'library', 'framework', 'api', 'git', 'shell', 'runtime', 'parser', 'sdk', 'e2e'
    ],
    cjk: ['開發者', '开发者', '命令行', '命令列', '編程', '编程', '程式碼', '代码']
  },
  web: {
    terms: [
      'website', 'web app', 'webapp', 'frontend', 'front end', 'react', 'nextjs', 'next js', 'vue', 'nuxt',
      'svelte', 'sveltekit', 'angular', 'astro', 'css', 'tailwind', 'tailwindcss', 'ui components',
      'component library', 'shadcn', 'browser extension', 'chrome extension', 'pwa', 'web server', 'rest api',
      'graphql', 'nodejs', 'deno', 'websocket', 'static site', 'cms', 'wordpress'
    ],
    topicTerms: [
      'web', 'http', 'bun', 'html', 'browser'
    ],
    cjk: ['網站', '网站', '網頁', '网页', '前端', '瀏覽器', '浏览器'],
    languages: ['HTML', 'CSS', 'Vue', 'Svelte', 'Astro']
  },
  data: {
    terms: [
      'database', 'databases', 'graph database', 'vector database', 'sql', 'postgres', 'postgresql', 'mysql',
      'sqlite', 'redis', 'mongodb', 'clickhouse', 'duckdb', 'data science', 'data engineering', 'data pipeline',
      'etl', 'big data', 'data visualization', 'spreadsheet', 'dataset', 'datasets', 'time series', 'search engine',
      'scraper', 'scraping', 'web scraping', 'crawler', 'knowledge graph', 'pandas'
    ],
    topicTerms: [
      'analytics', 'dashboard', 'visualization'
    ],
    cjk: ['數據庫', '数据库', '資料庫', '數據分析', '数据分析', '爬蟲', '爬虫', '數據集', '数据集']
  },
  infra: {
    terms: [
      'devops', 'infrastructure', 'cloud native', 'kubernetes', 'k8s', 'docker', 'docker compose', 'serverless',
      'self hosted', 'selfhosted', 'homelab', 'reverse proxy', 'load balancer', 'api gateway', 'vpn', 'dns',
      'observability', 'ci cd', 'cicd', 'terraform', 'ansible', 'nginx', 'caddy', 'distributed systems',
      'message queue',
      'cloudflare', 'cloudflare warp', 'warp', 'clash', 'mihomo', 'virtual machine', 'qemu'
    ],
    topicTerms: [
      'server', 'proxy', 'gateway', 'container', 'containers', 'storage', 'backup', 'logging', 'monitoring',
      'deployment', 'cloud', 'networking'
    ],
    cjk: ['伺服器', '服务器', '自託管', '自托管', '部署', '雲端', '云端', '網關', '网关']
  },
  security: {
    terms: [
      'security', 'cybersecurity', 'infosec', 'vulnerability', 'vulnerabilities', 'pentest', 'pentesting',
      'penetration testing', 'red team', 'blue team', 'malware', 'reverse engineering', 'exploit', 'cve', 'ctf',
      'cryptography', 'password manager', 'firewall', 'osint', 'forensics',
      'fingerprinting', 'anti detect', 'spoofing', 'spoofed'
    ],
    topicTerms: [
      'sandbox', 'secrets', 'jailbreak', 'privacy', 'authentication', 'encryption'
    ],
    cjk: ['安全', '私隱', '隐私', '加密', '漏洞', '逆向']
  },
  mobile: {
    terms: [
      'mobile app', 'android', 'android app', 'ios', 'ios app', 'iphone', 'ipad', 'flutter', 'react native',
      'jetpack compose', 'swiftui', 'carplay', 'android auto', 'wearos', 'watchos'
    ],
    topicTerms: [
      'mobile', 'expo', 'apk'
    ],
    cjk: ['手機', '手机', '安卓', '移動端', '移动端'],
    languages: ['Kotlin', 'Dart']
  },
  desktop: {
    terms: [
      'desktop', 'desktop app', 'macos', 'mac app', 'menubar', 'menu bar', 'notch', 'windows 11', 'linux desktop',
      'gnome', 'kde', 'wayland', 'x11', 'electron', 'tauri', 'operating system', 'input method', 'ime',
      'window manager', 'debloat', 'file manager', 'apple silicon', 'raspberry pi', 'firmware', 'iot', 'arduino',
      'esp32',
      'omarchy', 'hyprland', 'disk cleanup', 'treemap'
    ],
    topicTerms: [
      'mac', 'windows', 'linux', 'os', 'kernel', 'driver', 'drivers', 'keyboard', 'utility', 'utilities',
      'productivity', 'launcher', 'hardware', 'embedded'
    ],
    cjk: ['桌面', '輸入法', '输入法', '系統工具', '系统工具', '硬件', '硬體']
  },
  creative: {
    terms: [
      'image editing', 'image editor', 'photo editor', 'photography', 'photoshop', 'lightroom', 'illustrator',
      'premiere', 'video editing', 'video editor', 'ai video', 'music player', 'podcast', 'graphic design',
      'ui design', 'figma', 'vector graphics', 'blender', 'media player', 'ebook', 'comics',
      'image generation', 'video generation', 'music video', 'lyrics', 'image and video generation'
    ],
    topicTerms: [
      'image', 'images', 'photo', 'photos', 'raw', 'video', 'audio', 'music', 'sound', 'animation', 'design', 'art',
      'drawing', 'svg', 'font', 'fonts', 'icons', 'media', 'streaming', 'film', 'camera', 'pdf', 'rendering',
      'diagram', 'diagrams', '3d'
    ],
    cjk: ['圖片', '图片', '影片', '视频', '視頻', '音樂', '音乐', '設計', '设计', '繪圖', '绘图', '動畫', '动画', '剪輯', '剪辑', '歌詞', '歌词']
  },
  games: {
    terms: [
      'game', 'games', 'gaming', 'pc gaming', 'game engine', 'gamedev', 'game development', 'game modding',
      'modding', 'minecraft', 'minecraft mod', 'steamos', 'steam deck', 'emulator', 'unreal', 'unreal engine',
      'godot', 'bevy', 'roguelike', 'tower defense', 'auto chess', 'fan game', 'directx', 'directx12', 'vulkan',
      'nintendo', 'pc port',
      'dlss', 'dlssg', 'frame generation', 'ps5', 'ps4', 'bloodborne'
    ],
    topicTerms: [
      'mod', 'mods', 'switch', 'port', 'retro', 'steam', 'unity', 'shader', 'shaders', 'emulation', 'decompilation',
      'speedrun', 'xbox', 'playstation'
    ],
    cjk: ['遊戲', '游戏', '同人', '自走棋', '塔防', '模組', '模组']
  },
  learning: {
    terms: [
      'awesome', 'awesome list', 'tutorial', 'tutorials', 'handbook', 'cheatsheet', 'cheat sheet', 'knowledge base',
      'language learning', 'english learning',
      'weekly', 'newsletter', 'textbook'
    ],
    topicTerms: [
      'list', 'learning', 'learn', 'guide', 'guides', 'book', 'books', 'notes', 'resources', 'examples',
      'collection', 'curated', 'documentation', 'interview', 'education', 'course', 'courses', 'roadmap'
    ],
    cjk: ['指南', '教程', '學習', '学习', '課程', '课程', '筆記', '笔记', '手冊', '手册', '全書', '全书', '面試', '面试', '合集', '資源', '资源', '教材', '數學', '数学', '周刊', '週刊']
  }
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#぀-ヿ㐀-鿿]+/g, ' ')
    .trim()
}

function containsTerm(text: string, term: string): boolean {
  return ` ${text} `.includes(` ${normalize(term)} `)
}

export function categoryScores(repository: GithubRepository): Map<Exclude<RepositoryCategory, 'other'>, number> {
  const topics = repository.topics.map(normalize)
  // Repository names are often camelCase ("RemoveMacAI"), so also read them split into words.
  // Descriptions are not split, or "iOS" and "macOS" would turn into "i os" and "mac os".
  const splitName = repository.name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
  const text = normalize(`${repository.name} ${splitName} ${repository.description}`)
  const rawDescription = repository.description
  const scores = new Map<Exclude<RepositoryCategory, 'other'>, number>()

  for (const [category, rule] of Object.entries(categoryRules) as Array<[Exclude<RepositoryCategory, 'other'>, CategoryRule]>) {
    let score = 0
    const topicHits = [...rule.terms, ...(rule.topicTerms ?? [])]
      .filter((term) => topics.some((topic) => containsTerm(topic, term))).length
    const textHits = rule.terms.filter((term) => containsTerm(text, term)).length
      + (rule.cjk ?? []).filter((term) => rawDescription.includes(term)).length
      + (rule.patterns ?? []).filter((pattern) => pattern.test(text)).length
    score += Math.min(topicHits, 3) * TOPIC_WEIGHT
    score += Math.min(textHits, 3) * TEXT_WEIGHT
    if (repository.language && rule.languages?.includes(repository.language)) score += LANGUAGE_WEIGHT
    if (score > 0) scores.set(category, score)
  }
  return scores
}

export function categorizeRepository(repository: GithubRepository): RepositoryCategory[] {
  const ranked = [...categoryScores(repository)]
    .filter(([, score]) => score >= MIN_SCORE)
    .sort((left, right) => right[1] - left[1])
  if (ranked.length === 0) return ['other']

  // Keep a second category only when its evidence is comparable to the primary one.
  const [primary, secondary] = ranked
  const categories: RepositoryCategory[] = [primary[0]]
  if (secondary && secondary[1] >= primary[1] / 2 && categories.length < MAX_CATEGORIES) categories.push(secondary[0])
  return categories
}
