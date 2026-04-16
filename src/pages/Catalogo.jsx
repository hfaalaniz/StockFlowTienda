import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { catalogoApi } from '../services/api'
import { useFetch } from '../hooks/useApi'
import ProductoCard from '../components/ProductoCard'

export default function Catalogo() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [page, setPage] = useState(1)

  const search = searchParams.get('search') || ''
  const categoriaId = searchParams.get('categoria_id') || ''

  const { data: catsRaw } = useFetch(() => catalogoApi.listarCategorias(), [], { initialData: [], showError: false })
  const cats = Array.isArray(catsRaw) ? catsRaw : (catsRaw?.data ?? [])

  const { data: resp, loading } = useFetch(
    () => catalogoApi.listarProductos({ search, categoria_id: categoriaId || undefined, page, limit: 24 }),
    [search, categoriaId, page],
    { initialData: null, showError: false, pollInterval: 30000 }
  )
  const productos = Array.isArray(resp) ? resp : (resp?.data ?? [])
  const total = resp?.total ?? 0
  const totalPages = Math.ceil(total / 24)

  function setFiltro(key, val) {
    const p = new URLSearchParams(searchParams)
    if (val) p.set(key, val); else p.delete(key)
    setSearchParams(p)
    setPage(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Catálogo de productos</h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar filtros */}
        <aside className="w-full md:w-56 shrink-0 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">Categorías</h3>
            <div className="space-y-1">
              <button
                onClick={() => setFiltro('categoria_id', '')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${!categoriaId ? 'bg-yellow-50 text-yellow-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                Todas
              </button>
              {cats?.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setFiltro('categoria_id', String(cat.id))}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${categoriaId === String(cat.id) ? 'bg-yellow-50 text-yellow-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid productos */}
        <div className="flex-1">
          {/* Búsqueda activa */}
          {search && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-gray-500">Resultados para: <strong>"{search}"</strong></span>
              <button
                onClick={() => setFiltro('search', '')}
                className="text-xs text-red-500 hover:underline"
              >
                Limpiar
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="p-3.5 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-4 bg-gray-100 rounded" />
                    <div className="h-6 bg-gray-100 rounded w-1/2 mt-3" />
                  </div>
                </div>
              ))}
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400 font-medium">No se encontraron productos</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">{total} productos encontrados</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productos.map(p => <ProductoCard key={p.id} producto={p} />)}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="btn btn-secondary btn-sm"
                  >
                    ← Anterior
                  </button>
                  <span className="text-sm text-gray-500 px-4">
                    Página {page} de {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="btn btn-secondary btn-sm"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
