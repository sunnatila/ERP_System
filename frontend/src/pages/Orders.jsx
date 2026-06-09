import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import useFetch from '../hooks/useFetch'
import { getOrders, createOrder, updateOrder, deleteOrder, getProducts, getCustomers } from '../utils/api'
import { LoadingPage, ErrorMessage, Table, Modal, SearchInput, EmptyState, StatusBadge } from '../components/UI'

function OrderForm({ initial, products, customers, onSubmit, loading, error }) {
  const def = initial || { customer: '', product: '', quantity: 1, status: 'pending' }
  const [form, setForm] = useState(def)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const selectedProduct = products.find(p => String(p.id) === String(form.product))
  const totalPrice = selectedProduct && form.quantity ? (Number(selectedProduct.price) * Number(form.quantity)) : 0

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Mijoz *</label>
        <select className="input-field" value={form.customer} onChange={e => set('customer', e.target.value)} required>
          <option value="">Tanlang</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Mahsulot *</label>
        <select className="input-field" value={form.product} onChange={e => set('product', e.target.value)} required>
          <option value="">Tanlang</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.image} {p.name} — {Number(p.price).toLocaleString('uz-UZ')} so'm</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Soni *</label>
          <input type="number" className="input-field" value={form.quantity} onChange={e => set('quantity', e.target.value)} min="1" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Holati</label>
          <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="pending">Kutilmoqda</option>
            <option value="processing">Jarayonda</option>
            <option value="completed">Bajarildi</option>
            <option value="cancelled">Bekor qilindi</option>
          </select>
        </div>
      </div>
      {totalPrice > 0 && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg px-4 py-2 text-sm">
          <span className="text-gray-400">Jami summa: </span>
          <span className="text-primary font-semibold">{totalPrice.toLocaleString('uz-UZ')} so'm</span>
        </div>
      )}
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
      </div>
    </form>
  )
}

export default function Orders() {
  const { user } = useAuth()
  const canWrite = user?.role === 'admin' || user?.role === 'manager'
  const { data, loading, error, reload } = useFetch(getOrders)
  const { data: prodData } = useFetch(getProducts)
  const { data: custData } = useFetch(getCustomers)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modal, setModal] = useState({ type: null, target: null })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const products = prodData?.results || prodData || []
  const customers = custData?.results || custData || []
  const orders = (data?.results || data || []).filter(o => {
    const matchSearch = o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.product_name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  const openModal = (type, target = null) => { setModal({ type, target }); setSaveError('') }
  const closeModal = () => setModal({ type: null, target: null })

  const handleErr = (err) => {
    const d = err.response?.data
    setSaveError(typeof d === 'string' ? d : typeof d === 'object' ? Object.values(d).flat().join(' ') : 'Xato yuz berdi')
  }

  const handleSave = async (form) => {
    setSaving(true); setSaveError('')
    try {
      if (modal.type === 'create') await createOrder(form)
      else await updateOrder(modal.target.id, form)
      closeModal(); reload()
    } catch (err) { handleErr(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (o) => {
    if (!confirm(`#${o.id} buyurtmani o'chirishni tasdiqlaysizmi?`)) return
    try { await deleteOrder(o.id); reload() }
    catch (err) { alert(err.response?.data?.detail || 'Xato') }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Buyurtmalar</h1>
        {canWrite && (
          <button onClick={() => openModal('create')} className="btn-primary">➕ Yangi buyurtma</button>
        )}
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex-1 min-w-48">
            <SearchInput value={search} onChange={setSearch} placeholder="Mijoz yoki mahsulot qidirish..." />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto">
            <option value="all">Barcha holat</option>
            <option value="completed">Bajarildi</option>
            <option value="processing">Jarayonda</option>
            <option value="pending">Kutilmoqda</option>
            <option value="cancelled">Bekor qilindi</option>
          </select>
        </div>

        {loading && <LoadingPage />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && (
          orders.length === 0 ? <EmptyState icon="📦" title="Buyurtma topilmadi" /> : (
            <Table headers={['#', 'Mijoz', 'Mahsulot', 'Soni', 'Summa', 'Holat', 'Sana', ...(canWrite ? ['Amallar'] : [])]}>
              {orders.map(o => (
                <tr key={o.id} className="table-row">
                  <td className="px-4 py-3 text-gray-500 text-sm">#{o.id}</td>
                  <td className="px-4 py-3 text-sm text-white font-medium">{o.customer_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{o.product_image}</span>
                      <span className="text-sm text-gray-300">{o.product_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{o.quantity} ta</td>
                  <td className="px-4 py-3 text-primary text-sm font-medium">{new Intl.NumberFormat('uz-UZ').format(o.total_price)} so'm</td>
                  <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{new Date(o.created_at).toLocaleDateString('uz-UZ')}</td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => openModal('edit', o)}
                          className="text-sm px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-gray-300 transition-colors">✏️</button>
                        <button onClick={() => handleDelete(o)}
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

      <Modal open={modal.type === 'create'} onClose={closeModal} title="Yangi buyurtma">
        <OrderForm products={products} customers={customers} onSubmit={handleSave} loading={saving} error={saveError} />
      </Modal>

      <Modal open={modal.type === 'edit'} onClose={closeModal} title="Buyurtmani tahrirlash">
        {modal.target && (
          <OrderForm
            initial={{ customer: modal.target.customer, product: modal.target.product, quantity: modal.target.quantity, status: modal.target.status }}
            products={products}
            customers={customers}
            onSubmit={handleSave}
            loading={saving}
            error={saveError}
          />
        )}
      </Modal>
    </div>
  )
}
