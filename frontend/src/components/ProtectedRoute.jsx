import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token, loading } = useAuth()

  if (loading) return null

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="card text-center max-w-md">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-display font-bold text-white mb-2">Ruxsat yo'q</h2>
          <p className="text-gray-400">Bu sahifani ko'rish uchun sizda yetarli huquq yo'q.</p>
        </div>
      </div>
    )
  }

  return children
}
