import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import useFetch from '../hooks/useFetch'
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories } from '../utils/api'
import { LoadingPage, ErrorMessage, Table, Modal, EmptyState, SearchInput } from '../components/UI'

const EMOJIS = ['👕','👔','👗','👖','🧥','🧒','🏃','🩱','🧤','🧣','👒','🎽','👟','🥾']

function ProductForm({ initial, categories, onSubmit, loading, error }) {
  const def = initial || { name: '', category: '', price: '', stock: '', image: '👕', description: '' }
  const [form, setForm] = useState(def)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Nomi *</label>
        <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Mahsulot nomi" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Kategoriya *</label>
          <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)} required>
            <option value="">Tanlang</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Belgisi</label>
          <select className="input-field" value={form.image} onChange={e => set('image', e.target.value)}>
            {EMOJIS.map(em => <option key={em} value={em}>{em}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Narxi (so'm) *</label>
          <input type="number" className="input-field" value={form.price} onChange={e => set('price', e.target.value)} placeholder="85000" min="0" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Miqdor *</label>
          <input type="number" className="input-field" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="100" min="0" required />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Tavsif</label>
        <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Mahsulot haqida qisqacha..." />
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
      </div>
    </form>
  )
}

export default function Products() {
  const { user } = useAuth()
  const canWrite = user?.role === 'admin' || user?.role === 'manager'
  const { data, loading, error, reload } = useFetch(getProducts)
  const { data: catData } = useFetch(getCategories)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ type: null, target: null })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const categories = catData?.results || catData || []
  const products = (data?.results || data || []).filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category_name || '').toLowerCase().includes(search.toLowerCase())
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
      if (modal.type === 'create') await createProduct(form)
      else await updateProduct(modal.target.id, form)
      closeModal(); reload()
    } catch (err) { handleErr(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (p) => {
    if (!confirm(`"${p.name}" ni o'chirishni tasdiqlaysizmi?`)) return
    try { await deleteProduct(p.id); reload() }
    catch (err) { alert(err.response?.data?.detail || 'Xato') }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Mahsulotlar</h1>
        {canWrite && (
          <button onClick={() => openModal('create')} className="btn-primary">➕ Yangi mahsulot</button>
        )}
      </div>

      <div className="card">
        <div className="mb-4 max-w-sm">
          <SearchInput value={search} onChange={setSearch} placeholder="Mahsulot yoki kategoriya qidirish..." />
        </div>

        {loading && <LoadingPage />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          products.length === 0 ? <EmptyState icon="👔" title="Mahsulot topilmadi" /> : (
            <Table headers={['#', 'Mahsulot', 'Kategoriya', 'Narx', 'Zaxira', "Qo'shilgan", ...(canWrite ? ['Amallar'] : [])]}>
              {products.map((p, i) => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3 text-gray-500 text-sm">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.image || '📦'}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{p.name}</div>
                        {p.description && <div className="text-xs text-gray-500 truncate max-w-48">{p.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className="badge-info">{p.category_name || '—'}</span></td>
                  <td className="px-4 py-3 text-primary font-medium text-sm">{new Intl.NumberFormat('uz-UZ').format(p.price)} so'm</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${p.stock < 20 ? 'text-red-400' : 'text-green-400'}`}>{p.stock} dona</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{new Date(p.created_at).toLocaleDateString('uz-UZ')}</td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openModal('edit', p)}
                          className="text-sm px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-gray-300 transition-colors">✏️</button>
                        <button onClick={() => handleDelete(p)}
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

      <Modal open={modal.type === 'create'} onClose={closeModal} title="Yangi mahsulot">
        <ProductForm categories={categories} onSubmit={handleSave} loading={saving} error={saveError} />
      </Modal>

      <Modal open={modal.type === 'edit'} onClose={closeModal} title="Mahsulotni tahrirlash">
        {modal.target && (
          <ProductForm
            initial={{ name: modal.target.name, category: modal.target.category, price: modal.target.price, stock: modal.target.stock, image: modal.target.image || '👕', description: modal.target.description || '' }}
            categories={categories}
            onSubmit={handleSave}
            loading={saving}
            error={saveError}
          />
        )}
      </Modal>
    </div>
  )
}
