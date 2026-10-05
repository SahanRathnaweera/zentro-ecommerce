import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function formatPrice(value: number): string {
  return `Rs. ${value.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
}

function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <section className="px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Your cart is empty</h1>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white transition hover:bg-neutral-700"
        >
          Continue shopping
        </Link>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold text-neutral-900">Shopping Cart</h1>

      <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
        {items.map((item) => (
          <li key={item.variantId} className="flex gap-4 py-6">
            <div className="h-28 w-24 shrink-0 overflow-hidden rounded bg-neutral-100">
              {item.imageUrl && (
                <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
              )}
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <Link
                  to={`/products/${item.productId}`}
                  className="font-semibold text-neutral-900 hover:underline"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-neutral-500">
                  {item.color} / {item.size}
                </p>
                <p className="mt-1 text-sm text-neutral-900">{formatPrice(item.unitPrice)}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center rounded border border-neutral-300">
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="px-3 py-1 disabled:opacity-30"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    className="px-3 py-1 disabled:opacity-30"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => removeItem(item.variantId)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>

            <p className="font-semibold text-neutral-900">
              {formatPrice(item.unitPrice * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-col items-end gap-4">
        <p className="text-lg text-neutral-900">
          Subtotal: <span className="font-bold">{formatPrice(subtotal)}</span>
        </p>
        <button
          onClick={() => navigate('/checkout')}
          className="rounded-full bg-black px-8 py-3 text-white transition hover:bg-neutral-700"
        >
          Proceed to checkout
        </button>
      </div>
    </section>
  )
}

export default Cart