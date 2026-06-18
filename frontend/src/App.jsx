import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Warehouse from './pages/Warehouse'
import Users from './pages/Users'
import Settings from './pages/Settings'
import ProtectedRoute from './components/ProtectedRoute'
import Sidebar from './components/Sidebar'
import { useAuth } from './context/AuthContext'

function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <main className="flex-1 ml-64 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 font-body">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute allowedRoles={['admin', 'manager', 'viewer']}>
          <Layout><Dashboard /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/products" element={
        <ProtectedRoute allowedRoles={['admin', 'manager', 'viewer']}>
          <Layout><Products /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <Layout><Orders /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/customers" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Customers /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/warehouse" element={
        <ProtectedRoute allowedRoles={['admin', 'manager']}>
          <Layout><Warehouse /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/users" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Users /></Layout>
        </ProtectedRoute>
      } />

      <Route path="/settings" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout><Settings /></Layout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
