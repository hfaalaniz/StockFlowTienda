import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { checkoutApi } from '../services/api'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

const METODOS = [
  {
    id: 'mercadopago',
    label: 'Mercado Pago',
    desc: 'Tarjeta, efectivo, cuotas',
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none">
        <rect width="24" height="24" rx="4" fill="#009EE3"/>
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold">MP</text>
      </svg>
    ),
  },
  {
    id: 'stripe',
    label: 'Tarjeta crédito/débito',
    desc: 'Visa, Mastercard, Amex',
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
        <rect width="24" height="24" rx="4" fill="#635BFF"/>
        <text x="12" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">Stripe</text>
      </svg>
    ),
  },
  {
    id: 'transferencia',
    label: 'Transferencia bancaria',
    desc: 'CBU/CVU, pago manual',
    icon: (
      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
  },
  {
    id: 'efectivo',
    label: 'Efectivo / Retiro en local',
    desc: 'Pagás al retirar en el local',
    icon: (
      <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
]

export default function Checkout() {
  const { items, total, vaciar } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1) // 1: datos, 2: pago, 3: confirmando
  const [metodoPago, setMetodoPago] = useState('')
  const [loading, setLoading] = useState(false)

  const [datos, setDatos] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    telefono: user?.telefono || '',
    direccion: '',
    notas: '',
  })

  const setD = (k, v) => setDatos(d => ({ ...d, [k]: v }))

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Tu carrito está vacío</h2>
        <Link to="/catalogo" className="btn btn-primary">Ver catálogo</Link>
      </div>
    )
  }

  const handleConfirmar = async () => {
    if (!metodoPago) { toast.error('Seleccioná un método de pago'); return }
    if (!datos.nombre || !datos.email) { toast.error('Completá tus datos'); return }

    setLoading(true)
    try {
      const body = {
        items: items.map(i => ({ producto_id: i.id, cantidad: i.cantidad, precio_unit: i.precio })),
        total,
        metodo_pago: metodoPago,
        cliente_email: datos.email,
        cliente_nombre: datos.nombre,
        cliente_telefono: datos.telefono,
        direccion_entrega: datos.direccion,
        notas: datos.notas,
      }

      const res = await checkoutApi.crearOrden(body)
      const orden = res.data

      // Redirigir según método de pago
      if (metodoPago === 'mercadopago') {
        const linkRes = await checkoutApi.getLinkMercadoPago(orden.id)
        const link = linkRes.data?.link || linkRes.data?.init_point
        if (!link) throw new Error('No se pudo obtener el link de pago de Mercado Pago')
        window.location.href = link
        return
      }

      vaciar()
      navigate(`/pago-exitoso?orden=${orden.numero || orden.id}&metodo=${metodoPago}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al procesar la orden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Finalizar compra</h1>

      {/* Pasos */}
      <div className="flex items-center gap-2 mb-8">
        {['Tus datos', 'Método de pago', 'Confirmación'].map((label, i) => (
          <React.Fragment key={label}>
            <button
              onClick={() => step > i + 1 && setStep(i + 1)}
              className={`flex items-center gap-2 text-sm font-medium ${step >= i + 1 ? 'text-gray-900' : 'text-gray-400'}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-yellow-400 text-black' : 'bg-gray-200 text-gray-400'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </button>
            {i < 2 && <div className={`flex-1 h-px max-w-12 ${step > i + 1 ? 'bg-green-300' : 'bg-gray-200'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario */}
        <div className="lg:col-span-2">
          {/* Paso 1: Datos */}
          {step === 1 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-lg mb-2">Tus datos</h2>
              {!user && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Comprás como invitado.{' '}
                  <Link to="/login" state={{ from: '/checkout' }} className="underline font-medium">Iniciá sesión</Link>
                  {' '}para guardar tu historial.
                </div>
              )}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="form-field">
                  <label className="form-label">Nombre completo *</label>
                  <input className="form-input" value={datos.nombre} onChange={e => setD('nombre', e.target.value)} placeholder="Juan Pérez" />
                </div>
                <div className="form-field">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" value={datos.email} onChange={e => setD('email', e.target.value)} placeholder="tu@email.com" />
                </div>
                <div className="form-field">
                  <label className="form-label">Teléfono</label>
                  <input className="form-input" value={datos.telefono} onChange={e => setD('telefono', e.target.value)} placeholder="+54 11 1234-5678" />
                </div>
                <div className="form-field">
                  <label className="form-label">Dirección de entrega</label>
                  <input className="form-input" value={datos.direccion} onChange={e => setD('direccion', e.target.value)} placeholder="Calle 123, Ciudad" />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Notas adicionales</label>
                <textarea className="form-input resize-none" rows={2} value={datos.notas} onChange={e => setD('notas', e.target.value)} placeholder="Indicaciones especiales para la entrega..." />
              </div>
              <button
                onClick={() => {
                  if (!datos.nombre || !datos.email) { toast.error('Completá nombre y email'); return }
                  setStep(2)
                }}
                className="btn btn-primary btn-lg"
              >
                Continuar →
              </button>
            </div>
          )}

          {/* Paso 2: Método de pago */}
          {step === 2 && (
            <div className="card p-6 space-y-4">
              <h2 className="font-semibold text-lg mb-2">Método de pago</h2>
              <div className="space-y-3">
                {METODOS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMetodoPago(m.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition text-left ${metodoPago === m.id ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="shrink-0">{m.icon}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{m.label}</p>
                      <p className="text-sm text-gray-500">{m.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${metodoPago === m.id ? 'border-yellow-400' : 'border-gray-300'}`}>
                      {metodoPago === m.id && <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Formulario Stripe */}
              {metodoPago === 'stripe' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
                  El formulario de tarjeta se mostrará al confirmar la orden. Serás redirigido a Stripe de forma segura.
                </div>
              )}

              {/* Info transferencia */}
              {metodoPago === 'transferencia' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                  <p className="font-medium mb-2">Datos bancarios:</p>
                  {import.meta.env.VITE_TRANSFER_CBU && (
                    <p>CBU: <span className="font-mono font-medium">{import.meta.env.VITE_TRANSFER_CBU}</span></p>
                  )}
                  {import.meta.env.VITE_TRANSFER_ALIAS && (
                    <p>Alias: <span className="font-mono font-medium">{import.meta.env.VITE_TRANSFER_ALIAS}</span></p>
                  )}
                  {!import.meta.env.VITE_TRANSFER_CBU && !import.meta.env.VITE_TRANSFER_ALIAS && (
                    <p className="text-amber-600">Contactanos para recibir los datos bancarios.</p>
                  )}
                  <p className="text-gray-500 mt-1 text-xs">Tu pedido quedará en estado "pendiente" hasta confirmar el pago.</p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn btn-secondary">← Volver</button>
                <button onClick={() => setStep(3)} className="btn btn-primary flex-1 justify-center" disabled={!metodoPago}>
                  Confirmar →
                </button>
              </div>
            </div>
          )}

          {/* Paso 3: Confirmación */}
          {step === 3 && (
            <div className="card p-6 space-y-5">
              <h2 className="font-semibold text-lg">Revisá tu pedido</h2>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nombre</span>
                  <span className="font-medium">{datos.nombre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium">{datos.email}</span>
                </div>
                {datos.telefono && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Teléfono</span>
                    <span className="font-medium">{datos.telefono}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Método de pago</span>
                  <span className="font-medium">{METODOS.find(m => m.id === metodoPago)?.label}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="btn btn-secondary">← Volver</button>
                <button
                  onClick={handleConfirmar}
                  className="btn btn-primary flex-1 justify-center btn-lg"
                  disabled={loading}
                >
                  {loading
                    ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Procesando...</>
                    : metodoPago === 'mercadopago'
                      ? 'Ir a Mercado Pago →'
                      : 'Confirmar pedido'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Resumen lateral */}
        <div>
          <div className="card p-5 sticky top-24">
            <h3 className="font-semibold mb-4">Tu pedido</h3>
            <div className="space-y-2.5 text-sm text-gray-600 mb-4 max-h-56 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="truncate">{item.nombre} ×{item.cantidad}</span>
                  <span className="shrink-0 font-medium">{fmt(item.precio * item.cantidad)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">{fmt(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
