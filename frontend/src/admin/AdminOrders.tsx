import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { adminGetOrders, adminUpdateOrderStatus } from '../services/api'
import type { AdminOrder } from '../types/admin'

const NEXT: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
}

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function AdminOrders() {
  const { token } = useAuth()
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        setOrders(await adminGetOrders(token))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  async function changeStatus(order: AdminOrder, status: string) {
    if (!token || !status) return
    setError(null)
    try {
      const updated = await adminUpdateOrderStatus(token, order.id, status)
      setOrders((current) => current.map((o) => (o.id === updated.id ? updated : o)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }

  if (loading) return <p className="text-neutral-500">Loading...</p>

  return (
    <div>
      <h1 className="text-3xl font-bold text-neutral-900">Orders</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {orders.length === 0 ? (
        <p className="mt-8 text-neutral-500">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 text-neutral-600">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Change to</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <>
                  <tr key={o.id}>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        className="underline"
                      >
                        #{o.id}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {o.customerName}
                      <br />
                      <span className="text-xs text-neutral-500">{o.customerEmail}</span>
                    </td>
                    <td className="px-4 py-3">{formatPrice(o.totalAmount)}</td>
                    <td className="px-4 py-3">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium">{o.status}</td>
                    <td className="px-4 py-3">
                      {NEXT[o.status].length === 0 ? (
                        <span className="text-neutral-400">Final</span>
                      ) : (
                        <select
                          value=""
                          onChange={(e) => void changeStatus(o, e.target.value)}
                          className="rounded border border-neutral-300 px-2 py-1"
                        >
                          <option value="">Select...</option>
                          {NEXT[o.status].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr key={`${o.id}-details`} className="bg-neutral-50">
                      <td colSpan={6} className="px-4 py-3">
                        <ul className="space-y-1">
                          {o.items.map((i) => (
                            <li key={i.variantId}>
                              {i.productName} ({i.color} / {i.size}) × {i.quantity} ={' '}
                              {formatPrice(i.lineTotal)}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2 text-xs text-neutral-500">
                          Ship to: {o.shippingName}, {o.shippingPhone}, {o.shippingAddress}
                        </p>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminOrders