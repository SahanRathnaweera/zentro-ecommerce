import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { trackOrder } from '../services/api'
import type { Order } from '../types/order'

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function TrackOrder() {
  const location = useLocation()
  const prefill = location.state as { orderId?: string | null; email?: string | null } | null

  const [orderId, setOrderId] = useState(prefill?.orderId ?? '')
  const [email, setEmail] = useState(prefill?.email ?? '')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function search(rawId: string, rawEmail: string) {
    setError(null)
    setOrder(null)

    const id = Number(rawId.replace(/\D/g, ''))
    if (!Number.isInteger(id) || id <= 0) return setError('Enter a valid order number')
    if (!/^\S+@\S+\.\S+$/.test(rawEmail.trim())) return setError('Enter a valid email')

    setLoading(true)
    try {
      setOrder(await trackOrder(id, rawEmail.trim()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  // Coming from the payment result page: look the order up straight away
  useEffect(() => {
    if (prefill?.orderId && prefill?.email) {
      void search(prefill.orderId, prefill.email)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    void search(orderId, email)
  }

  const inputClass =
    'mt-1 w-full rounded border border-neutral-300 px-3 py-2 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy'

  return (
    <section className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-display text-3xl font-bold text-navy">Track your order</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label htmlFor="orderId" className="block text-sm font-medium text-neutral-700">
            Order number
          </label>
          <input
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g. 3"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
            Email used at checkout
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-navy px-6 py-3 text-white transition hover:bg-[#1b2b5e] disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {loading ? 'Searching...' : 'Track order'}
        </button>
      </form>

      {order && (
        <div className="mt-10 rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-neutral-900">Order #{order.id}</p>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold">
              {order.status}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {new Date(order.createdAt).toLocaleString()}
          </p>

          <ul className="mt-4 divide-y divide-neutral-100 text-sm">
            {order.items.map((i) => (
              <li key={i.variantId} className="flex justify-between py-2">
                <span>
                  {i.productName} ({i.color} / {i.size}) × {i.quantity}
                </span>
                <span>{formatPrice(i.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Payment: {order.paymentMethod === 'CARD' ? 'Card' : 'Cash on delivery'} (
            {order.paymentStatus})
          </p>
          <p className="mt-2 text-xs text-neutral-500">
            Ship to: {order.shippingName}, {order.shippingAddress}
          </p>
        </div>
      )}
    </section>
  )
}

export default TrackOrder