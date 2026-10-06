import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="mt-24 bg-navy text-neutral-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-display text-2xl tracking-[0.3em] text-white">ZENTRO</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-400">
            Premium clothing for the whole family. Timeless style, quality fabrics and
            comfort you can feel.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-light">Shop</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-white">All products</Link></li>
            <li><Link to="/cart" className="hover:text-white">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-white">My orders</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-gold-light">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-400">
            <li>Matara, Sri Lanka</li>
            <li>adminzentro@gmail.com</li>
            <li>+94 76 92 64 925</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} Zentro. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer