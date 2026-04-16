import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { catalogoApi, resolveImagen } from '../services/api'
import { useFetch } from '../hooks/useApi'
import { useCart } from '../context/CartContext'

function useStockTiempoReal(productoId, stockInicial) {
  const [stockActual, setStockActual] = useState(stockInicial ?? null)
  const [actualizando, setActualizando] = useState(false)
  const fetchStock = useCallback(async () => {
    if (!productoId) return
    try {
      setActualizando(true)
      const res = await catalogoApi.getStock(productoId)
      setStockActual(res.data.stock)
    } catch { /* mantener último valor */ }
    finally { setActualizando(false) }
  }, [productoId])
  useEffect(() => { if (stockInicial != null) setStockActual(stockInicial) }, [stockInicial])
  useEffect(() => {
    if (!productoId) return
    const id = setInterval(fetchStock, 30_000)
    return () => clearInterval(id)
  }, [productoId, fetchStock])
  return { stockActual, actualizando, refrescar: fetchStock }
}

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)
const fmtCuota = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)

const FAVORITOS_KEY = 'sf_favoritos'
const getFavoritos = () => { try { return JSON.parse(localStorage.getItem(FAVORITOS_KEY) || '[]') } catch { return [] } }
const toggleFavorito = (id) => {
  const favs = getFavoritos()
  const next = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id]
  localStorage.setItem(FAVORITOS_KEY, JSON.stringify(next))
  return next.includes(id)
}

// ── Galería con zoom ────────────────────────────────────────────────────────────
function Galeria({ imagenes, nombre }) {
  const [activa, setActiva] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const imgRef = useRef(null)

  const handleMouseMove = (e) => {
    const rect = imgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPos({ x, y })
  }

  if (!imagenes.length) return (
    <div className="aspect-square rounded-2xl flex items-center justify-center"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
      <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    </div>
  )

  return (
    <div className="flex gap-3">
      {/* Thumbnails verticales */}
      {imagenes.length > 1 && (
        <div className="flex flex-col gap-2 shrink-0" style={{ width: 68 }}>
          {imagenes.map((img, i) => (
            <button key={img.id ?? i} type="button" onClick={() => setActiva(i)}
              style={{
                width: 68, height: 68, borderRadius: 8, overflow: 'hidden', padding: 2,
                border: activa === i ? '2px solid var(--accent)' : '2px solid var(--border)',
                background: '#fff', transition: 'border-color .15s', cursor: 'pointer', flexShrink: 0,
              }}>
              <img src={resolveImagen(img.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={e => { e.currentTarget.style.opacity = '0.2' }} />
            </button>
          ))}
        </div>
      )}

      {/* Imagen principal con zoom */}
      <div className="flex-1" style={{ position: 'relative' }}>
        <div
          ref={imgRef}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMouseMove}
          style={{
            aspectRatio: '1/1', borderRadius: 16, overflow: 'hidden',
            background: '#fff', border: '1px solid var(--border)',
            cursor: zoom ? 'crosshair' : 'default',
            position: 'relative',
          }}
        >
          <img
            src={resolveImagen(imagenes[activa]?.url)}
            alt={nombre}
            style={{
              width: '100%', height: '100%', objectFit: 'contain', padding: 8,
              transformOrigin: `${pos.x}% ${pos.y}%`,
              transform: zoom ? 'scale(2.2)' : 'scale(1)',
              transition: zoom ? 'none' : 'transform .3s',
            }}
            onError={e => { e.currentTarget.style.opacity = '0.15' }}
          />
        </div>
        {/* Navegación flechas */}
        {imagenes.length > 1 && (
          <>
            <button onClick={() => setActiva(i => Math.max(0, i - 1))} disabled={activa === 0}
              style={{
                position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.85)',
                border: '1px solid var(--border)', cursor: activa === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: activa === 0 ? 0.35 : 1, boxShadow: '0 1px 4px rgba(0,0,0,.12)',
              }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => setActiva(i => Math.min(imagenes.length - 1, i + 1))} disabled={activa === imagenes.length - 1}
              style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,.85)',
                border: '1px solid var(--border)', cursor: activa === imagenes.length - 1 ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: activa === imagenes.length - 1 ? 0.35 : 1, boxShadow: '0 1px 4px rgba(0,0,0,.12)',
              }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        )}
        {/* Hint zoom */}
        {!zoom && (
          <span style={{
            position: 'absolute', bottom: 10, right: 12, fontSize: 10,
            color: 'var(--muted)', background: 'rgba(255,255,255,.8)',
            borderRadius: 4, padding: '2px 6px', pointerEvents: 'none',
          }}>🔍 Pasá el mouse para ampliar</span>
        )}
      </div>
    </div>
  )
}

// ── Cuotas sin interés (simulado) ───────────────────────────────────────────────
function Cuotas({ precio }) {
  const [open, setOpen] = useState(false)
  const cuotas = [3, 6, 12].map(n => ({ n, valor: precio / n }))
  return (
    <div>
      <button onClick={() => setOpen(o => !o)}
        className="text-sm font-medium hover:underline"
        style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        Hasta 12 cuotas sin interés {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="mt-2 rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {cuotas.map(({ n, valor }) => (
            <div key={n} className="flex justify-between items-center px-4 py-2.5 text-sm"
              style={{ borderBottom: n !== 12 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}>
              <span style={{ color: 'var(--text)' }}>{n} cuotas de</span>
              <span className="font-bold" style={{ color: '#16a34a' }}>{fmtCuota(valor)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Panel de beneficios ─────────────────────────────────────────────────────────
function Beneficios() {
  const items = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      titulo: 'Envío a todo el país',
      detalle: 'Consultá opciones al finalizar la compra',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      titulo: 'Compra garantizada',
      detalle: 'Si no llega o no es lo que esperabas, te devolvemos el dinero',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      titulo: 'Devolución gratis',
      detalle: '30 días para cambios y devoluciones',
    },
  ]
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3"
          style={{ borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none', background: 'var(--surface)' }}>
          <span style={{ color: '#16a34a', marginTop: 1, flexShrink: 0 }}>{item.icon}</span>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{item.titulo}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{item.detalle}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Share dropdown ──────────────────────────────────────────────────────────────
function ShareMenu({ producto }) {
  const [open, setOpen] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])
  const url = window.location.href
  const redes = [
    { label: 'WhatsApp', color: '#25D366', href: `https://wa.me/?text=${encodeURIComponent(producto.nombre)}%20${encodeURIComponent(url)}` },
    { label: 'Facebook', color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: 'Twitter/X', color: '#000', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(producto.nombre)}&url=${encodeURIComponent(url)}` },
    { label: 'Telegram', color: '#2CA5E0', href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(producto.nombre)}` },
  ]
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} title="Compartir"
        className="flex items-center gap-1.5 text-sm transition hover:underline"
        style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Compartir
      </button>
      {open && (
        <div className="absolute left-0 mt-2 rounded-xl shadow-xl z-50 overflow-hidden"
          style={{ width: 190, background: 'var(--surface)', border: '1px solid var(--border)', bottom: 'auto' }}>
          <p className="text-xs font-semibold px-3 pt-2.5 pb-1.5" style={{ color: 'var(--muted)' }}>Compartir en</p>
          {redes.map(r => (
            <a key={r.label} href={r.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm transition"
              style={{ color: 'var(--text)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: r.color, flexShrink: 0 }} />
              {r.label}
            </a>
          ))}
          <button onClick={() => { navigator.clipboard.writeText(url).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 1800) }) }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm transition"
            style={{ color: copiado ? '#27ae60' : 'var(--text)', background: 'transparent', borderTop: '1px solid var(--border)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {copiado
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              }
            </svg>
            {copiado ? '¡Copiado!' : 'Copiar enlace'}
          </button>
        </div>
      )}
    </div>
  )
}

// ── Productos relacionados ──────────────────────────────────────────────────────
function Relacionados({ categoriaId, productoActualId }) {
  const { data: resp } = useFetch(
    () => catalogoApi.listarProductos({ categoria_id: categoriaId, limit: 6 }),
    [categoriaId],
    { initialData: null, showError: false, enabled: !!categoriaId }
  )
  const { agregar } = useCart()
  const lista = (Array.isArray(resp) ? resp : (resp?.data ?? []))
    .filter(p => p.id !== productoActualId)
    .slice(0, 5)

  if (!lista.length) return null

  return (
    <div className="mt-10">
      <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Productos relacionados</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {lista.map(p => (
          <Link key={p.id} to={`/productos/${p.id}`}
            className="rounded-xl overflow-hidden transition-shadow hover:shadow-md block"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none' }}>
            <div style={{ aspectRatio: '1/1', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
              {p.imagen_url
                ? <img src={resolveImagen(p.imagen_url)} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { e.currentTarget.style.opacity = '.15' }} />
                : <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
              }
            </div>
            <div className="p-2.5">
              <p className="text-xs font-medium leading-snug line-clamp-2" style={{ color: 'var(--text)' }}>{p.nombre}</p>
              <p className="text-sm font-bold mt-1" style={{ color: p.precio_oferta ? '#16a34a' : 'var(--accent)' }}>
                {fmt(p.precio_oferta ?? p.precio)}
              </p>
              <button
                onClick={e => { e.preventDefault(); agregar(p) }}
                disabled={p.stock === 0}
                className="mt-2 w-full text-xs font-semibold rounded-lg py-1 transition"
                style={{
                  background: p.stock === 0 ? 'var(--surface2)' : 'var(--accent)',
                  color: p.stock === 0 ? 'var(--muted)' : '#fff',
                  border: 'none', cursor: p.stock === 0 ? 'not-allowed' : 'pointer',
                }}>
                {p.stock === 0 ? 'Sin stock' : 'Agregar'}
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Calculadora de envío ────────────────────────────────────────────────────────
function CalculadoraEnvio() {
  const [cp, setCp] = useState('')
  const [resultado, setResultado] = useState(null) // null | { encontrado, zona, precio, dias_min, dias_max, mensaje }
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const consultar = async () => {
    const cpLimpio = cp.replace(/\D/g, '')
    if (cpLimpio.length < 4) { setError('Ingresá un código postal válido (mínimo 4 dígitos).'); return }
    setError('')
    setResultado(null)
    setCargando(true)
    try {
      const res = await catalogoApi.calcularEnvio(cpLimpio)
      setResultado(res.data)
    } catch (e) {
      setError(e.response?.data?.error || 'No se pudo calcular el envío.')
    } finally {
      setCargando(false)
    }
  }

  const limpiar = () => { setCp(''); setResultado(null); setError('') }

  return (
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text)' }}>
        <svg className="inline w-3.5 h-3.5 mr-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        Calcular costo de envío
      </p>

      {/* Input + botón */}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={8}
          value={cp}
          onChange={e => { setCp(e.target.value.replace(/\D/g, '')); setResultado(null); setError('') }}
          onKeyDown={e => e.key === 'Enter' && consultar()}
          placeholder="Ej: 1414"
          style={{
            flex: 1, padding: '7px 10px', fontSize: 13,
            border: `1px solid ${error ? '#fca5a5' : 'var(--border)'}`,
            borderRadius: 8, background: 'var(--surface2)',
            color: 'var(--text)', outline: 'none',
            minWidth: 0,
          }}
          onFocus={e => e.target.style.borderColor = 'var(--accent)'}
          onBlur={e => e.target.style.borderColor = error ? '#fca5a5' : 'var(--border)'}
        />
        <button
          onClick={consultar}
          disabled={cargando || !cp}
          style={{
            padding: '7px 12px', fontSize: 12, fontWeight: 600,
            borderRadius: 8, border: 'none', cursor: cargando || !cp ? 'not-allowed' : 'pointer',
            background: cargando || !cp ? 'var(--surface2)' : 'var(--accent)',
            color: cargando || !cp ? 'var(--muted)' : '#fff',
            whiteSpace: 'nowrap', flexShrink: 0,
            transition: 'background .15s',
          }}
        >
          {cargando ? (
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
            </svg>
          ) : 'Calcular'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs mt-1.5" style={{ color: '#e74c3c' }}>{error}</p>
      )}

      {/* Resultado */}
      {resultado && (
        resultado.encontrado ? (
          <div className="mt-2 rounded-lg p-3 space-y-1"
            style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: '#15803d' }}>
                {resultado.localidad ? `${resultado.localidad}, ${resultado.zona}` : resultado.zona}
              </span>
              <span className="text-sm font-bold" style={{ color: resultado.precio === 0 ? '#15803d' : 'var(--text)' }}>
                {resultado.precio === 0 ? '¡Gratis!' : fmt(resultado.precio)}
              </span>
            </div>
            <p className="text-xs" style={{ color: '#166534' }}>
              Entrega estimada: {resultado.dias_min === resultado.dias_max
                ? `${resultado.dias_min} días hábiles`
                : `${resultado.dias_min}–${resultado.dias_max} días hábiles`}
            </p>
            <button onClick={limpiar} className="text-xs hover:underline" style={{ color: '#16a34a', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Cambiar CP
            </button>
          </div>
        ) : (
          <div className="mt-2 rounded-lg p-3"
            style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
            <p className="text-xs" style={{ color: '#9a3412' }}>{resultado.mensaje || 'No se encontró tarifa para ese código postal.'}</p>
            <button onClick={limpiar} className="text-xs hover:underline mt-1" style={{ color: '#ea580c', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              Intentar con otro CP
            </button>
          </div>
        )
      )}
    </div>
  )
}

// ── Ficha técnica (datos del sistema) ──────────────────────────────────────────
function FichaTecnica({ producto }) {
  const filas = [
    producto.categoria_nombre && { label: 'Categoría', valor: producto.categoria_nombre },
    producto.codigo           && { label: 'SKU / Código', valor: producto.codigo },
    producto.codigo_barras    && { label: 'Código de barras', valor: producto.codigo_barras },
    producto.alicuota_iva != null && { label: 'IVA', valor: `${producto.alicuota_iva}%` },
    { label: 'Condición', valor: 'Nuevo' },
  ].filter(Boolean)

  return (
    <div>
      <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>Información del producto</p>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {filas.map((fila, i) => (
          <div key={fila.label} className="flex text-sm px-4 py-2.5"
            style={{
              borderBottom: i < filas.length - 1 ? '1px solid var(--border)' : 'none',
              background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)',
            }}>
            <span className="w-40 shrink-0 font-medium" style={{ color: 'var(--muted)' }}>{fila.label}</span>
            <span style={{ color: 'var(--text)' }}>{fila.valor}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Especificaciones técnicas (cargadas del backend) ───────────────────────────
function EspecificacionesTecnicas({ specs }) {
  if (!specs?.length) return null

  // Agrupar por campo `grupo`
  const grupos = specs.reduce((acc, s) => {
    const g = s.grupo || 'General'
    if (!acc[g]) acc[g] = []
    acc[g].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-4">
      {Object.entries(grupos).map(([grupo, filas]) => (
        <div key={grupo}>
          <p className="text-sm font-semibold mb-2" style={{ color: 'var(--text)' }}>{grupo}</p>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {filas.map((fila, i) => (
              <div key={i} className="flex text-sm px-4 py-2.5"
                style={{
                  borderBottom: i < filas.length - 1 ? '1px solid var(--border)' : 'none',
                  background: i % 2 === 0 ? 'var(--surface)' : 'var(--surface2)',
                }}>
                <span className="w-40 shrink-0 font-medium" style={{ color: 'var(--muted)' }}>{fila.clave}</span>
                <span style={{ color: 'var(--text)' }}>{fila.valor}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Página principal ────────────────────────────────────────────────────────────
export default function ProductoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { agregar } = useCart()
  const [cantidad, setCantidad] = useState(1)
  const [esFavorito, setEsFavorito] = useState(false)
  const [agregado, setAgregado] = useState(false)

  const { data: producto, loading } = useFetch(
    () => catalogoApi.getProducto(id),
    [id],
    { showError: true }
  )

  const { stockActual, actualizando, refrescar } = useStockTiempoReal(
    producto?.id,
    producto?.stock ?? null
  )

  useEffect(() => {
    if (!producto) return
    setEsFavorito(getFavoritos().includes(producto.id))
  }, [producto])

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-20 flex items-center justify-center">
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  )

  if (!producto) return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <p className="text-lg mb-4" style={{ color: 'var(--muted)' }}>Producto no encontrado.</p>
      <Link to="/catalogo" className="btn btn-primary">Volver al catálogo</Link>
    </div>
  )

  const imagenes = producto.imagenes?.length
    ? producto.imagenes
    : producto.imagen_url ? [{ id: 0, url: producto.imagen_url }] : []

  const stockVigente = stockActual ?? producto?.stock ?? 0
  const precioFinal = producto.precio_oferta ?? producto.precio

  const handleAgregar = () => {
    agregar({ ...producto, stock: stockVigente }, cantidad)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  const handleComprar = () => {
    agregar({ ...producto, stock: stockVigente }, cantidad)
    navigate('/checkout')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs mb-5 flex-wrap" style={{ color: 'var(--muted)' }}>
        <Link to="/" className="hover:underline" style={{ color: 'var(--muted)' }}>Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:underline" style={{ color: 'var(--muted)' }}>Catálogo</Link>
        {producto.categoria_nombre && (
          <>
            <span>/</span>
            <Link to={`/catalogo?categoria_id=${producto.categoria_id}`}
              className="hover:underline" style={{ color: 'var(--muted)' }}>
              {producto.categoria_nombre}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="truncate max-w-xs" style={{ color: 'var(--text)' }}>{producto.nombre}</span>
      </nav>

      {/* Cuerpo principal — 3 columnas en desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── Col 1: Galería ── */}
        <div className="lg:col-span-5">
          <Galeria imagenes={imagenes} nombre={producto.nombre} />

          {/* Acciones secundarias bajo la galería */}
          <div className="flex items-center gap-5 mt-3 px-1">
            <button
              onClick={() => setEsFavorito(toggleFavorito(producto.id))}
              className="flex items-center gap-1.5 text-sm transition hover:underline"
              style={{ color: esFavorito ? '#e74c3c' : 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg className="w-4 h-4" fill={esFavorito ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {esFavorito ? 'En favoritos' : 'Agregar a favoritos'}
            </button>
            <ShareMenu producto={producto} />
          </div>
        </div>

        {/* ── Col 2: Info del producto ── */}
        <div className="lg:col-span-4 space-y-4">

          {/* Categoría + estado */}
          <div className="flex items-center gap-2 flex-wrap">
            {producto.categoria_nombre && (
              <Link to={`/catalogo?categoria_id=${producto.categoria_id}`}
                className="text-xs uppercase tracking-wide hover:underline"
                style={{ color: 'var(--accent)' }}>
                {producto.categoria_nombre}
              </Link>
            )}
            {stockVigente > 0
              ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }}>En stock</span>
              : <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fff0f0', color: '#e74c3c', border: '1px solid #fca5a5' }}>Sin stock</span>
            }
          </div>

          {/* Título */}
          <h1 className="text-2xl font-bold leading-snug" style={{ color: 'var(--text)' }}>
            {producto.nombre}
          </h1>

          {/* Código / SKU */}
          {(producto.codigo || producto.codigo_barras) && (
            <p className="text-xs font-mono" style={{ color: 'var(--muted)' }}>
              {producto.codigo && <>SKU: <strong>{producto.codigo}</strong></>}
              {producto.codigo && producto.codigo_barras && ' · '}
              {producto.codigo_barras && <>EAN: <strong>{producto.codigo_barras}</strong></>}
            </p>
          )}

          <hr style={{ borderColor: 'var(--border)' }} />

          {/* Precio */}
          <div className="space-y-1">
            {producto.precio_oferta ? (
              <>
                <p className="text-sm line-through" style={{ color: 'var(--muted)' }}>
                  Precio normal: {fmt(producto.precio)}
                </p>
                <div className="flex items-end gap-3 flex-wrap">
                  <p className="text-4xl font-bold" style={{ color: '#16a34a' }}>
                    {fmt(producto.precio_oferta)}
                  </p>
                  {producto.descuento_pct && (
                    <span className="text-base font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: '#14532d', color: '#4ade80' }}>
                      {producto.descuento_pct}% OFF
                    </span>
                  )}
                </div>
                {producto.campana_nombre && (
                  <p className="text-sm" style={{ color: '#4ade80' }}>🏷 Promoción: {producto.campana_nombre}</p>
                )}
              </>
            ) : (
              <p className="text-4xl font-bold" style={{ color: 'var(--text)' }}>
                {fmt(producto.precio)}
              </p>
            )}
            {producto.alicuota_iva > 0 && (
              <p className="text-xs" style={{ color: 'var(--muted)' }}>IVA {producto.alicuota_iva}% incluido</p>
            )}
          </div>

          {/* Cuotas */}
          {precioFinal > 0 && <Cuotas precio={precioFinal} />}

          <hr style={{ borderColor: 'var(--border)' }} />

          {/* Stock tiempo real */}
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={refrescar} title="Actualizar stock"
              className="flex items-center gap-1.5 text-xs"
              style={{ color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <svg className={`w-3 h-3 ${actualizando ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {actualizando ? 'Actualizando…' : 'Stock en tiempo real'}
            </button>
            {stockVigente > 0 && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: stockVigente <= 5 ? '#fff0f0' : stockVigente <= 15 ? '#fffbeb' : '#f0fdf4',
                  color: stockVigente <= 5 ? '#e74c3c' : stockVigente <= 15 ? '#d97706' : '#16a34a',
                  border: `1px solid ${stockVigente <= 5 ? '#fca5a5' : stockVigente <= 15 ? '#fcd34d' : '#86efac'}`,
                }}>
                {stockVigente <= 5
                  ? `¡Solo ${stockVigente} ${stockVigente === 1 ? 'unidad' : 'unidades'}!`
                  : `${stockVigente} disponibles`}
              </span>
            )}
          </div>

          {/* Descripción */}
          {producto.descripcion && (
            <div className="rounded-xl p-4" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Descripción</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{producto.descripcion}</p>
            </div>
          )}

          {/* Ficha técnica — datos del sistema siempre presentes */}
          <FichaTecnica producto={producto} />

          {/* Especificaciones técnicas — cargadas dinámicamente */}
          <EspecificacionesTecnicas specs={producto.especificaciones} />
        </div>

        {/* ── Col 3: Panel de compra (sticky) ── */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl p-5 space-y-4 sticky top-24"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 2px 12px rgba(0,0,0,.07)' }}>

            {/* Precio resumido */}
            <div>
              <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                {fmt(precioFinal)}
              </p>
              {producto.precio_oferta && (
                <p className="text-xs line-through mt-0.5" style={{ color: 'var(--muted)' }}>{fmt(producto.precio)}</p>
              )}
            </div>

            {/* Calculadora de envío */}
            <CalculadoraEnvio />

            {/* Selector cantidad */}
            {stockVigente > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm" style={{ color: 'var(--muted)' }}>Cantidad:</span>
                <div style={{
                  display: 'inline-flex', alignItems: 'stretch',
                  border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setCantidad(c => Math.max(1, c - 1))}
                    disabled={cantidad <= 1}
                    style={{
                      width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: 'none', cursor: cantidad <= 1 ? 'not-allowed' : 'pointer',
                      color: cantidad <= 1 ? 'var(--muted)' : 'var(--text)', flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (cantidad > 1) e.currentTarget.style.background = 'var(--surface2)' }}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                  <span style={{
                    width: 40, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: 15, color: 'var(--text)',
                    borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)',
                    userSelect: 'none',
                  }}>
                    {cantidad}
                  </span>
                  <button
                    onClick={() => setCantidad(c => Math.min(stockVigente, c + 1))}
                    disabled={cantidad >= stockVigente}
                    style={{
                      width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'transparent', border: 'none', cursor: cantidad >= stockVigente ? 'not-allowed' : 'pointer',
                      color: cantidad >= stockVigente ? 'var(--muted)' : 'var(--text)', flexShrink: 0,
                    }}
                    onMouseEnter={e => { if (cantidad < stockVigente) e.currentTarget.style.background = 'var(--surface2)' }}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </button>
                </div>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>({stockVigente} disp.)</span>
              </div>
            )}

            {/* Subtotal */}
            {stockVigente > 0 && cantidad > 1 && (
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Subtotal: <strong style={{ color: 'var(--text)' }}>{fmt(precioFinal * cantidad)}</strong>
              </p>
            )}

            {/* Botones CTA */}
            {stockVigente > 0 ? (
              <div className="space-y-2">
                <button onClick={handleComprar}
                  className="w-full font-bold text-base rounded-full transition"
                  style={{ padding: '13px 0', background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                  Comprar ahora
                </button>
                <button onClick={handleAgregar}
                  className="w-full font-semibold text-base rounded-full flex items-center justify-center gap-2 transition"
                  style={{
                    padding: '11px 0', background: agregado ? '#f0fdf4' : 'transparent',
                    color: agregado ? '#16a34a' : 'var(--accent)',
                    border: `2px solid ${agregado ? '#86efac' : 'var(--accent)'}`,
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (!agregado) { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff' } }}
                  onMouseLeave={e => { if (!agregado) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--accent)' } }}>
                  {agregado ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Agregado al carrito
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Agregar al carrito
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="rounded-xl p-4 text-center" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
                <p className="text-sm font-semibold" style={{ color: '#e74c3c' }}>Sin stock disponible</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Consultá disponibilidad próximamente</p>
              </div>
            )}

            {/* Beneficios resumidos */}
            <div className="space-y-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
              {[
                { icon: '🔒', text: 'Pago 100% seguro' },
                { icon: '↩️', text: 'Devolución en 30 días' },
                { icon: '📦', text: 'Envíos a todo el país' },
              ].map(b => (
                <div key={b.text} className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>{b.icon}</span>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Beneficios detallados */}
      <div className="mt-8">
        <Beneficios />
      </div>

      {/* Productos relacionados */}
      {producto.categoria_id && (
        <Relacionados categoriaId={producto.categoria_id} productoActualId={producto.id} />
      )}

    </div>
  )
}
