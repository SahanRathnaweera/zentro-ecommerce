import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getDashboard } from '../services/api'
import type { Dashboard as DashboardData } from '../types/admin'

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function Dashboard() {
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        setData(await getDashboard(token))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Something went wrong'
        if (message.includes('session has expired')) {
          logout()
          navigate('/login')
          return
        }
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token, logout, navigate])

  if (loading) return <p className="text-neutral-500">Loading...</p>
  if (error) return <p className="text-red-600">{error}</p>
  if (!data) return null

  const cards = [
    { label: 'Total products', value: data.totalProducts.toString() },
    { label: 'Total customers', value: data.totalCustomers.toString() },
    { label: 'Total orders', value: data.totalOrders.toString() },
    { label: 'Total sales', value: formatPrice(data.totalSales) },
    { label: 'Low-stock variants (≤ 5)', value: data.lowStockVariants.toString() },
  ]

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg border border-neutral-200 bg-white p-5">
            <p className="text-sm text-neutral-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-neutral-900">{card.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold text-neutral-900">Recent orders</h2>
      {data.recentOrders.length === 0 ? (
        <p className="mt-4 text-neutral-500">No orders yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 text-neutral-600">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.recentOrders.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">#{o.id}</td>
                  <td className="px-4 py-3">{o.customerName}</td>
                  <td className="px-4 py-3">{o.status}</td>
                  <td className="px-4 py-3">{formatPrice(o.totalAmount)}</td>
                  <td className="px-4 py-3">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Dashboard