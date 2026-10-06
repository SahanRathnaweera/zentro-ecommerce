import { Link, useLocation } from 'react-router-dom'
import type { Order } from '../types/order'

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function OrderSuccess() {
  const location = useLocation()
  const order = (location.state as { order?: Order } | null)?.order

  if (!order) {
    return (
      <section className="px-4 py-24 text-center">
        <p className="text-neutral-600">Nothing to show here.</p>
        <Link to="/" className="mt-4 inline-block underline">
          Back to home
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center">
      <div className="mx-auto h-1 w-12 bg-gold" />
      <h1 className="mt-6 font-display text-3xl font-bold text-navy">Thank you for your order!</h1>
      <p className="mt-4 text-neutral-600">
        Your order number is <span className="font-bold text-navy">#{order.id}</span>.
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        Please save this number. You can track your order any time with the number and the
        email <span className="font-medium">{order.contactEmail}</span>.
      </p>

      <div className="mt-8 rounded-lg border border-neutral-200 p-5 text-left text-sm">
        {order.items.map((i) => (
          <p key={i.variantId} className="flex justify-between py-1">
            <span>
              {i.productName} ({i.color} / {i.size}) × {i.quantity}
            </span>
            <span>{formatPrice(i.lineTotal)}</span>
          </p>
        ))}
        <p className="mt-3 flex justify-between border-t border-neutral-200 pt-3 font-bold">
          <span>Total</span>
          <span>{formatPrice(order.totalAmount)}</span>
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        <Link
          to="/track"
          className="rounded-full bg-navy px-6 py-3 text-sm text-white transition hover:bg-[#1b2b5e]"
        >
          Track order
        </Link>
        <Link to="/products" className="rounded-full border border-navy px-6 py-3 text-sm text-navy">
          Continue shopping
        </Link>
      </div>
    </section>
  )
}

export default OrderSuccess