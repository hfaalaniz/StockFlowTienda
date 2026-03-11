import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

export default function CarritoDrawer({ open, onClose }) {
  const { items, total, quitar, cambiarCantidad } = useCart()

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm shadow-2xl z-50 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ background: 'var(--surface)', borderLeft: '1px solid var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-lg font-bold" style={{ color: 'var(--text)' }}>Carrito de compras</h2>
            {items.length > 0 && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {items.length} {items.length === 1 ? 'producto' : 'productos'}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition"
            style={{ color: 'var(--muted)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-16 px-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'var(--surface2)' }}
              >
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="font-semibold mb-1" style={{ color: 'var(--text)' }}>Tu carrito está vacío</p>
              <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>Agregá productos para comenzar</p>
              <button
                onClick={onClose}
                className="btn btn-primary btn-sm rounded-full"
              >
                Ver catálogo
              </button>
            </div>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className="flex gap-0 mx-3 mb-3 rounded-xl overflow-hidden"
                style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
              >
                {/* Imagen */}
                <div
                  className="shrink-0 flex items-center justify-center overflow-hidden"
                  style={{
                    width: 80,
                    minHeight: 80,
                    background: 'var(--surface2)',
                    borderRight: '1px solid var(--border)',
                  }}
                >
                  {item.imagen_url ? (
                    <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 p-3 min-w-0">
                  <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text)' }}>
                    {item.nombre}
                  </p>
                  <p className="text-sm font-bold mt-0.5" style={{ color: 'var(--accent)' }}>
                    {fmt(item.precio * item.cantidad)}
                  </p>
                  {item.cantidad > 1 && (
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>
                      {fmt(item.precio)} × {item.cantidad}
                    </p>
                  )}

                  {/* Controles cantidad */}
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="flex items-center rounded-lg overflow-hidden"
                      style={{ border: '1px solid var(--border)' }}
                    >
                      <button
                        onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                        className="transition"
                        style={{ padding: '3px 10px', color: 'var(--text)', background: 'transparent', fontSize: 16 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        −
                      </button>
                      <span
                        className="text-sm font-semibold text-center"
                        style={{
                          minWidth: 28,
                          padding: '3px 4px',
                          borderLeft: '1px solid var(--border)',
                          borderRight: '1px solid var(--border)',
                          color: 'var(--text)',
                        }}
                      >
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                        className="transition"
                        style={{ padding: '3px 10px', color: 'var(--text)', background: 'transparent', fontSize: 16 }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => quitar(item.id)}
                      className="transition"
                      style={{ color: 'var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--danger, #ef4444)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--border)'}
                      title="Quitar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-5 py-4 space-y-3" style={{ borderTop: '1px solid var(--border)' }}>
            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--muted)' }}>Total estimado</span>
              <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{fmt(total)}</span>
            </div>

            {/* Botón principal estilo eBay */}
            <Link
              to="/checkout"
              onClick={onClose}
              className="w-full font-bold text-base rounded-full flex items-center justify-center transition"
              style={{
                padding: '13px 0',
                background: 'var(--accent)',
                color: '#fff',
                textDecoration: 'none',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              ¡Finalizar compra!
            </Link>

            {/* Botón secundario con borde */}
            <Link
              to="/carrito"
              onClick={onClose}
              className="w-full font-semibold text-sm rounded-full flex items-center justify-center transition"
              style={{
                padding: '11px 0',
                background: 'transparent',
                color: 'var(--accent)',
                border: '2px solid var(--accent)',
                textDecoration: 'none',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--accent)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--accent)'
              }}
            >
              Ver carrito completo
            </Link>

            {/* Nota de seguridad */}
            <div className="flex items-center justify-center gap-1.5 text-xs" style={{ color: 'var(--muted)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Compra 100% segura
            </div>
          </div>
        )}
      </div>
    </>
  )
}
