import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder, getPayHereForm } from '../services/api'
import { redirectToPayHere } from '../services/payhere'

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function Checkout() {
  const { items, subtotal, clearCart } = useCart()
  const { token, user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const [contactEmail, setContactEmail] = useState(user?.email ?? '')
  const [shippingName, setShippingName] = useState(user?.fullName ?? '')
  const [shippingPhone, setShippingPhone] = useState(user?.phone ?? '')
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD'>('COD')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (items.length === 0 && !submitting) {
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

    if (!/^\S+@\S+\.\S+$/.test(contactEmail.trim())) return setError('Please enter a valid email')
    if (!shippingName.trim()) return setError('Name is required')
    if (!/^[0-9+\-\s]{7,20}$/.test(shippingPhone.trim())) {
      return setError('Please enter a valid phone number')
    }
    if (shippingAddress.trim().length < 10) return setError('Please enter your full address')

    setSubmitting(true)
    try {
      const order = await createOrder(token, {
        contactEmail: contactEmail.trim(),
        shippingName: shippingName.trim(),
        shippingPhone: shippingPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        paymentMethod,
        // Only ids and quantities are sent. The server works out the prices.
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      })

      if (paymentMethod === 'CARD') {
        const origin = window.location.origin
        const email = encodeURIComponent(order.contactEmail)
        const form = await getPayHereForm(
          order.id,
          order.contactEmail,
          `${origin}/payment-success?orderId=${order.id}&email=${email}`,
          `${origin}/payment-cancelled?orderId=${order.id}&email=${email}`,
        )
        // The browser leaves the site now, so the cart is cleared only at this point
        clearCart()
        redirectToPayHere(form)
        return
      }

      clearCart()
      if (isAuthenticated) {
        navigate('/orders', { state: { placedOrderId: order.id } })
      } else {
        navigate('/order-success', { state: { order } })
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong'
      if (message.includes('session has expired')) {
        logout()
        navigate('/login')
        return
      }
      setError(message)
      setSubmitting(false)
    }
  }

  const inputClass =
    'mt-1 w-full rounded border border-neutral-300 px-3 py-2 focus:border-navy focus:outline-none focus:ring-1 focus:ring-navy'

  return (
    <section className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <h1 className="font-display text-3xl font-bold text-navy">Checkout</h1>

        {!isAuthenticated && (
          <p className="mt-3 rounded bg-neutral-100 p-3 text-sm text-neutral-600">
            Checking out as a guest.{' '}
            <Link to="/login" className="font-semibold text-navy underline">
              Log in
            </Link>{' '}
            to track all your orders in one place.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className={inputClass}
            />
          </div>

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

          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-700">Payment method</p>
            <label className="flex items-center gap-2 rounded border border-neutral-200 p-3 text-sm">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'COD'}
                onChange={() => setPaymentMethod('COD')}
              />
              Cash on delivery
            </label>
            <label className="flex items-center gap-2 rounded border border-neutral-200 p-3 text-sm">
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'CARD'}
                onChange={() => setPaymentMethod('CARD')}
              />
              Pay online by card (PayHere)
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-navy px-6 py-3 text-white transition hover:bg-[#1b2b5e] disabled:cursor-not-allowed disabled:bg-neutral-300"
          >
            {submitting
              ? 'Please wait...'
              : paymentMethod === 'CARD'
                ? 'Continue to payment'
                : 'Place order'}
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