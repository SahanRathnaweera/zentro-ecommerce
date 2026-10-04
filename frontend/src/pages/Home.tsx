import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="flex flex-col items-center justify-center bg-neutral-100 px-4 py-32 text-center">
      <h1 className="text-5xl font-bold tracking-widest text-neutral-900">ZENTRO</h1>
      <p className="mt-4 text-neutral-600">Premium clothing for Men, Ladies and Kids</p>
      <Link
        to="/products"
        className="mt-6 rounded-full bg-black px-6 py-3 text-white transition hover:bg-neutral-700"
      >
        Shop Now
      </Link>
    </section>
  )
}

export default Home