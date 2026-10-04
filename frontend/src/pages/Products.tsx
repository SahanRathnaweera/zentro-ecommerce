import { useEffect, useState } from 'react'
import { getCategories } from '../services/api'
import type { Category } from '../types/category'

function Products() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories()
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    void loadCategories()
  }, [])

  if (loading) {
    return <p className="px-4 py-16 text-center text-neutral-500">Loading...</p>
  }

  if (error) {
    return <p className="px-4 py-16 text-center text-red-600">{error}</p>
  }

  if (categories.length === 0) {
    return <p className="px-4 py-16 text-center text-neutral-500">No categories yet.</p>
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Shop by Category</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="rounded-lg border border-neutral-200 p-6 transition hover:shadow-lg"
          >
            <h2 className="text-xl font-semibold text-neutral-900">{category.name}</h2>
            <p className="mt-2 text-neutral-600">{category.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default Products