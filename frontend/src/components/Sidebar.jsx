import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { RoleBadge } from './UI'

const allNavItems = [
  { path: '/', label: 'Dashboard', icon: '📊', roles: ['admin', 'manager', 'viewer'] },
  { path: '/products', label: 'Mahsulotlar', icon: '👔', roles: ['admin', 'manager', 'viewer'] },
  { path: '/orders', label: 'Buyurtmalar', icon: '📦', roles: ['admin', 'manager'] },
  { path: '/customers', label: 'Mijozlar', icon: '👥', roles: ['admin'] },
  { path: '/warehouse', label: 'Ombor', icon: '🏭', roles: ['admin', 'manager'] },
  { path: '/users', label: 'Foydalanuvchilar', icon: '👤', roles: ['admin'] },
  { path: '/settings', label: 'Sozlamalar', icon: '⚙️', roles: ['admin'] },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const navItems = allNavItems.filter(
    (item) => user && item.roles.includes(user.role)
  )

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-800 border-r border-dark-600 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-dark-600">
        <h1 className="text-xl font-display font-bold text-gradient">StyleHub</h1>
        <p className="text-xs text-gray-500 mt-0.5">Ulgurji boshqaruv tizimi</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary/15 text-primary border border-primary/20'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info */}
      {user && (
        <div className="p-4 border-t border-dark-600">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
              {user.full_name?.[0] || user.username?.[0] || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.full_name || user.username}
              </p>
              <div className="mt-0.5">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                       text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <span>🚪</span>
            <span>Chiqish</span>
          </button>
        </div>
      )}
    </aside>
  )
}
