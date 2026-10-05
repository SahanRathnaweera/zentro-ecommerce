import { Link, NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products', end: false },
  { to: '/admin/categories', label: 'Categories', end: false },
  { to: '/admin/orders', label: 'Orders', end: false },
  { to: '/admin/customers', label: 'Customers', end: false },
  { to: '/admin/inventory', label: 'Inventory', end: false },
]

function AdminLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `block rounded px-3 py-2 text-sm transition ${
      isActive ? 'bg-white text-black font-semibold' : 'text-neutral-300 hover:bg-neutral-800'
    }`

  return (
    <div className="flex min-h-[calc(100vh-73px)]">
      <aside className="w-56 shrink-0 bg-neutral-900 p-4">
        <p className="mb-4 px-3 text-xs uppercase tracking-widest text-neutral-500">Admin</p>
        <nav className="space-y-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <Link to="/" className="mt-8 block px-3 text-xs text-neutral-400 hover:text-white">
          ← Back to store
        </Link>
      </aside>

      <div className="flex-1 bg-neutral-50 p-8">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout