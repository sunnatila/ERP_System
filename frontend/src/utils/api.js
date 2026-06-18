import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stylehub_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    // Never intercept auth endpoints — let callers handle errors
    if (original.url?.includes('/auth/login/') || original.url?.includes('/auth/refresh/')) {
      return Promise.reject(error)
    }
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('stylehub_refresh')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/auth/refresh/', { refresh })
          localStorage.setItem('stylehub_token', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          // fall through to logout
        }
      }
      localStorage.removeItem('stylehub_token')
      localStorage.removeItem('stylehub_refresh')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (username, password) =>
  api.post('/auth/login/', { username, password })
export const getMe = () => api.get('/auth/me/')
export const updateProfile = (data) => api.patch('/auth/me/', data)
export const getUsers = () => api.get('/auth/users/')
export const getUser = (id) => api.get(`/auth/users/${id}/`)
export const createUser = (data) => api.post('/auth/users/', data)
export const updateUser = (id, data) => api.patch(`/auth/users/${id}/`, data)
export const deleteUser = (id) => api.delete(`/auth/users/${id}/`)

// Products
export const getProducts = (params) => api.get('/products/', { params })
export const getProduct = (id) => api.get(`/products/${id}/`)
export const createProduct = (data) => api.post('/products/', data)
export const updateProduct = (id, data) => api.patch(`/products/${id}/`, data)
export const deleteProduct = (id) => api.delete(`/products/${id}/`)
export const getCategories = () => api.get('/products/categories/')

// Orders
export const getOrders = (params) => api.get('/orders/', { params })
export const getOrder = (id) => api.get(`/orders/${id}/`)
export const createOrder = (data) => api.post('/orders/', data)
export const updateOrder = (id, data) => api.patch(`/orders/${id}/`, data)
export const deleteOrder = (id) => api.delete(`/orders/${id}/`)

// Customers
export const getCustomers = (params) => api.get('/customers/', { params })
export const getCustomer = (id) => api.get(`/customers/${id}/`)
export const createCustomer = (data) => api.post('/customers/', data)
export const updateCustomer = (id, data) => api.patch(`/customers/${id}/`, data)
export const deleteCustomer = (id) => api.delete(`/customers/${id}/`)

// Warehouse
export const getWarehouse = (params) => api.get('/warehouse/', { params })
export const createWarehouseItem = (data) => api.post('/warehouse/', data)
export const updateWarehouseItem = (id, data) => api.patch(`/warehouse/${id}/`, data)
export const deleteWarehouseItem = (id) => api.delete(`/warehouse/${id}/`)

// Dashboard
export const getDashboard = () => api.get('/dashboard/')

export default api
