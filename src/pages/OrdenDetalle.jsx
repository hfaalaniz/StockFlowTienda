import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { misComprasApi } from '../services/api'
import { useFetch } from '../hooks/useApi'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

const ESTADO_BADGE = {
  completada: 'badge-success',
  pendiente: 'badge-warning',
  pendiente_retiro: 'badge-warning',
  anulada: 'badge-danger',
}

export default function OrdenDetalle() {
  const { id } = useParams()
  const { data: orden, loading } = useFetch(() => misComprasApi.getOrden(id), [id])

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  if (!orden) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400">Orden no encontrada.</p>
        <Link to="/mis-compras" className="btn btn-primary mt-4">Mis compras</Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link to="/mis-compras" className="text-sm text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-2">
            ← Volver a mis compras
          </Link>
          <h1 className="text-2xl font-bold">{orden.numero}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {orden.fecha && format(new Date(orden.fecha), "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}
          </p>
        </div>
        <span className={`badge ${ESTADO_BADGE[orden.estado] || 'badge-muted'} text-sm`}>
          {orden.estado}
        </span>
      </div>

      {/* Items */}
      <div className="card p-5 mb-5">
        <h2 className="font-semibold mb-4">Productos</h2>
        <div className="space-y-4">
          {(orden.items || []).map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center shrink-0">
                {item.imagen_url ? (
                  <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{item.nombre || item.producto_nombre}</p>
                <p className="text-sm text-gray-500">{fmt(item.precio_unit)} × {item.cantidad}</p>
              </div>
              <p className="font-semibold">{fmt(item.precio_unit * item.cantidad)}</p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 mt-5 pt-4 flex justify-between">
          <span className="font-semibold">Total pagado</span>
          <span className="text-xl font-bold">{fmt(orden.total)}</span>
        </div>
      </div>

      {/* Detalles */}
      <div className="card p-5">
        <h2 className="font-semibold mb-4">Detalles del pedido</h2>
        <div className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Método de pago</span>
            <span className="font-medium capitalize">{orden.metodo_pago?.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Estado de pago</span>
            <span className="font-medium capitalize">{orden.estado_pago || '—'}</span>
          </div>
          {orden.notas && (
            <div className="flex justify-between">
              <span className="text-gray-500">Notas</span>
              <span className="font-medium text-right max-w-xs">{orden.notas}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
