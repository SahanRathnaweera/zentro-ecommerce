import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getMyOrders } from '../services/api'
import type { Order } from '../types/order'

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function statusClass(status: string): string {
  switch (status) {
    case 'DELIVERED':
      return 'bg-green-100 text-green-800'
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    case 'SHIPPED':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-neutral-100 text-neutral-800'
  }
}

function Orders() {
  const { token } = useAuth()
  const location = useLocation()
  const placedOrderId = (location.state as { placedOrderId?: number } | null)?.placedOrderId

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      if (!token) return
      try {
        setOrders(await getMyOrders(token))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [token])

  if (loading) {
    return <p className="px-4 py-16 text-center text-neutral-500">Loading...</p>
  }

  if (error) {
    return <p className="px-4 py-16 text-center text-red-600">{error}</p>
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">My Orders</h1>

      {placedOrderId && (
        <p className="mt-4 rounded bg-green-50 p-3 text-sm text-green-800">
          Thank you! Your order #{placedOrderId} has been placed.
        </p>
      )}

      {orders.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-neutral-500">You have no orders yet.</p>
          <Link to="/products" className="mt-4 inline-block underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-6">
          {orders.map((order) => (
            <li key={order.id} className="rounded-lg border border-neutral-200 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-neutral-900">Order #{order.id}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass(order.status)}`}
                >
                  {order.status}
                </span>
              </div>

              <ul className="mt-4 divide-y divide-neutral-100 text-sm">
                {order.items.map((item) => (
                  <li key={item.variantId} className="flex justify-between py-2">
                    <span>
                      {item.productName} ({item.color} / {item.size}) × {item.quantity}
                    </span>
                    <span>{formatPrice(item.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 flex justify-between font-bold text-neutral-900">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </p>
              <p className="mt-2 text-xs text-neutral-500">
                Ship to: {order.shippingName}, {order.shippingAddress}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default Orders