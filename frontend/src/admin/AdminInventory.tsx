import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminGetInventory, adminUpdateStock } from '../services/api'
import type { InventoryItem } from '../types/admin'

const LOW_STOCK = 5

function AdminInventory() {
  const { token } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [edits, setEdits] = useState<Record<number, string>>({})
  const [search, setSearch] = useState('')
  const [onlyLow, setOnlyLow] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        setItems(await adminGetInventory(token))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  async function save(item: InventoryItem) {
    if (!token) return
    const raw = edits[item.variantId]
    const value = Number(raw)
    if (raw === undefined || raw === '' || !Number.isInteger(value) || value < 0) {
      return setError('Stock must be a whole number, 0 or more')
    }
    setError(null)
    try {
      const updated = await adminUpdateStock(token, item.variantId, value)
      setItems((current) => current.map((i) => (i.variantId === updated.variantId ? updated : i)))
      setEdits((current) => {
        const next = { ...current }
        delete next[item.variantId]
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const term = search.trim().toLowerCase()
  const visible = items.filter(
    (i) =>
      i.productName.toLowerCase().includes(term) &&
      (!onlyLow || i.stock <= LOW_STOCK),
  )

  if (loading) return <p className="text-neutral-500">Loading...</p>

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900">Inventory</h1>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by product name"
          className="w-full max-w-sm rounded border border-neutral-300 bg-white px-3 py-2 focus:border-black focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} />
          Low stock only (≤ {LOW_STOCK})
        </label>
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {visible.length === 0 ? (
        <p className="mt-8 text-neutral-500">Nothing to show.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 text-neutral-600">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Colour</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {visible.map((i) => {
                const edited = edits[i.variantId]
                return (
                  <tr key={i.variantId}>
                    <td className="px-4 py-3 font-medium text-neutral-900">{i.productName}</td>
                    <td className="px-4 py-3">{i.categoryName}</td>
                    <td className="px-4 py-3">{i.color}</td>
                    <td className="px-4 py-3">{i.size}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          i.stock === 0
                            ? 'bg-red-100 text-red-800'
                            : i.stock <= LOW_STOCK
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {i.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={edited ?? ''}
                        placeholder="New stock"
                        onChange={(e) =>
                          setEdits((current) => ({ ...current, [i.variantId]: e.target.value }))
                        }
                        className="w-28 rounded border border-neutral-300 px-2 py-1"
                      />
                      <button
                        onClick={() => void save(i)}
                        disabled={edited === undefined || edited === ''}
                        className="ml-2 rounded bg-black px-3 py-1 text-white disabled:bg-neutral-300"
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminInventory