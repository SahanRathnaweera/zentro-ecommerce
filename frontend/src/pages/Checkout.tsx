import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder } from '../services/api'

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { token, user, logout } = useAuth()
  const navigate = useNavigate()

  const [shippingName, setShippingName] = useState(user?.fullName ?? '')
  const [shippingPhone, setShippingPhone] = useState(user?.phone ?? '')
  const [shippingAddress, setShippingAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (items.length === 0) {
    return (
      <section className="px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Your cart is empty</h1>
        <Link to="/products" className="mt-4 inline-block underline">
          Continue shopping
        </Link>
      </section>
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!shippingName.trim()) return setError('Name is required')
    if (!/^[0-9+\-\s]{7,20}$/.test(shippingPhone.trim())) {
      return setError('Please enter a valid phone number')
    }
    if (shippingAddress.trim().length < 10) {
      return setError('Please enter your full address')
    }
    if (!token) return setError('Please log in again')

    setSubmitting(true)
    try {
      const order = await createOrder(token, {
        shippingName: shippingName.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        // Only ids and quantities are sent. The server works out the prices.
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      })
      clearCart()
      navigate('/orders', { state: { placedOrderId: order.id } })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      if (message.includes('session has expired')) {
        logout()
        navigate('/login')
        return
      }
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full rounded border border-neutral-300 px-3 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Checkout</h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
              Full name
            </label>
            <input
              id="name"
              value={shippingName}
              onChange={(e) => setShippingName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
              Phone
            </label>
            <input
              id="phone"
              value={shippingPhone}
              onChange={(e) => setShippingPhone(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-neutral-700">
              Delivery address
            </label>
            <textarea
              id="address"
              rows={3}
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className={inputClass}
            />
          </div>

          <p className="rounded bg-neutral-100 p-3 text-sm text-neutral-600">
            Payment: Cash on delivery (online payment will be added later).
          </p>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-black px-6 py-3 text-white transition hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {submitting ? 'Placing order...' : 'Place order'}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-neutral-900">Order summary</h2>
        <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
          {items.map((item) => (
            <li key={item.variantId} className="flex justify-between py-4 text-sm">
              <div>
                <p className="font-medium text-neutral-900">{item.name}</p>
                <p className="text-neutral-500">
                  {item.color} / {item.size} × {item.quantity}
                </p>
              </div>
              <p className="text-neutral-900">{formatPrice(item.unitPrice * item.quantity)}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between text-lg font-bold text-neutral-900">
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </p>
      </div>
    </section>
  )
}

export default Checkout