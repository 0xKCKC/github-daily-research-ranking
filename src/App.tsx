import { useMemo, useState } from 'react'
import type { RepositoryCategory } from './domain/repository'
import { useRankingData } from './hooks/useRankingData'
import { FilterBar } from './components/FilterBar'
import { Header } from './components/Header'
import { HeroSummary } from './components/HeroSummary'
import { Methodology } from './components/Methodology'
import { Podium } from './components/Podium'
import { RankingList } from './components/RankingList'
import { PageState } from './components/PageState'

export function App() {
  const { data, loading, error } = useRankingData()
  const [category, setCategory] = useState<RepositoryCategory | 'all'>('all')
  const [query, setQuery] = useState('')

  const filteredRepositories = useMemo(() => {
    if (!data) return []
    const normalizedQuery = query.trim().toLowerCase()

    return data.repositories.filter((repository) => {
      const matchesCategory = category === 'all' || repository.categories.includes(category)
      const matchesQuery = !normalizedQuery || [
        repository.fullName,
        repository.description,
        repository.language ?? '',
        ...repository.topics
      ].some((value) => value.toLowerCase().includes(normalizedQuery))

      return matchesCategory && matchesQuery
    })
  }, [category, data, query])

  if (loading) return <PageState type="loading" />
  if (error || !data) return <PageState type="error" message={error ?? undefined} />

  return (
    <div className="app-shell">
      <Header generatedAt={data.generatedAt} />
      <main>
        <HeroSummary document={data} />
        <section className="ranking-section" id="ranking" aria-labelledby="ranking-title">
          <div className="section-heading container">
            <div>
              <h2 id="ranking-title">今日排行</h2>
              <p>排名來自增長和開發活動，研究摘要不參與分數。</p>
            </div>
          </div>
          <FilterBar
            category={category}
            onCategoryChange={setCategory}
            query={query}
            onQueryChange={setQuery}
            resultCount={filteredRepositories.length}
          />
          <div className="container rankings-layout">
            {filteredRepositories.length > 0 ? (
              <>
                <Podium repositories={filteredRepositories.slice(0, 3)} />
                <RankingList repositories={filteredRepositories.slice(3)} />
              </>
            ) : (
              <PageState type="empty" />
            )}
          </div>
        </section>
        <Methodology status={data.status} historyDays={data.stats.historyDays} />
      </main>
      <footer className="site-footer container">
        <p>GitHub 日研榜只使用公開資料。熱門度不是安全或品質保證。</p>
        <a href="https://github.com" target="_blank" rel="noreferrer">資料來源 GitHub</a>
      </footer>
    </div>
  )
}
