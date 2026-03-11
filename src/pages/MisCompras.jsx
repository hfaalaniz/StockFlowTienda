import React from 'react'
import { Link } from 'react-router-dom'
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

const ESTADO_LABEL = {
  completada: 'Completada',
  pendiente: 'Pendiente de pago',
  pendiente_retiro: 'Pendiente de retiro',
  anulada: 'Anulada',
}

export default function MisCompras() {
  const { data: resp, loading } = useFetch(() => misComprasApi.listar(), [], { initialData: null })
  const ordenes = Array.isArray(resp) ? resp : (Array.isArray(resp?.data) ? resp.data : [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Mis compras</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-100 rounded w-32" />
                <div className="h-5 bg-gray-100 rounded w-20" />
              </div>
              <div className="h-3 bg-gray-100 rounded w-48 mt-3" />
              <div className="h-6 bg-gray-100 rounded w-24 mt-4" />
            </div>
          ))}
        </div>
      ) : ordenes.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-400 font-medium mb-4">Aún no realizaste compras</p>
          <Link to="/catalogo" className="btn btn-primary">Ver catálogo</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {ordenes.map(orden => (
            <Link key={orden.id} to={`/mis-compras/${orden.id}`} className="card p-5 block hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-sm text-gray-500">{orden.numero}</p>
                  <p className="font-semibold text-gray-900 mt-0.5">
                    {format(new Date(orden.fecha || orden.created_at), "d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">{orden.items?.length ?? 0} producto(s)</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold">{fmt(orden.total)}</p>
                  <span className={`badge ${ESTADO_BADGE[orden.estado] || 'badge-muted'} mt-1`}>
                    {ESTADO_LABEL[orden.estado] || orden.estado}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
