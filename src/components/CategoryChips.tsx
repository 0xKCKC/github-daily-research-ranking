import { categoryLabels, type RepositoryCategory } from '../domain/repository'

interface CategoryChipsProps {
  categories: RepositoryCategory[]
}

export function CategoryChips({ categories }: CategoryChipsProps) {
  return (
    <ul className="category-chips" aria-label="分類">
      {categories.map((category) => <li key={category}>{categoryLabels[category]}</li>)}
    </ul>
  )
}
