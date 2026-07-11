import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ADMIN_PATH } from '../../config/adminPath'

export default function AdminRoute({ children }) {
  const { user, initializing } = useAuth()
  // Wait for the initial /auth/me check — user starts out null on every load now that
  // session identity isn't cached in localStorage, so redirecting on that transient null
  // would bounce a logged-in admin to the login page on every refresh.
  if (initializing) return null
  if (!user || user.role !== 'admin') {
    return <Navigate to={`${ADMIN_PATH}/login`} replace />
  }
  return children
}
