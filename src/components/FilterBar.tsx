import { MagnifyingGlass } from '@phosphor-icons/react'
import { categoryLabels, type RepositoryCategory } from '../domain/repository'

interface FilterBarProps {
  category: RepositoryCategory | 'all'
  onCategoryChange: (category: RepositoryCategory | 'all') => void
  query: string
  onQueryChange: (query: string) => void
  resultCount: number
}

const categories: Array<RepositoryCategory | 'all'> = [
  'all',
  'ai',
  'devtools',
  'web',
  'data',
  'security',
  'mobile',
  'other'
]

export function FilterBar({
  category,
  onCategoryChange,
  query,
  onQueryChange,
  resultCount
}: FilterBarProps) {
  return (
    <div className="filter-shell">
      <div className="container filter-row">
        <div className="category-tabs" role="group" aria-label="項目分類">
          {categories.map((item) => (
            <button
              className={item === category ? 'category-tab is-active' : 'category-tab'}
              key={item}
              onClick={() => onCategoryChange(item)}
              type="button"
            >
              {item === 'all' ? '全部' : categoryLabels[item]}
            </button>
          ))}
        </div>
        <label className="search-field">
          <MagnifyingGlass size={18} aria-hidden="true" />
          <span className="sr-only">搜尋 repository</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="搜尋 repo、語言或 topic"
          />
          <span className="result-count">{resultCount}</span>
        </label>
      </div>
    </div>
  )
}
