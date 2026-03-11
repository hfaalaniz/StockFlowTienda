import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authTiendaApi } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('sf_tienda_token'))
  const [loading, setLoading] = useState(true)

  // Validar token al iniciar
  useEffect(() => {
    if (!token) { setLoading(false); return }
    authTiendaApi.me()
      .then(res => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('sf_tienda_token')
        localStorage.removeItem('sf_tienda_user')
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(async (email, password) => {
    const res = await authTiendaApi.login(email, password)
    const { token: tk, cliente } = res.data
    localStorage.setItem('sf_tienda_token', tk)
    setToken(tk)
    setUser(cliente)
    return cliente
  }, [])

  const loginOAuth = useCallback(async (provider, oauthToken) => {
    const res = await authTiendaApi.loginOAuth(provider, oauthToken)
    const { token: tk, cliente } = res.data
    localStorage.setItem('sf_tienda_token', tk)
    setToken(tk)
    setUser(cliente)
    return cliente
  }, [])

  const registro = useCallback(async (datos) => {
    const res = await authTiendaApi.registro(datos)
    const { token: tk, cliente } = res.data
    localStorage.setItem('sf_tienda_token', tk)
    setToken(tk)
    setUser(cliente)
    return cliente
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('sf_tienda_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, loginOAuth, registro, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
