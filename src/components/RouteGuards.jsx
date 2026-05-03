import { Navigate } from 'react-router-dom'

import { useAuth } from '../context/useAuth'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="page-shell loading-state">Loading workspace...</div>
  }

  if (!isAuthenticated) {
    return <Navigate replace to="/login" />
  }

  return children
}

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="page-shell loading-state">Loading workspace...</div>
  }

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />
  }

  return children
}

export { ProtectedRoute, PublicOnlyRoute }
