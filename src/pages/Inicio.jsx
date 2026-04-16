import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { catalogoApi } from '../services/api'
import { useFetch } from '../hooks/useApi'
import ProductoCard from '../components/ProductoCard'

export default function Inicio() {
  const navigate = useNavigate()
  const { data: catsRaw } = useFetch(() => catalogoApi.listarCategorias(), [], { initialData: [], showError: false })
  const cats = Array.isArray(catsRaw) ? catsRaw : (catsRaw?.data ?? [])

  const { data: productosResp, loading } = useFetch(
    () => catalogoApi.listarProductos({ limit: 8, page: 1 }),
    [],
    { initialData: null, showError: false, pollInterval: 30000 }
  )
  const productos = Array.isArray(productosResp) ? productosResp : (productosResp?.data ?? [])

  return (
    <main>
      {/* Hero — fondo amarillo vivo, texto oscuro */}
      <section className="hero-section py-20 px-4 relative overflow-hidden">
        {/* Forma decorativa circular verde lima */}
        <div className="hero-blob-1" />
        <div className="hero-blob-2" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Chip badge */}
          <span className="hero-badge">
            🛍️ Más de 500 productos disponibles
          </span>

          <h1 className="hero-title">
            Todo lo que necesitás,<br />
            <span className="hero-highlight">al mejor precio</span>
          </h1>
          <p className="hero-subtitle">
            Encontrá los mejores productos con precios increíbles.<br />
            Entrega rápida y segura en todo el país.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/catalogo" className="btn btn-primary btn-lg">
              Ver catálogo completo
            </Link>
            <Link to="/registro" className="btn btn-ghost-dark btn-lg">
              Crear cuenta gratis →
            </Link>
          </div>
        </div>
      </section>

      {/* Categorías */}
      {cats?.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center gap-3 mb-5">
            <span className="section-dot" />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Categorías</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {cats.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/catalogo?categoria_id=${cat.id}`)}
                className="btn btn-secondary btn-sm"
              >
                {cat.nombre}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Productos destacados */}
      <section className="max-w-7xl mx-auto px-4 py-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="section-dot" />
            <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Productos destacados</h2>
          </div>
          <Link
            to="/catalogo"
            className="text-sm font-semibold transition"
            style={{ color: 'var(--accent-alt2, var(--accent))' }}
          >
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="aspect-square" style={{ background: 'var(--surface2)' }} />
                <div className="p-3.5 space-y-2">
                  <div className="h-3 rounded-full w-2/3" style={{ background: 'var(--surface2)' }} />
                  <div className="h-4 rounded-full" style={{ background: 'var(--surface2)' }} />
                  <div className="h-6 rounded-full w-1/2 mt-3" style={{ background: 'var(--surface2)' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {productos.map(p => <ProductoCard key={p.id} producto={p} />)}
          </div>
        )}
      </section>

      {/* Banner CTA */}
      <section className="cta-section py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>
            ¿Primera vez comprando?
          </h3>
          <p className="mb-6" style={{ color: 'var(--text-light)' }}>
            Creá tu cuenta y disfrutá de beneficios exclusivos, historial de compras y más.
          </p>
          <Link to="/registro" className="btn btn-primary btn-lg">
            Registrarme gratis
          </Link>
        </div>
      </section>
    </main>
  )
}
