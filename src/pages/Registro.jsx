import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Registro() {
  const { registro } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from || '/'

  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    passwordConfirm: '',
    telefono: '',
    direccion: '',
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido'
    if (!form.email.trim()) e.email = 'El email es requerido'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido'
    if (!form.password) e.password = 'La contraseña es requerida'
    else if (form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    if (form.password !== form.passwordConfirm) e.passwordConfirm = 'Las contraseñas no coinciden'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setLoading(true)
    try {
      await registro({
        nombre: form.nombre.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        telefono: form.telefono.trim() || undefined,
        direccion: form.direccion.trim() || undefined,
      })
      toast.success('¡Cuenta creada exitosamente!')
      navigate(from, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || 'Error al crear la cuenta'
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg })
      else toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="card w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-gray-500 text-sm mt-1">Registrate para comenzar a comprar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-field">
              <label className="form-label">Nombre completo<span className="text-red-400 ml-0.5">*</span></label>
              <input type="text" className={`form-input ${errors.nombre ? 'border-red-300' : ''}`} placeholder="Juan Pérez" value={form.nombre} onChange={e => set('nombre', e.target.value)} />
              {errors.nombre && <span className="form-error">{errors.nombre}</span>}
            </div>
            <div className="form-field">
              <label className="form-label">Teléfono</label>
              <input type="tel" className="form-input" placeholder="+54 11 1234-5678" value={form.telefono} onChange={e => set('telefono', e.target.value)} />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Email<span className="text-red-400 ml-0.5">*</span></label>
            <input type="email" className={`form-input ${errors.email ? 'border-red-300' : ''}`} placeholder="tu@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-field">
            <label className="form-label">Dirección</label>
            <input type="text" className="form-input" placeholder="Calle 123, Ciudad" value={form.direccion} onChange={e => set('direccion', e.target.value)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-field">
              <label className="form-label">Contraseña<span className="text-red-400 ml-0.5">*</span></label>
              <input type="password" className={`form-input ${errors.password ? 'border-red-300' : ''}`} placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <div className="form-field">
              <label className="form-label">Repetir contraseña<span className="text-red-400 ml-0.5">*</span></label>
              <input type="password" className={`form-input ${errors.passwordConfirm ? 'border-red-300' : ''}`} placeholder="••••••••" value={form.passwordConfirm} onChange={e => set('passwordConfirm', e.target.value)} />
              {errors.passwordConfirm && <span className="form-error">{errors.passwordConfirm}</span>}
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full justify-center btn-lg mt-2" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Creando cuenta...</> : 'Crear cuenta gratis'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" state={{ from }} className="text-yellow-600 font-medium hover:underline">
            Iniciá sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
