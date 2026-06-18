import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import useFetch from '../hooks/useFetch'
import { getUsers, createUser, updateUser, deleteUser, updateProfile } from '../utils/api'
import { LoadingPage, ErrorMessage, Table, Modal, EmptyState, RoleBadge, StatusBadge } from '../components/UI'

function CreateUserForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({ username: '', full_name: '', password: '', role: 'viewer' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Username *</label>
        <input className="input-field" value={form.username} onChange={e => set('username', e.target.value)} placeholder="foydalanuvchi_nomi" required />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">To'liq ismi</label>
        <input className="input-field" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Ism Familiya" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Parol *</label>
        <input type="password" className="input-field" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Kamida 6 belgi" required minLength={6} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Rol *</label>
        <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)}>
          <option value="viewer">Kuzatuvchi</option>
          <option value="manager">Menejer</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saqlanmoqda...' : 'Yaratish'}</button>
      </div>
    </form>
  )
}

function EditUserForm({ user: u, isSuperAdmin, onSubmit, loading, error }) {
  const [form, setForm] = useState({ full_name: u.full_name || '', role: u.role, password: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">To'liq ismi</label>
        <input className="input-field" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Ism Familiya" />
      </div>
      {!u.is_superuser && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Rol</label>
          <select className="input-field" value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="viewer">Kuzatuvchi</option>
            <option value="manager">Menejer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Yangi parol (bo'sh qoldirsangiz o'zgarmaydi)</label>
        <input type="password" className="input-field" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Kamida 6 belgi" minLength={6} />
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
      </div>
    </form>
  )
}

function ProfileForm({ user: u, onSubmit, loading, error }) {
  const [form, setForm] = useState({ full_name: u.full_name || '', password: '' })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">To'liq ismi</label>
        <input className="input-field" value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Ism Familiya" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
        <div className="input-field bg-dark-900 text-gray-500 cursor-not-allowed">{u.username}</div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Yangi parol (bo'sh qoldirsangiz o'zgarmaydi)</label>
        <input type="password" className="input-field" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Kamida 6 belgi" minLength={6} />
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">{error}</div>}
      <div className="flex justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Saqlanmoqda...' : 'Saqlash'}</button>
      </div>
    </form>
  )
}

export default function Users() {
  const { user: me, refreshUser } = useAuth()
  const { data, loading, error, reload } = useFetch(getUsers)
  const [modal, setModal] = useState({ type: null, target: null })
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const users = data || []

  const openModal = (type, target = null) => { setModal({ type, target }); setSaveError('') }
  const closeModal = () => setModal({ type: null, target: null })

  const handleErr = (err) => {
    const d = err.response?.data
    setSaveError(typeof d === 'string' ? d : typeof d === 'object' ? Object.values(d).flat().join(' ') : 'Xato yuz berdi')
  }

  const handleCreate = async (form) => {
    setSaving(true); setSaveError('')
    try { await createUser(form); closeModal(); reload() }
    catch (err) { handleErr(err) }
    finally { setSaving(false) }
  }

  const handleEdit = async (form) => {
    setSaving(true); setSaveError('')
    const payload = { full_name: form.full_name, role: form.role }
    if (form.password) payload.password = form.password
    try { await updateUser(modal.target.id, payload); closeModal(); reload() }
    catch (err) { handleErr(err) }
    finally { setSaving(false) }
  }

  const handleProfile = async (form) => {
    setSaving(true); setSaveError('')
    const payload = { full_name: form.full_name }
    if (form.password) payload.password = form.password
    try { await updateProfile(payload); await refreshUser(); closeModal() }
    catch (err) { handleErr(err) }
    finally { setSaving(false) }
  }

  const handleToggleActive = async (u) => {
    if (!me.is_superuser) return
    try { await updateUser(u.id, { is_active: !u.is_active }); reload() }
    catch (err) { alert(err.response?.data?.detail || 'Xato') }
  }

  const handleDelete = async (u) => {
    if (!confirm(`"${u.username}" ni o'chirishni tasdiqlaysizmi?`)) return
    try { await deleteUser(u.id); reload() }
    catch (err) { alert(err.response?.data?.detail || 'Xato') }
  }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Foydalanuvchilar</h1>
        <button onClick={() => openModal('create')} className="btn-primary">
          ➕ Yangi foydalanuvchi
        </button>
      </div>

      <div className="card">
        {loading && <LoadingPage />}
        {error && <ErrorMessage message={error} />}

        {!loading && !error && (
          users.length === 0 ? <EmptyState icon="👤" title="Foydalanuvchi yo'q" /> : (
            <Table headers={['Username', "To'liq ismi", 'Rol', 'Holat', "Qo'shilgan", 'Amallar']}>
              {users.map(u => (
                <tr key={u.id} className="table-row">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                        {(u.full_name || u.username)[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-white">{u.username}</span>
                        {u.is_superuser && <span className="ml-1 text-xs text-yellow-400" title="Super Admin">👑</span>}
                        {u.id === me?.id && <span className="ml-1 text-xs text-gray-500">(siz)</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{u.full_name || '—'}</td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-4 py-3"><StatusBadge status={u.is_active ? 'active' : 'inactive'} /></td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('uz-UZ')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {/* Edit profile (own) */}
                      {u.id === me?.id && (
                        <button onClick={() => openModal('profile', u)} title="Profilni tahrirlash"
                          className="text-sm px-2 py-1 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors">
                          ✏️
                        </button>
                      )}
                      {/* Edit user (other) — can't edit super admin unless you're also super admin */}
                      {u.id !== me?.id && (!u.is_superuser || me?.is_superuser) && (
                        <button onClick={() => openModal('edit', u)} title="Tahrirlash"
                          className="text-sm px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-gray-300 transition-colors">
                          ✏️
                        </button>
                      )}
                      {/* Toggle active — only super admin, not self */}
                      {me?.is_superuser && u.id !== me?.id && (
                        <button onClick={() => handleToggleActive(u)}
                          title={u.is_active ? 'Nofaol qilish' : 'Faol qilish'}
                          className="text-sm px-2 py-1 rounded bg-dark-700 hover:bg-dark-600 text-gray-300 transition-colors">
                          {u.is_active ? '🔒' : '🔓'}
                        </button>
                      )}
                      {/* Delete — not self, not super admin */}
                      {u.id !== me?.id && !u.is_superuser && (
                        <button onClick={() => handleDelete(u)} title="O'chirish"
                          className="text-sm px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors">
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )
        )}
      </div>

      <Modal open={modal.type === 'create'} onClose={closeModal} title="Yangi foydalanuvchi">
        <CreateUserForm onSubmit={handleCreate} loading={saving} error={saveError} />
      </Modal>

      <Modal open={modal.type === 'edit'} onClose={closeModal} title="Foydalanuvchini tahrirlash">
        {modal.target && (
          <EditUserForm user={modal.target} isSuperAdmin={me?.is_superuser} onSubmit={handleEdit} loading={saving} error={saveError} />
        )}
      </Modal>

      <Modal open={modal.type === 'profile'} onClose={closeModal} title="Profilni tahrirlash">
        {modal.target && (
          <ProfileForm user={modal.target} onSubmit={handleProfile} loading={saving} error={saveError} />
        )}
      </Modal>
    </div>
  )
}
