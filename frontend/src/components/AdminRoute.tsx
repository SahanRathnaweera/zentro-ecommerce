import type { ReactNode } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function AdminRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <section className="px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Access denied</h1>
        <p className="mt-2 text-neutral-600">You do not have permission to view this page.</p>
        <Link to="/" className="mt-4 inline-block underline">
          Back to home
        </Link>
      </section>
    )
  }

  return <>{children}</>
}

export default AdminRoute