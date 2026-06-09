import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import useFetch from '../hooks/useFetch'
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../utils/api'
import { LoadingPage, ErrorMessage, Table, Modal, SearchInput, EmptyState, StatusBadge } from '../components/UI'

function CustomerForm({ initial, onSubmit, loading, error }) {
  const def = initial || { name: '', phone: '', email: '', status: 'active' }
  const [form, setForm] = useState(def)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Ism familiya *</label>
        <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ahmadjon Toshmatov" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Telefon *</label>
        <input className="input-field" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+998901234567" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
        <input type="email" className="input-field" value={form.email} onChange={e => set('email', e.target.value)} placeholder="example@mail.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Holati</label>
        <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="active">Faol</option>
          <option value="inactive">Nofaol</option>
        </select>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
      </div>
    </form>
  )
}

export default function Customers() {
  const { user } = useAuth()
  const canWrite = user?.role === 'admin'
  const { data, loading, error, reload } = useFetch(getCustomers)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ type: null, target: null })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const customers = (data?.results || data || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const openModal = (type, target = null) => { setModal({ type, target }); setSaveError('') }
  const closeModal = () => setModal({ type: null, target: null })

  const handleErr = (err) => {
    const d = err.response?.data
    setSaveError(typeof d === 'string' ? d : typeof d === 'object' ? Object.values(d).flat().join(' ') : 'Xato yuz berdi')
  }

  const handleSave = async (form) => {
    setSaving(true); setSaveError('')
    try {
      if (modal.type === 'create') await createCustomer(form)
      else await updateCustomer(modal.target.id, form)
      closeModal(); reload()
    } catch (err) { handleErr(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (c) => {
    if (!confirm(`"${c.name}" ni o'chirishni tasdiqlaysizmi?`)) return
    try { await deleteCustomer(c.id); reload() }
    catch (err) { alert(err.response?.data?.detail || 'Xato') }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Mijozlar</h1>
        {canWrite && (
          <button onClick={() => openModal('create')} className="btn-primary">➕ Yangi mijoz</button>
        )}
      </div>

      <div className="card">
        <div className="mb-4 max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder="Ism, telefon yoki email..." />
        </div>

        {loading && <LoadingPage />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          customers.length === 0 ? <EmptyState icon="👥" title="Mijoz topilmadi" /> : (
            <Table headers={['#', 'Ism', 'Telefon', 'Email', 'Buyurtmalar', 'Jami sarflagan', 'Holat', ...(canWrite ? ['Amallar'] : [])]}>
              {customers.map((c, i) => (
                <tr key={c.id} className="table-row">
                  <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
                        {c.name[0]}
                      </div>
                      <span className="text-sm font-medium text-white">{c.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{c.phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{c.email}</td>
                  <td className="px-4 py-3 text-sm text-blue-400 font-medium">{c.total_orders} ta</td>
                  <td className="px-4 py-3 text-sm text-primary font-medium">{new Intl.NumberFormat('uz-UZ').format(c.total_spent || 0)} so'm</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openModal('edit', c)}
                          className="text-sm px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-gray-300 transition-colors">✏️</button>
                        <button onClick={() => handleDelete(c)}
                          className="text-sm px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">🗑️</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </Table>
          )
        )}
      </div>

      <Modal open={modal.type === 'create'} onClose={closeModal} title="Yangi mijoz">
        <CustomerForm onSubmit={handleSave} loading={saving} error={saveError} />
      </Modal>

      <Modal open={modal.type === 'edit'} onClose={closeModal} title="Mijozni tahrirlash">
        {modal.target && (
          <CustomerForm
            initial={{ name: modal.target.name, phone: modal.target.phone, email: modal.target.email, status: modal.target.status }}
            onSubmit={handleSave}
            loading={saving}
            error={saveError}
          />
        )}
      </Modal>
    </div>
  )
}
