import { Link, useSearchParams } from 'react-router-dom'

function PaymentResult({ success }: { success: boolean }) {
  const [params] = useSearchParams()
  const orderId = params.get('orderId')
  const email = params.get('email')

  return (
    <section className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="mx-auto h-1 w-12 bg-gold" />
      <h1 className="mt-6 font-display text-3xl font-bold text-navy">
        {success ? 'Thank you!' : 'Payment cancelled'}
      </h1>
      <p className="mt-4 text-neutral-600">
        {success
          ? `Your payment for order #${orderId} is being confirmed. This usually takes a few seconds.`
          : `Your order #${orderId} was created but the payment was not completed.`}
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <Link
          to="/track"
          state={{ orderId, email }}
          className="rounded-full bg-navy px-6 py-3 text-sm text-white"
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

export default PaymentResult