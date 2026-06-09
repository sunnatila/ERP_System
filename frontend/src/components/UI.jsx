export function Spinner({ size = 'md' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} border-2 border-primary border-t-transparent rounded-full animate-spin`} />
  )
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center min-h-64">
      <Spinner size="lg" />
    </div>
  )
}

export function ErrorMessage({ message }) {
  if (!message) return null
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
      {message}
    </div>
  )
}

export function EmptyState({ icon = '📭', title = 'Ma\'lumot yo\'q', description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-white mb-1">{title}</h3>
      {description && <p className="text-gray-400 text-sm">{description}</p>}
    </div>
  )
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card w-full max-w-lg mx-4 z-10 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-display font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400
                       hover:text-white hover:bg-dark-700 transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Table({ headers, children, loading }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-dark-600">
            {headers.map((h, i) => (
              <th
                key={i}
                className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} className="py-12 text-center">
                <div className="flex justify-center">
                  <Spinner />
                </div>
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
    </div>
  )
}

export function StatusBadge({ status }) {
  const map = {
    completed: <span className="badge-success">Bajarildi</span>,
    processing: <span className="badge-warning">Jarayonda</span>,
    pending: <span className="badge-info">Kutilmoqda</span>,
    active: <span className="badge-success">Faol</span>,
    inactive: <span className="badge-danger">Nofaol</span>,
  }
  return map[status] || <span className="badge-gray">{status}</span>
}

export function RoleBadge({ role }) {
  const map = {
    admin: <span className="badge-orange">Admin</span>,
    manager: <span className="badge-info">Menejer</span>,
    viewer: <span className="badge-gray">Kuzatuvchi</span>,
  }
  return map[role] || <span className="badge-gray">{role}</span>
}

export function SearchInput({ value, onChange, placeholder = 'Qidirish...' }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-9"
      />
    </div>
  )
}

export function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
      >
        ‹
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
            p === page ? 'bg-primary text-white' : 'bg-dark-700 text-gray-400 hover:bg-dark-600'
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
      >
        ›
      </button>
    </div>
  )
}
