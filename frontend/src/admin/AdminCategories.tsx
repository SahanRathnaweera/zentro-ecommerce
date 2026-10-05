import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminDeleteCategory, adminSaveCategory, getCategories } from '../services/api'
import type { Category } from '../types/category'

function AdminCategories() {
  const { token } = useAuth()

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  
  const [editing, setEditing] = useState<Category | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function load() {
    try {
      setCategories(await getCategories())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  function startEdit(category: Category) {
    setEditing(category)
    setName(category.name)
    setDescription(category.description ?? '')
    setError(null)
  }

  function resetForm() {
    setEditing(null)
    setName('')
    setDescription('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) return setError('Category name is required')
    if (name.trim().length > 50) return setError('Name must be at most 50 characters')
    if (!token) return setError('Please log in again')

    setSubmitting(true)
    try {
      await adminSaveCategory(
        token,
        { name: name.trim(), description: description.trim() },
        editing?.id,
      )
      resetForm()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(category: Category) {
    if (!token) return
    if (!window.confirm(`Delete category "${category.name}"?`)) return
    setError(null)
    try {
      await adminDeleteCategory(token, category.id)
      if (editing?.id === category.id) resetForm()
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  const inputClass =
    'mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

  if (loading) return <p className="text-neutral-500">Loading...</p>

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-neutral-900">Categories</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 space-y-3 rounded-lg border border-neutral-200 bg-white p-5"
      >
        <h2 className="font-semibold text-neutral-900">
          {editing ? `Edit "${editing.name}"` : 'Add category'}
        </h2>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Description</label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-black px-6 py-2 text-sm text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {submitting ? 'Saving...' : editing ? 'Save changes' : 'Add category'}
          </button>
          {editing && (
            <button type="button" onClick={resetForm} className="text-sm underline">
              Cancel
            </button>
          )}
        </div>
      </form>

      {categories.length === 0 ? (
        <p className="mt-8 text-neutral-500">No categories yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 text-neutral-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {categories.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{c.name}</td>
                  <td className="px-4 py-3">{c.description}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => startEdit(c)} className="mr-4 underline">
                      Edit
                    </button>
                    <button
                      onClick={() => void handleDelete(c)}
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

export default AdminCategories