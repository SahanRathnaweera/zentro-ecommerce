import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminDeleteProduct, getProducts } from '../services/api'
import type { Product } from '../types/product'

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function AdminProducts() {
  const { token } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setProducts(await getProducts())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function handleDelete(product: Product) {
    if (!token) return
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return
    setError(null)
    try {
      await adminDeleteProduct(token, product.id)
      setProducts((current) => current.filter((p) => p.id !== product.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (loading) return <p className="text-neutral-500">Loading...</p>

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-neutral-900">Products</h1>
        <Link
          to="/admin/products/add"
          className="rounded-full bg-black px-5 py-2 text-sm text-white transition hover:bg-neutral-700"
        >
          + Add product
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {products.length === 0 ? (
        <p className="mt-8 text-neutral-500">No products yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 text-neutral-600">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3">
                    <div className="h-14 w-11 overflow-hidden rounded bg-neutral-100">
                      {p.imageUrls[0] && (
                        <img src={p.imageUrls[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">{p.name}</td>
                  <td className="px-4 py-3">{p.categoryName}</td>
                  <td className="px-4 py-3">{formatPrice(p.discountPrice ?? p.price)}</td>
                  <td className="px-4 py-3">{p.totalStock}</td>
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/products/edit/${p.id}`}
                      className="mr-4 text-neutral-700 underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => void handleDelete(p)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminProducts