import axios from 'axios'

// Resuelve URLs de imagen. Rutas relativas (/uploads/...) se sirven a través del
// proxy de Vite en dev (misma origin → sin CORP/CORS), o con origin absoluta en prod.
export const resolveImagen = (url) => {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  // En dev Vite proxea /uploads → localhost:4000, misma origin, sin bloqueos.
  // En prod (same-origin) la ruta relativa ya apunta al backend correcto.
  return url
}

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/tienda`
  : '/api/tienda'

const api = axios.create({ baseURL, timeout: 15000 })

// Interceptor: adjuntar token JWT del cliente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sf_tienda_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Interceptor: limpiar token si expira
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sf_tienda_token')
      localStorage.removeItem('sf_tienda_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Catálogo (público) ──────────────────────────────────────────────────────
export const catalogoApi = {
  listarProductos: (params = {}) => api.get('/productos', {
    params: {
      // Evita recortes por defaults de backend y permite override por pantalla.
      solo_activos: 'false',
      con_stock: 'false',
      ...params,
    },
  }),
  getProducto: (id) => api.get(`/productos/${id}`),
  getStock: (id) => api.get(`/productos/${id}/stock`),
  listarCategorias: () => api.get('/categorias'),
  calcularPromos: (body) => api.post('/promociones/calcular', body),
}

// ─── Auth de clientes ─────────────────────────────────────────────────────────
export const authTiendaApi = {
  login: (email, password) => api.post('/login', { email, password }),
  loginOAuth: (provider, token) => api.post('/oauth', { provider, token }),
  registro: (datos) => api.post('/registro', datos),
  me: () => api.get('/me'),
  cambiarPassword: (actual, nueva) => api.put('/password', { actual, nueva }),
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
export const checkoutApi = {
  crearOrden: (body) => api.post('/checkout', body),
  getLinkMercadoPago: (ordenId) => api.get(`/ordenes/${ordenId}/link-pago`),
  confirmarStripe: (body) => api.post('/stripe/confirm', body),
}

// ─── Mis compras ──────────────────────────────────────────────────────────────
export const misComprasApi = {
  listar: (params) => api.get('/mis-compras', { params }),
  getOrden: (id) => api.get(`/mis-compras/${id}`),
}

// ─── Cuenta ───────────────────────────────────────────────────────────────────
export const cuentaApi = {
  getPerfil: () => api.get('/me'),
  actualizarPerfil: (datos) => api.put('/me', datos),
  cambiarPassword: (actual, nueva) => api.put('/password', { actual, nueva }),
  getPuntos: () => api.get('/mis-puntos'),
}

export default api
