import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminGetCustomers } from '../services/api'
import type { Customer } from '../types/admin'

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function AdminCustomers() {
  const { token } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        setCustomers(await adminGetCustomers(token))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  const term = search.trim().toLowerCase()
  const visible = customers.filter(
    (c) => c.fullName.toLowerCase().includes(term) || c.email.toLowerCase().includes(term),
  )

  if (loading) return <p className="text-neutral-500">Loading...</p>
  if (error) return <p className="text-red-600">{error}</p>

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900">Customers</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email"
        className="mt-4 w-full max-w-sm rounded border border-neutral-300 bg-white px-3 py-2 focus:border-black focus:outline-none"
      />

      {visible.length === 0 ? (
        <p className="mt-8 text-neutral-500">No customers found.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 text-neutral-600">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total spent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {visible.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-medium text-neutral-900">{c.fullName}</td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone ?? '-'}</td>
                  <td className="px-4 py-3">{new Date(c.registeredAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{c.orderCount}</td>
                  <td className="px-4 py-3">{formatPrice(c.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminCustomers