import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <p className="text-white font-bold text-lg mb-2">
              <span style={{ color: 'var(--accent)' }}>StockFlow</span> Tienda
            </p>
            <p className="text-sm leading-relaxed">
              La mejor experiencia de compra online con los mejores precios.
            </p>
          </div>
          <div>
            <p className="text-white font-medium mb-3 text-sm">Tienda</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/catalogo" className="hover:text-white transition">Catálogo</Link></li>
              <li><Link to="/carrito" className="hover:text-white transition">Mi carrito</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-medium mb-3 text-sm">Mi cuenta</p>
            <ul className="space-y-2 text-sm">
              <li><Link to="/mis-compras" className="hover:text-white transition">Mis compras</Link></li>
              <li><Link to="/cuenta" className="hover:text-white transition">Mi perfil</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Iniciar sesión</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-white font-medium mb-3 text-sm">Pagos</p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-800 px-2.5 py-1 rounded text-xs text-gray-300">Mercado Pago</span>
              <span className="bg-gray-800 px-2.5 py-1 rounded text-xs text-gray-300">Stripe</span>
              <span className="bg-gray-800 px-2.5 py-1 rounded text-xs text-gray-300">Transferencia</span>
              <span className="bg-gray-800 px-2.5 py-1 rounded text-xs text-gray-300">Efectivo</span>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
          © {new Date().getFullYear()} StockFlow Tienda. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
