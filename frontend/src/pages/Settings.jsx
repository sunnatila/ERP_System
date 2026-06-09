import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="page-header">
        <h1 className="page-title">Sozlamalar</h1>
      </div>

      {/* Company name — read only */}
      <div className="card">
        <h2 className="text-base font-display font-semibold text-white mb-4">Kompaniya sozlamalari</h2>
        <div>
          <p className="text-sm font-medium text-gray-300 mb-1.5">Kompaniya nomi</p>
          <div className="input-field bg-dark-900 cursor-default select-none text-gray-300 border-dark-600">
            StyleHub
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="card">
        <h2 className="text-base font-display font-semibold text-white mb-4">Profil ma'lumotlari</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
              {user?.full_name?.[0] || user?.username?.[0] || '?'}
            </div>
            <div>
              <p className="text-white font-medium">{user?.full_name || user?.username}</p>
              <p className="text-gray-400 text-sm">@{user?.username}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-dark-700 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-0.5">Rol</p>
              <p className="text-white capitalize">{user?.role}</p>
            </div>
            <div className="bg-dark-700 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-0.5">Holat</p>
              <p className={user?.is_active ? 'text-green-400' : 'text-red-400'}>
                {user?.is_active ? 'Faol' : 'Nofaol'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System info */}
      <div className="card">
        <h2 className="text-base font-display font-semibold text-white mb-4">Tizim ma'lumotlari</h2>
        <div className="space-y-2 text-sm">
          {[
            ['Versiya', 'StyleHub v1.0.0'],
            ['Backend', 'Django 5.0 + DRF'],
            ['Frontend', 'React 18 + Vite'],
            ['Ma\'lumotlar bazasi', 'PostgreSQL 15'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between py-2 border-b border-dark-600 last:border-0">
              <span className="text-gray-400">{k}</span>
              <span className="text-white">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
