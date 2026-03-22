import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { catalogoApi, resolveImagen } from '../services/api'
import { useFetch } from '../hooks/useApi'
import { useCart } from '../context/CartContext'

// Hook de stock en tiempo real con polling
function useStockTiempoReal(productoId, stockInicial) {
  const [stockActual, setStockActual] = useState(stockInicial ?? null)
  const [actualizando, setActualizando] = useState(false)

  const fetchStock = useCallback(async () => {
    if (!productoId) return
    try {
      setActualizando(true)
      const res = await catalogoApi.getStock(productoId)
      setStockActual(res.data.stock)
    } catch {
      // silencioso — mantenemos el último valor conocido
    } finally {
      setActualizando(false)
    }
  }, [productoId])

  // Sincronizar con el valor inicial cuando carga el producto
  useEffect(() => {
    if (stockInicial != null) setStockActual(stockInicial)
  }, [stockInicial])

  // Polling cada 30 segundos
  useEffect(() => {
    if (!productoId) return
    const id = setInterval(fetchStock, 30_000)
    return () => clearInterval(id)
  }, [productoId, fetchStock])

  return { stockActual, actualizando, refrescar: fetchStock }
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

export default function ProductoDetalle() {
  const { id } = useParams()
  const { agregar } = useCart()
  const [cantidad, setCantidad] = useState(1)
  const [imagenActiva, setImagenActiva] = useState(null)
  const [esFavorito, setEsFavorito] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const shareRef = useRef(null)

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
    const imgs = producto.imagenes?.length
      ? producto.imagenes
      : producto.imagen_url ? [{ id: 0, url: producto.imagen_url }] : []
    setImagenActiva(imgs[0]?.url ?? null)
    setEsFavorito(getFavoritos().includes(producto.id))
  }, [producto])

  // Cerrar share al hacer click fuera
  useEffect(() => {
    if (!shareOpen) return
    const handle = (e) => {
      if (shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [shareOpen])

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  if (!producto) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 text-center">
        <p className="text-gray-400 text-lg">Producto no encontrado.</p>
        <Link to="/catalogo" className="btn btn-primary mt-4">Volver al catálogo</Link>
      </div>
    )
  }

  const imagenes = producto.imagenes?.length
    ? producto.imagenes
    : producto.imagen_url ? [{ id: 0, url: producto.imagen_url }] : []

  // Usamos stockActual (tiempo real) para la validación de cantidad
  const stockVigente = stockActual ?? producto?.stock ?? 0
  const handleAgregar = () => agregar({ ...producto, stock: stockVigente }, cantidad)

  const handleFavorito = () => {
    const ahora = toggleFavorito(producto.id)
    setEsFavorito(ahora)
  }

  const productoUrl = window.location.href
  const productoTitulo = encodeURIComponent(producto.nombre)
  const productoUrlEnc = encodeURIComponent(productoUrl)

  const shareLinks = [
    {
      label: 'WhatsApp',
      color: '#25D366',
      href: `https://wa.me/?text=${productoTitulo}%20${productoUrlEnc}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      label: 'Facebook',
      color: '#1877F2',
      href: `https://www.facebook.com/sharer/sharer.php?u=${productoUrlEnc}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
    },
    {
      label: 'Twitter/X',
      color: '#000',
      href: `https://twitter.com/intent/tweet?text=${productoTitulo}&url=${productoUrlEnc}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.213 5.567zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
    },
    {
      label: 'Telegram',
      color: '#2CA5E0',
      href: `https://t.me/share/url?url=${productoUrlEnc}&text=${productoTitulo}`,
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
        </svg>
      ),
    },
  ]

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(productoUrl).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    })
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-gray-600">Catálogo</Link>
        {producto.categoria_nombre && (
          <>
            <span>/</span>
            <Link to={`/catalogo?categoria_id=${producto.categoria_id}`} className="hover:text-gray-600">
              {producto.categoria_nombre}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-gray-700 truncate">{producto.nombre}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* ── Galería: thumbnails verticales + imagen principal ── */}
        <div className="flex gap-3">
          {/* Columna de thumbnails verticales (solo si hay más de 1) */}
          {imagenes.length > 1 && (
            <div className="flex flex-col gap-2 shrink-0" style={{ width: 64 }}>
              {imagenes.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setImagenActiva(img.url)}
                  style={{
                    width: 64, height: 64, borderRadius: 8,
                    overflow: 'hidden', padding: 0, cursor: 'pointer', flexShrink: 0,
                    border: imagenActiva === img.url
                      ? '2px solid var(--accent, #6366f1)'
                      : '2px solid var(--border, #e5e7eb)',
                    background: '#ffffff',
                    transition: 'border-color 0.15s',
                  }}
                >
                  <img
                    src={resolveImagen(img.url)}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }}
                    onError={e => { e.currentTarget.style.opacity = '0.2' }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Imagen principal */}
          <div className="flex-1 aspect-square rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ background: '#ffffff', border: '1px solid var(--border)' }}
          >
            {imagenActiva ? (
              <img
                src={resolveImagen(imagenActiva)}
                alt={producto.nombre}
                className="w-full h-full object-contain p-2"
                onError={e => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextSibling.style.display = 'block'
                }}
              />
            ) : null}
            <svg
              className="w-24 h-24 text-gray-200"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
              style={{ display: imagenActiva ? 'none' : 'block' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>

        {/* ── Info ── */}
        <div className="space-y-5">
          {/* Categoría + acciones (favorito, compartir) */}
          <div className="flex items-center justify-between gap-2">
            {producto.categoria_nombre
              ? <span className="badge badge-muted text-xs uppercase tracking-wide">{producto.categoria_nombre}</span>
              : <span />
            }
            <div className="flex items-center gap-2">
              {/* Favorito */}
              <button
                onClick={handleFavorito}
                title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                className="w-9 h-9 rounded-full flex items-center justify-center transition"
                style={{
                  border: '1.5px solid var(--border)',
                  background: esFavorito ? '#fff0f0' : 'transparent',
                  color: esFavorito ? '#e74c3c' : 'var(--muted)',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#e74c3c'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <svg className="w-5 h-5" fill={esFavorito ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>

              {/* Compartir */}
              <div className="relative" ref={shareRef}>
                <button
                  onClick={() => setShareOpen(o => !o)}
                  title="Compartir producto"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition"
                  style={{
                    border: '1.5px solid var(--border)',
                    background: shareOpen ? 'var(--surface2)' : 'transparent',
                    color: 'var(--muted)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>

                {/* Dropdown compartir */}
                {shareOpen && (
                  <div
                    className="absolute right-0 mt-2 rounded-xl shadow-xl z-50 overflow-hidden"
                    style={{
                      width: 200,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <p className="text-xs font-semibold px-4 pt-3 pb-2" style={{ color: 'var(--muted)' }}>
                      Compartir producto
                    </p>
                    {shareLinks.map(sl => (
                      <a
                        key={sl.label}
                        href={sl.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm transition"
                        style={{ color: 'var(--text)', textDecoration: 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        onClick={() => setShareOpen(false)}
                      >
                        <span style={{ color: sl.color }}>{sl.icon}</span>
                        {sl.label}
                      </a>
                    ))}
                    {/* Copiar link */}
                    <button
                      onClick={handleCopiarLink}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition"
                      style={{
                        color: copiado ? '#27ae60' : 'var(--text)',
                        background: 'transparent',
                        borderTop: '1px solid var(--border)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {copiado ? (
                        <>
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          ¡Copiado!
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copiar enlace
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 leading-tight">{producto.nombre}</h1>

          {producto.descripcion && (
            <p className="text-gray-600 leading-relaxed">{producto.descripcion}</p>
          )}

          <div className="pt-2">
            {producto.precio_oferta ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <p className="text-4xl font-bold" style={{ color: '#16a34a' }}>{fmt(producto.precio_oferta)}</p>
                  {producto.descuento_pct && (
                    <span style={{
                      fontSize: 14, fontWeight: 700, background: '#14532d',
                      color: '#4ade80', borderRadius: 6, padding: '3px 10px',
                    }}>-{producto.descuento_pct}% OFF</span>
                  )}
                </div>
                <p className="text-lg text-gray-400 mt-1" style={{ textDecoration: 'line-through' }}>
                  Antes: {fmt(producto.precio)}
                </p>
                {producto.campana_nombre && (
                  <p className="text-sm mt-1" style={{ color: '#4ade80' }}>🏷 {producto.campana_nombre}</p>
                )}
              </>
            ) : (
              <p className="text-4xl font-bold text-gray-900">{fmt(producto.precio)}</p>
            )}
            {producto.alicuota_iva > 0 && (
              <p className="text-sm text-gray-400 mt-1">+ {producto.alicuota_iva}% IVA incluido</p>
            )}
          </div>

          {/* Stock en tiempo real */}
          <div className="flex items-center gap-3 flex-wrap">
            {stockActual == null ? (
              // cargando por primera vez
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
                <span className="text-sm text-gray-400">Consultando stock…</span>
              </div>
            ) : stockActual > 0 ? (
              <>
                {/* Indicador verde */}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm text-green-600 font-medium">En stock</span>
                </div>
                {/* Cantidad exacta */}
                <span
                  className="text-sm font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: stockActual <= 5 ? '#fff0f0' : stockActual <= 15 ? '#fffbeb' : '#f0fdf4',
                    color: stockActual <= 5 ? '#e74c3c' : stockActual <= 15 ? '#d97706' : '#16a34a',
                    border: `1px solid ${stockActual <= 5 ? '#fca5a5' : stockActual <= 15 ? '#fcd34d' : '#86efac'}`,
                  }}
                >
                  {stockActual <= 5
                    ? `¡Solo ${stockActual} ${stockActual === 1 ? 'unidad' : 'unidades'}!`
                    : `${stockActual} unidades disponibles`}
                </span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-sm text-red-500 font-medium">Sin stock</span>
              </>
            )}

            {/* Botón refrescar + pulso de actualización */}
            <button
              onClick={refrescar}
              title="Actualizar stock"
              className="flex items-center gap-1 text-xs transition"
              style={{ color: 'var(--muted)', background: 'transparent' }}
            >
              <svg
                className={`w-3.5 h-3.5 ${actualizando ? 'animate-spin' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {actualizando ? 'Actualizando…' : 'Tiempo real'}
            </button>
          </div>

          {/* Cantidad + Agregar */}
          {stockVigente > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium" style={{ color: 'var(--text-light, #555)' }}>Cantidad:</span>
                <div
                  className="flex items-center rounded-lg overflow-hidden"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <button
                    onClick={() => setCantidad(c => Math.max(1, c - 1))}
                    className="transition font-semibold"
                    style={{ padding: '7px 16px', color: 'var(--text)', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    −
                  </button>
                  <span
                    className="font-semibold text-sm text-center"
                    style={{
                      padding: '7px 8px',
                      minWidth: '3rem',
                      borderLeft: '1px solid var(--border)',
                      borderRight: '1px solid var(--border)',
                      color: 'var(--text)',
                    }}
                  >
                    {cantidad}
                  </span>
                  <button
                    onClick={() => setCantidad(c => Math.min(stockVigente, c + 1))}
                    className="transition font-semibold"
                    style={{ padding: '7px 16px', color: 'var(--text)', background: 'transparent' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botón principal - "¡Cómpralo ahora!" */}
              <Link
                to="/checkout"
                onClick={handleAgregar}
                className="w-full font-bold text-base rounded-full flex items-center justify-center transition"
                style={{
                  padding: '14px 0',
                  background: 'var(--accent)',
                  color: '#fff',
                  textDecoration: 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                ¡Cómpralo ahora!
              </Link>

              {/* Botón secundario - "Agregar al carro" */}
              <button
                onClick={handleAgregar}
                className="w-full font-semibold text-base rounded-full flex items-center justify-center gap-2 transition"
                style={{
                  padding: '12px 0',
                  background: 'transparent',
                  color: 'var(--accent)',
                  border: '2px solid var(--accent)',
                  cursor: 'pointer',
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Agregar al carro
              </button>

              {/* Favorito + compartir debajo de los botones (mobile-friendly) */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  onClick={handleFavorito}
                  className="flex items-center gap-1.5 text-sm transition"
                  style={{ color: esFavorito ? '#e74c3c' : 'var(--muted)' }}
                >
                  <svg className="w-4 h-4" fill={esFavorito ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  {esFavorito ? 'En favoritos' : 'Agregar a favoritos'}
                </button>
              </div>
            </div>
          )}

          {/* SKU */}
          {producto.codigo && (
            <p className="text-xs text-gray-400 font-mono">SKU: {producto.codigo}</p>
          )}
        </div>
      </div>
    </div>
  )
}
