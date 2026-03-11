import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { catalogoApi } from '../services/api'

// Hook de stock en tiempo real con polling por producto
function useStockItem(productoId, stockInicial) {
  const [stock, setStock] = useState(stockInicial ?? null)
  const [actualizando, setActualizando] = useState(false)

  const fetchStock = useCallback(async () => {
    if (!productoId) return
    try {
      setActualizando(true)
      const res = await catalogoApi.getStock(productoId)
      setStock(res.data.stock)
    } catch {
      // mantener último valor conocido
    } finally {
      setActualizando(false)
    }
  }, [productoId])

  useEffect(() => {
    if (stockInicial != null) setStock(stockInicial)
  }, [stockInicial])

  useEffect(() => {
    if (!productoId) return
    const id = setInterval(fetchStock, 30_000)
    return () => clearInterval(id)
  }, [productoId, fetchStock])

  return { stock, actualizando }
}

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

const FAVORITOS_KEY = 'sf_favoritos'
function getFavoritos() {
  try { return JSON.parse(localStorage.getItem(FAVORITOS_KEY) || '[]') } catch { return [] }
}
function toggleFavorito(id) {
  const favs = getFavoritos()
  const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]
  localStorage.setItem(FAVORITOS_KEY, JSON.stringify(next))
  return next.includes(id)
}

// Componente de botón compartir por item
function ShareButton({ item }) {
  const [open, setOpen] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  const url = `${window.location.origin}/productos/${item.id}`
  const urlEnc = encodeURIComponent(url)
  const titEnc = encodeURIComponent(item.nombre)

  const redes = [
    {
      label: 'WhatsApp', color: '#25D366',
      href: `https://wa.me/?text=${titEnc}%20${urlEnc}`,
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
    },
    {
      label: 'Facebook', color: '#1877F2',
      href: `https://www.facebook.com/sharer/sharer.php?u=${urlEnc}`,
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    },
    {
      label: 'Twitter/X', color: '#000',
      href: `https://twitter.com/intent/tweet?text=${titEnc}&url=${urlEnc}`,
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
    },
    {
      label: 'Telegram', color: '#2CA5E0',
      href: `https://t.me/share/url?url=${urlEnc}&text=${titEnc}`,
      icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>,
    },
  ]

  const handleCopiar = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiado(true)
      setTimeout(() => { setCopiado(false); setOpen(false) }, 1800)
    })
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Compartir"
        className="flex items-center gap-1 text-xs transition hover:underline"
        style={{ color: 'var(--muted)', background: 'transparent' }}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Compartir
      </button>
      {open && (
        <div
          className="absolute right-0 bottom-full mb-2 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{
            width: 180,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
          }}
        >
          <p className="text-xs font-semibold px-3 pt-2.5 pb-1.5" style={{ color: 'var(--muted)' }}>Compartir</p>
          {redes.map(r => (
            <a
              key={r.label}
              href={r.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 text-xs transition"
              style={{ color: 'var(--text)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              onClick={() => setOpen(false)}
            >
              <span style={{ color: r.color }}>{r.icon}</span>
              {r.label}
            </a>
          ))}
          <button
            onClick={handleCopiar}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs transition"
            style={{
              color: copiado ? '#27ae60' : 'var(--text)',
              background: 'transparent',
              borderTop: '1px solid var(--border)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {copiado
              ? <><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>¡Copiado!</>
              : <><svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--muted)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Copiar enlace</>
            }
          </button>
        </div>
      )}
    </div>
  )
}

// Componente de botón favorito por item
function FavButton({ itemId }) {
  const [fav, setFav] = useState(() => getFavoritos().includes(itemId))
  const handle = () => setFav(toggleFavorito(itemId))
  return (
    <button
      onClick={handle}
      title={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className="flex items-center gap-1 text-xs transition hover:underline"
      style={{ color: fav ? '#e74c3c' : 'var(--muted)', background: 'transparent' }}
    >
      <svg className="w-3.5 h-3.5" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      {fav ? 'En favoritos' : 'Favorito'}
    </button>
  )
}

// ── Componente de un item del carrito (necesita ser componente para poder usar el hook) ──
function ItemCarrito({ item, cambiarCantidad, quitar }) {
  const { stock: stockRT, actualizando } = useStockItem(item.id, item.stock)
  const stockMostrar = stockRT ?? item.stock

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex gap-0">
        {/* ── Columna izquierda: imagen + thumb ── */}
        <div className="flex flex-col shrink-0" style={{ borderRight: '1px solid var(--border)' }}>
          <div
            className="flex items-center justify-center overflow-hidden"
            style={{ width: 140, height: 140, background: 'var(--surface2)' }}
          >
            {item.imagen_url ? (
              <img src={item.imagen_url} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            )}
          </div>
          <div
            className="flex flex-col items-center gap-1 py-1.5"
            style={{ background: 'var(--surface2)', borderTop: '1px solid var(--border)' }}
          >
            <div style={{ width: 32, height: 32, borderRadius: 5, overflow: 'hidden', border: '2px solid var(--accent)', background: 'var(--surface)' }}>
              {item.imagen_url
                ? <img src={item.imagen_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', background: 'var(--border)' }} />}
            </div>
            <Link to={`/productos/${item.id}`} title="Ver todas las imágenes"
              style={{ fontSize: 9, color: 'var(--accent)', lineHeight: 1.2, textAlign: 'center', padding: '0 4px' }}>
              Ver más
            </Link>
          </div>
        </div>

        {/* ── Info central ── */}
        <div className="flex-1 p-4 min-w-0">
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>
            Estado: <span style={{ color: 'var(--text)' }}>Nuevo</span>
          </p>

          <Link to={`/productos/${item.id}`}
            className="font-semibold text-base leading-snug hover:underline transition"
            style={{ color: 'var(--text)' }}>
            {item.nombre}
          </Link>

          {/* Stock en tiempo real */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {stockMostrar > 0 ? (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: stockMostrar <= 5 ? '#fff0f0' : stockMostrar <= 15 ? '#fffbeb' : '#f0fdf4',
                    color: stockMostrar <= 5 ? '#e74c3c' : stockMostrar <= 15 ? '#d97706' : '#16a34a',
                    border: `1px solid ${stockMostrar <= 5 ? '#fca5a5' : stockMostrar <= 15 ? '#fcd34d' : '#86efac'}`,
                  }}
                >
                  {stockMostrar <= 5
                    ? `¡Solo ${stockMostrar} ${stockMostrar === 1 ? 'unidad' : 'unidades'}!`
                    : `${stockMostrar} disponibles`}
                </span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <span className="text-xs font-semibold" style={{ color: '#e74c3c' }}>Sin stock</span>
              </>
            )}
            <svg className={`w-3 h-3 shrink-0 ${actualizando ? 'animate-spin' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ color: 'var(--border)' }} title="Stock en tiempo real">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>

          {/* Precio unitario */}
          <p className="text-sm mt-2" style={{ color: 'var(--muted)' }}>
            {fmt(item.precio)} <span className="text-xs">c/u</span>
          </p>

          {/* Controles cantidad */}
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm" style={{ color: 'var(--muted)' }}>Cantidad:</span>
            <div className="flex items-center rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              <button onClick={() => cambiarCantidad(item.id, item.cantidad - 1)}
                className="transition font-semibold"
                style={{ padding: '6px 14px', color: 'var(--text)', background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>−</button>
              <span className="text-sm font-semibold text-center"
                style={{ minWidth: 36, padding: '6px 4px', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)', color: 'var(--text)' }}>
                {item.cantidad}
              </span>
              <button onClick={() => cambiarCantidad(item.id, item.cantidad + 1)}
                className="transition font-semibold"
                style={{ padding: '6px 14px', color: 'var(--text)', background: 'transparent' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>+</button>
            </div>
          </div>

          {/* Acciones secundarias */}
          <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <FavButton itemId={item.id} />
            <ShareButton item={item} />
          </div>
        </div>

        {/* ── Columna derecha: subtotal + quitar ── */}
        <div className="flex flex-col items-end justify-between p-4 shrink-0" style={{ minWidth: 120 }}>
          <div className="text-right">
            <p className="text-xl font-bold" style={{ color: 'var(--accent)' }}>
              {fmt(item.precio * item.cantidad)}
            </p>
            {item.cantidad > 1 && (
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                {fmt(item.precio)} × {item.cantidad}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1.5 mt-auto">
            <button onClick={() => quitar(item.id)}
              className="text-xs transition hover:underline"
              style={{ color: 'var(--danger, #ef4444)' }}>Quitar</button>
            <Link to={`/productos/${item.id}`}
              className="text-xs transition hover:underline"
              style={{ color: 'var(--accent)' }}>Ver producto</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Carrito() {
  const { items, total, quitar, cambiarCantidad, vaciar } = useCart()
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ background: 'var(--surface2)' }}>
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>Tu carrito está vacío</h2>
        <p className="mb-8" style={{ color: 'var(--muted)' }}>¡Agregá productos para comenzar a comprar!</p>
        <Link to="/catalogo" className="btn btn-primary btn-lg">Ver catálogo</Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Carrito de compras</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
            {items.length} {items.length === 1 ? 'producto' : 'productos'} en tu carrito
          </p>
        </div>
        <button
          onClick={vaciar}
          className="text-sm transition hover:underline"
          style={{ color: 'var(--danger, #ef4444)' }}
        >
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <ItemCarrito
              key={item.id}
              item={item}
              cambiarCantidad={cambiarCantidad}
              quitar={quitar}
            />
          ))}
        </div>

        {/* ── Panel resumen ── */}
        <div className="lg:col-span-1">
          <div
            className="rounded-xl sticky top-24"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>Resumen de compra</h3>
            </div>

            <div className="px-5 py-4 space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-start gap-2 text-sm">
                  <span className="leading-tight" style={{ color: 'var(--muted)', flex: 1 }}>
                    {item.nombre}
                    {item.cantidad > 1 && <span className="ml-1 font-medium" style={{ color: 'var(--text)' }}>×{item.cantidad}</span>}
                  </span>
                  <span className="shrink-0 font-semibold" style={{ color: 'var(--text)' }}>
                    {fmt(item.precio * item.cantidad)}
                  </span>
                </div>
              ))}

              <div className="flex justify-between text-sm pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted)' }}>Envío</span>
                <span className="font-medium" style={{ color: '#27ae60' }}>A consultar</span>
              </div>

              <div className="flex items-center justify-between pt-3" style={{ borderTop: '2px solid var(--border)' }}>
                <span className="font-bold text-base" style={{ color: 'var(--text)' }}>Total</span>
                <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{fmt(total)}</span>
              </div>
            </div>

            <div className="px-5 pb-5 space-y-2.5">
              <button
                onClick={() => navigate('/checkout')}
                className="w-full font-bold text-base rounded-full transition"
                style={{
                  padding: '13px 0',
                  background: 'var(--accent)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                ¡Finalizar compra!
              </button>

              <Link
                to="/catalogo"
                className="w-full font-semibold text-sm rounded-full flex items-center justify-center transition"
                style={{
                  padding: '11px 0',
                  background: 'transparent', color: 'var(--accent)',
                  border: '2px solid var(--accent)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)' }}
              >
                Seguir comprando
              </Link>
            </div>

            <div className="px-5 pb-4 flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Compra 100% segura y garantizada
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
