import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { cuentaApi } from '../services/api'
import { useFetch } from '../hooks/useApi'

export default function Cuenta() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab] = useState('perfil')
  const [form, setForm] = useState({ nombre: user?.nombre || '', telefono: user?.telefono || '', direccion: user?.direccion || '' })
  const [pwForm, setPwForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [saving, setSaving] = useState(false)

  const { data: puntos } = useFetch(() => cuentaApi.getPuntos(), [], { initialData: null, showError: false })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setPw = (k, v) => setPwForm(f => ({ ...f, [k]: v }))

  const handleSavePerfil = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return }
    setSaving(true)
    try {
      await cuentaApi.actualizarPerfil({ nombre: form.nombre, telefono: form.telefono, direccion: form.direccion })
      toast.success('Perfil actualizado')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  const handleCambiarPassword = async (e) => {
    e.preventDefault()
    if (!pwForm.actual || !pwForm.nueva) { toast.error('Completá todos los campos'); return }
    if (pwForm.nueva !== pwForm.confirmar) { toast.error('Las contraseñas no coinciden'); return }
    if (pwForm.nueva.length < 6) { toast.error('Mínimo 6 caracteres'); return }
    setSaving(true)
    try {
      await cuentaApi.cambiarPassword(pwForm.actual, pwForm.nueva)
      toast.success('Contraseña actualizada')
      setPwForm({ actual: '', nueva: '', confirmar: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Cerraste sesión')
  }

  const TABS = [
    { id: 'perfil', label: 'Mi perfil' },
    { id: 'password', label: 'Contraseña' },
    { id: 'puntos', label: 'Mis puntos' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center text-2xl font-bold text-black">
          {user?.nombre?.charAt(0)?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{user?.nombre}</h1>
          <p className="text-gray-500 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${tab === t.id ? 'border-yellow-400 text-yellow-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Perfil */}
      {tab === 'perfil' && (
        <form onSubmit={handleSavePerfil} className="card p-6 space-y-4">
          <div className="form-field">
            <label className="form-label">Nombre completo *</label>
            <input className="form-input" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Email</label>
            <input className="form-input bg-gray-50" value={user?.email} disabled />
            <span className="form-error" style={{ color: 'var(--muted)' }}>El email no se puede cambiar</span>
          </div>
          <div className="form-field">
            <label className="form-label">Teléfono</label>
            <input className="form-input" value={form.telefono} onChange={e => set('telefono', e.target.value)} placeholder="+54 11 1234-5678" />
          </div>
          <div className="form-field">
            <label className="form-label">Dirección</label>
            <input className="form-input" value={form.direccion} onChange={e => set('direccion', e.target.value)} placeholder="Calle 123, Ciudad" />
          </div>
          <div className="flex items-center justify-between pt-2">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" onClick={handleLogout} className="btn btn-ghost text-red-500 hover:bg-red-50 text-sm">
              Cerrar sesión
            </button>
          </div>
        </form>
      )}

      {/* Contraseña */}
      {tab === 'password' && (
        <form onSubmit={handleCambiarPassword} className="card p-6 space-y-4">
          <div className="form-field">
            <label className="form-label">Contraseña actual</label>
            <input type="password" className="form-input" value={pwForm.actual} onChange={e => setPw('actual', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Nueva contraseña</label>
            <input type="password" className="form-input" value={pwForm.nueva} onChange={e => setPw('nueva', e.target.value)} />
          </div>
          <div className="form-field">
            <label className="form-label">Confirmar nueva contraseña</label>
            <input type="password" className="form-input" value={pwForm.confirmar} onChange={e => setPw('confirmar', e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Cambiar contraseña'}
          </button>
        </form>
      )}

      {/* Puntos */}
      {tab === 'puntos' && (
        <div className="card p-6">
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-yellow-500 mb-2">
              {puntos?.puntos_actuales ?? user?.puntos_fidelizacion ?? 0}
            </p>
            <p className="text-gray-500 font-medium mb-6">puntos disponibles</p>
            {puntos?.historial?.length > 0 ? (
              <div className="text-left space-y-2 max-h-64 overflow-y-auto">
                {puntos.historial.map((mov, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">{mov.descripcion}</span>
                    <span className={`font-semibold ${mov.puntos > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {mov.puntos > 0 ? '+' : ''}{mov.puntos}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Realizá compras para acumular puntos</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
