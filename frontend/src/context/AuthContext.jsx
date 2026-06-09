import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('stylehub_token'))
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const logout = useCallback(() => {
    localStorage.removeItem('stylehub_token')
    localStorage.removeItem('stylehub_refresh')
    setToken(null)
    setUser(null)
    navigate('/login', { replace: true })
  }, [navigate])

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('stylehub_token')
      if (!storedToken) {
        setLoading(false)
        return
      }
      try {
        const { data } = await api.get('/auth/me/')
        setUser(data)
        setToken(storedToken)
      } catch {
        localStorage.removeItem('stylehub_token')
        localStorage.removeItem('stylehub_refresh')
        setToken(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password })
    localStorage.setItem('stylehub_token', data.access)
    localStorage.setItem('stylehub_refresh', data.refresh)
    setToken(data.access)
    setUser(data.user)
    navigate('/', { replace: true })
    return data
  }

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me/')
      setUser(data)
    } catch {
      logout()
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
