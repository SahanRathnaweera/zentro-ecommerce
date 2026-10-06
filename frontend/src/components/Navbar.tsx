import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Navbar() {
  const { itemCount } = useCart()
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm tracking-wide transition hover:text-black ${
      isActive ? 'text-black font-semibold' : 'text-neutral-500'
    }`

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4"> 
                        <Link to="/" className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden">
            <img
              src="/images/zentro logo.png"
              alt=""
              className="h-full w-full scale-[2.1] object-cover object-[50%_28%]"
            />
          </div>
          <span className="font-display text-2xl font-bold tracking-[0.25em] text-navy">
            ZENTRO
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <NavLink to="/" end className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/products" className={linkClass}>
            Products
          </NavLink>
          <NavLink to="/cart" className={linkClass}>
            Cart
            {itemCount > 0 && (
              <span className="ml-1 rounded-full bg-black px-2 py-0.5 text-xs text-white">
                {itemCount}
              </span>
            )}
          </NavLink>

          {isAuthenticated ? (
            <>
              <NavLink to="/orders" className={linkClass}>
                Orders
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={linkClass}>
                  Admin
                </NavLink>
              )}
              <span className="hidden text-sm text-neutral-700 sm:inline">
                Hi, {user?.fullName.split(' ')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-neutral-500 transition hover:text-black"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Login
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Navbar