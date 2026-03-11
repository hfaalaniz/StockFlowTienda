import React from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const MENSAJES = {
  mercadopago: { titulo: '¡Pago procesado!', desc: 'Tu pago con Mercado Pago fue confirmado exitosamente.' },
  stripe: { titulo: '¡Pago aprobado!', desc: 'Tu pago con tarjeta fue procesado exitosamente.' },
  transferencia: { titulo: '¡Pedido recibido!', desc: 'Tu pedido está pendiente. Confirmá el pago realizando la transferencia bancaria.' },
  efectivo: { titulo: '¡Pedido confirmado!', desc: 'Tu pedido está listo. Pasá a retirarlo y abonalo en el local.' },
}

export default function PagoExitoso() {
  const [params] = useSearchParams()
  const orden = params.get('orden') || '—'
  const metodo = params.get('metodo') || 'efectivo'
  const { titulo, desc } = MENSAJES[metodo] || MENSAJES.efectivo

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-gray-900 mb-3">{titulo}</h1>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{desc}</p>

      <div className="card inline-block px-8 py-5 mb-8">
        <p className="text-sm text-gray-500 mb-1">Número de orden</p>
        <p className="text-2xl font-mono font-bold text-gray-900">{orden}</p>
      </div>

      {metodo === 'transferencia' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-8 text-left max-w-sm mx-auto">
          <p className="font-semibold text-amber-800 mb-2">Datos para transferir:</p>
          {import.meta.env.VITE_TRANSFER_CBU && (
            <p className="text-sm text-amber-700">CBU: <span className="font-mono">{import.meta.env.VITE_TRANSFER_CBU}</span></p>
          )}
          {import.meta.env.VITE_TRANSFER_ALIAS && (
            <p className="text-sm text-amber-700">Alias: <span className="font-mono">{import.meta.env.VITE_TRANSFER_ALIAS}</span></p>
          )}
          {!import.meta.env.VITE_TRANSFER_CBU && !import.meta.env.VITE_TRANSFER_ALIAS && (
            <p className="text-sm text-amber-700">Contactanos para recibir los datos bancarios.</p>
          )}
          <p className="text-xs text-amber-600 mt-2">Indicá el número de orden en el concepto.</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/mis-compras" className="btn btn-primary btn-lg">
          Ver mis compras
        </Link>
        <Link to="/catalogo" className="btn btn-secondary btn-lg">
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
