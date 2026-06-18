import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [blocked, setBlocked] = useState(false)

  if (user) return <Navigate to="/" replace />

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBlocked(false)
    if (!username.trim() || !password) {
      setError('Username va parol kiritilishi shart')
      return
    }
    setLoading(true)
    try {
      await login(username.trim(), password)
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.detail
      if (status === 403) {
        setBlocked(true)
        setError(msg || "Hisobingiz bloklangan. Administrator bilan bog'laning.")
      } else {
        setError(msg || "Noto'g'ri username yoki parol")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-gradient mb-2">StyleHub</h1>
          <p className="text-gray-400 text-sm">Ulgurji Kiyim-Kechak Boshqaruv Tizimi</p>
        </div>

        <div className="card shadow-2xl">
          <h2 className="text-xl font-display font-semibold text-white mb-6">Tizimga kirish</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Foydalanuvchi nomi
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="username"
                autoComplete="username"
                className="input-field"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Parol</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="input-field pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors text-lg"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {error && (
              <div className={`border rounded-lg px-4 py-3 text-sm ${
                blocked
                  ? 'bg-red-900/20 border-red-500/50 text-red-300'
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {blocked && <div className="font-semibold mb-0.5">🚫 Kirish taqiqlangan</div>}
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kirilmoqda...
                </>
              ) : 'Kirish'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-dark-600">
            <p className="text-xs text-gray-500 text-center">Demo hisoblar:</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { u: 'admin', p: 'admin123', label: 'Admin' },
                { u: 'manager', p: 'manager123', label: 'Menejer' },
                { u: 'viewer', p: 'viewer123', label: 'Kuzatuvchi' },
              ].map((acc) => (
                <button
                  key={acc.u}
                  type="button"
                  onClick={() => { setUsername(acc.u); setPassword(acc.p); setError(''); setBlocked(false) }}
                  className="text-xs bg-dark-700 hover:bg-dark-600 text-gray-300 rounded-lg
                             py-1.5 px-2 transition-colors border border-dark-600"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
