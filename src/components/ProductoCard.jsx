import React from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useTheme } from '../context/ThemeContext'
import { resolveImagen } from '../services/api'

const fmt = (n) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(n)

export default function ProductoCard({ producto }) {
  const { agregar } = useCart()
  const { theme } = useTheme()

  return (
    <div className="card group transition-shadow" style={{ transition: 'box-shadow 0.2s, border-color 0.2s' }}>
      {/* Imagen */}
      <Link to={`/productos/${producto.id}`} className="block aspect-square overflow-hidden flex items-center justify-center p-2" style={{ background: '#ffffff' }}>
        {producto.imagen_url ? (
          <img
            src={resolveImagen(producto.imagen_url)}
            alt={producto.nombre}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={e => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <div
          className="w-full h-full items-center justify-center"
          style={{ display: producto.imagen_url ? 'none' : 'flex' }}
        >
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--border)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
      </Link>

      {/* Info */}
      <div className="p-3.5">
        {producto.categoria_nombre && (
          <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--muted)' }}>
            {producto.categoria_nombre}
          </p>
        )}
        <Link to={`/productos/${producto.id}`} className="block">
          <h3
            className="text-sm font-semibold leading-snug line-clamp-2 transition"
            style={{ color: 'var(--text)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text)'}
          >
            {producto.nombre}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2.5 gap-2">
          <div>
            <p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{fmt(producto.precio)}</p>
            {producto.stock <= 5 && producto.stock > 0 && (
              <p className="text-xs font-medium" style={{ color: 'var(--warning)' }}>¡Últimas {producto.stock} unidades!</p>
            )}
            {producto.stock === 0 && (
              <p className="text-xs font-medium" style={{ color: 'var(--danger)' }}>Sin stock</p>
            )}
          </div>
          <button
            onClick={() => agregar(producto)}
            disabled={producto.stock === 0}
            className="btn btn-primary btn-sm px-3"
            title="Agregar al carrito"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
