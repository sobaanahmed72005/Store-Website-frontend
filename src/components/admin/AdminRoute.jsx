import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ADMIN_PATH } from '../../config/adminPath'

export default function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user || user.role !== 'admin') {
    return <Navigate to={`${ADMIN_PATH}/login`} replace />
  }
  return children
}
