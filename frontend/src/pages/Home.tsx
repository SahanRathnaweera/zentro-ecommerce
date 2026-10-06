import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductCard from '../components/ProductCard'
import { getCategories, getProducts } from '../services/api'
import type { Category } from '../types/category'
import type { Product } from '../types/product'

const features = [
  { title: 'Free delivery', text: 'On all orders over Rs. 10,000 island-wide.' },
  { title: 'Easy returns', text: 'Not the right fit? Return within 7 days.' },
  { title: 'Secure checkout', text: 'Your details are always safe with us.' },
]

function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    async function load() {
      try {
        const [cats, prods] = await Promise.all([getCategories(), getProducts()])
        setCategories(cats)
        // Newest first, show 4
        setProducts([...prods].sort((a, b) => b.id - a.id).slice(0, 4))
      } catch {
        // The home page still works without this data
      }
    }
    void load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy to-[#1b2b5e] text-white">
        <div className="mx-auto max-w-6xl px-4 py-24 text-center md:py-32">
          <p className="text-sm uppercase tracking-[0.4em] text-gold-light">
            Premium Clothing
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight md:text-6xl">
            Style that fits <span className="text-gold">every</span> moment
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-neutral-300">
            Discover quality fashion for Men, Ladies and Kids, crafted for comfort and made
            to last.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/products"
              className="rounded-full bg-gold px-8 py-3 font-medium text-white transition hover:bg-[#a0832f]"
            >
              Shop Now
            </Link>
            <a
              href="#categories"
              className="rounded-full border border-white/40 px-8 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Browse categories
            </a>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categories" className="mx-auto max-w-6xl px-4 pt-20">
        <h2 className="text-center font-display text-3xl font-bold text-navy">
          Shop by Category
        </h2>
        <div className="mx-auto mt-3 h-0.5 w-16 bg-gold" />

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.id}`}
              className="group rounded-xl border border-neutral-200 bg-white p-10 text-center transition hover:-translate-y-1 hover:border-gold hover:shadow-xl"
            >
              <h3 className="font-display text-2xl font-bold text-navy">{c.name}</h3>
              <p className="mt-2 text-sm text-neutral-500">{c.description}</p>
              <span className="mt-6 inline-block text-sm font-medium text-gold transition group-hover:translate-x-1">
                Explore →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* New arrivals */}
      {products.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pt-20">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold text-navy">New Arrivals</h2>
              <div className="mt-3 h-0.5 w-16 bg-gold" />
            </div>
            <Link to="/products" className="text-sm font-medium text-gold hover:underline">
              View all →
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Why Zentro */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="grid gap-8 rounded-2xl bg-neutral-50 p-10 md:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="text-center">
              <div className="mx-auto h-1 w-10 bg-gold" />
              <h3 className="mt-4 font-display text-xl font-bold text-navy">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{f.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default Home