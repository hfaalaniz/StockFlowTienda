import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

const STORAGE_KEY = 'sf_carrito'

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Persistir en localStorage cada vez que cambia el carrito
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const agregar = useCallback((producto, cantidad = 1) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === producto.id)
      if (idx >= 0) {
        const updated = [...prev]
        const nuevaCantidad = updated[idx].cantidad + cantidad
        if (nuevaCantidad > producto.stock) {
          toast.error(`Stock máximo disponible: ${producto.stock}`)
          return prev
        }
        updated[idx] = { ...updated[idx], cantidad: nuevaCantidad }
        return updated
      }
      if (cantidad > producto.stock) {
        toast.error(`Stock máximo disponible: ${producto.stock}`)
        return prev
      }
      return [...prev, {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen_url: producto.imagen_url,
        stock: producto.stock,
        cantidad,
      }]
    })
    toast.success(`${producto.nombre} agregado al carrito`)
    setDrawerOpen(true)
  }, [])

  const quitar = useCallback((productoId) => {
    setItems(prev => prev.filter(i => i.id !== productoId))
  }, [])

  const cambiarCantidad = useCallback((productoId, cantidad) => {
    if (cantidad < 1) return
    setItems(prev => prev.map(i => {
      if (i.id !== productoId) return i
      if (cantidad > i.stock) {
        toast.error(`Stock máximo: ${i.stock}`)
        return i
      }
      return { ...i, cantidad }
    }))
  }, [])

  const vaciar = useCallback(() => setItems([]), [])

  const total = items.reduce((acc, i) => acc + i.precio * i.cantidad, 0)
  const cantidadTotal = items.reduce((acc, i) => acc + i.cantidad, 0)

  return (
    <CartContext.Provider value={{
      items,
      total,
      cantidadTotal,
      drawerOpen,
      setDrawerOpen,
      agregar,
      quitar,
      cambiarCantidad,
      vaciar,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
