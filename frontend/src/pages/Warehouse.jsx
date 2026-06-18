import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import useFetch from '../hooks/useFetch'
import { getWarehouse, createWarehouseItem, updateWarehouseItem, deleteWarehouseItem, getProducts } from '../utils/api'
import { LoadingPage, ErrorMessage, Table, Modal, SearchInput, EmptyState } from '../components/UI'

function WarehouseForm({ initial, products, onSubmit, loading, error }) {
  const def = initial || { product: '', quantity: '', location: '' }
  const [form, setForm] = useState(def)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Mahsulot *</label>
        <select className="input-field" value={form.product} onChange={e => set('product', e.target.value)} required>
          <option value="">Tanlang</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.image} {p.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Miqdor *</label>
          <input type="number" className="input-field" value={form.quantity} onChange={e => set('quantity', e.target.value)} placeholder="100" min="0" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Joylashuv *</label>
          <input className="input-field" value={form.location} onChange={e => set('location', e.target.value)} placeholder="A-1" required />
        </div>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
      </div>
    </form>
  )
}

function stockColor(qty) {
  if (qty === 0) return 'text-red-400'
  if (qty < 20) return 'text-yellow-400'
  return 'text-green-400'
}

export default function Warehouse() {
  const { user } = useAuth()
  const canWrite = user?.role === 'admin' || user?.role === 'manager'
  const { data, loading, error, reload } = useFetch(getWarehouse)
  const { data: prodData } = useFetch(getProducts)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ type: null, target: null })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const products = prodData?.results || prodData || []
  const items = (data?.results || data || []).filter(w =>
    w.product_name?.toLowerCase().includes(search.toLowerCase()) ||
    w.location?.toLowerCase().includes(search.toLowerCase())
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
      if (modal.type === 'create') await createWarehouseItem(form)
      else await updateWarehouseItem(modal.target.id, form)
      closeModal(); reload()
    } catch (err) { handleErr(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (w) => {
    if (!confirm(`"${w.product_name}" ni ombordan o'chirishni tasdiqlaysizmi?`)) return
    try { await deleteWarehouseItem(w.id); reload() }
    catch (err) { alert(err.response?.data?.detail || 'Xato') }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Ombor</h1>
        {canWrite && (
          <button onClick={() => openModal('create')} className="btn-primary">➕ Yangi pozitsiya</button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-value text-white">{items.length}</div>
          <div className="stat-label">Jami pozitsiya</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-green-400">{items.filter(i => i.quantity >= 20).length}</div>
          <div className="stat-label">Yetarli zaxira</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-yellow-400">{items.filter(i => i.quantity > 0 && i.quantity < 20).length}</div>
          <div className="stat-label">Kam zaxira</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-red-400">{items.filter(i => i.quantity === 0).length}</div>
          <div className="stat-label">Tugagan</div>
        </div>
      </div>

      <div className="card">
        <div className="mb-4 max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder="Mahsulot yoki joylashuv..." />
        </div>

        {loading && <LoadingPage />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          items.length === 0 ? <EmptyState icon="🏭" title="Ombor bo'sh" /> : (
            <Table headers={['Mahsulot', 'Kategoriya', 'Joylashuv', 'Miqdor', 'Yangilangan', ...(canWrite ? ['Amallar'] : [])]}>
              {items.map(w => (
                <tr key={w.id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{w.product_image}</span>
                      <span className="text-sm font-medium text-white">{w.product_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="badge-info">{w.product_category || '—'}</span></td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm bg-dark-700 text-gray-300 px-2 py-1 rounded">{w.location}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${stockColor(w.quantity)}`}>{w.quantity} dona</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{new Date(w.last_updated).toLocaleString('uz-UZ')}</td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openModal('edit', w)}
                          className="text-sm px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-gray-300 transition-colors">✏️</button>
                        <button onClick={() => handleDelete(w)}
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

      <Modal open={modal.type === 'create'} onClose={closeModal} title="Yangi omborxona pozitsiyasi">
        <WarehouseForm products={products} onSubmit={handleSave} loading={saving} error={saveError} />
      </Modal>

      <Modal open={modal.type === 'edit'} onClose={closeModal} title="Pozitsiyani tahrirlash">
        {modal.target && (
          <WarehouseForm
            initial={{ product: modal.target.product, quantity: modal.target.quantity, location: modal.target.location }}
            products={products}
            onSubmit={handleSave}
            loading={saving}
            error={saveError}
          />
        )}
      </Modal>
    </div>
  )
}
