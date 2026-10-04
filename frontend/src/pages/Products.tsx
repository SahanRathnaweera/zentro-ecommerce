import { useEffect, useState } from 'react'
import ProductCard from '../components/ProductCard'
import { getCategories, getProducts } from '../services/api'
import type { Category } from '../types/category'
import type { Product } from '../types/product'

function Products() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load categories once (for the filter buttons)
  useEffect(() => {
    async function loadCategories() {
      try {
        setCategories(await getCategories())
      } catch {
        // The filter buttons are optional; products can still load
      }
    }
    void loadCategories()
  }, [])

  // Load products now, and again whenever the selected category changes
  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      setError(null)
      try {
        setProducts(await getProducts(selectedCategoryId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    void loadProducts()
  }, [selectedCategoryId])

  const buttonClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition ${
      active
        ? 'border-black bg-black text-white'
        : 'border-neutral-300 text-neutral-700 hover:border-black'
    }`

  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Products</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => setSelectedCategoryId(undefined)}
          className={buttonClass(selectedCategoryId === undefined)}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategoryId(category.id)}
            className={buttonClass(selectedCategoryId === category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      {loading && <p className="py-16 text-center text-neutral-500">Loading...</p>}

      {error && <p className="py-16 text-center text-red-600">{error}</p>}

      {!loading && !error && products.length === 0 && (
        <p className="py-16 text-center text-neutral-500">No products found.</p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Products