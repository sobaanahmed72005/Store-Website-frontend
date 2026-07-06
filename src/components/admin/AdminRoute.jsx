import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ADMIN_PATH } from '../../config/adminPath'

export default function AdminRoute({ children }) {
  const { user, initializing } = useAuth()
  // Session state now lives only in memory, re-derived from the httpOnly cookie via /auth/me
  // on every load — wait for that check before deciding, or a hard refresh would bounce an
  // already-signed-in admin to the login page before their session was even confirmed.
  if (initializing) return null
  if (!user || user.role !== 'admin') {
    return <Navigate to={`${ADMIN_PATH}/login`} replace />
  }
  return children
}
