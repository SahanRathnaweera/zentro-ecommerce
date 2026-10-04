import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide transition hover:text-black ${
      isActive ? 'text-black font-semibold' : 'text-neutral-500'
    }`

  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="text-2xl font-bold tracking-widest text-neutral-900">
          ZENTRO
        </Link>

        <div className="flex gap-6">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

export default Navbar