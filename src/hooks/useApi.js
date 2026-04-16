import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

/**
 * Hook genérico para fetch de datos.
 * @param {Function} fetchFn - función async que retorna un axios response
 * @param {Array} deps - dependencias que disparan el refetch
 * @param {Object} opts - { initialData, showError, enabled, pollInterval }
 *   pollInterval: ms entre refetches automáticos (solo cuando la pestaña está visible).
 *                 0 o undefined = sin polling.
 */
export function useFetch(fetchFn, deps = [], opts = {}) {
  const { initialData = null, showError = true, enabled = true, pollInterval = 0 } = opts
  const [data, setData] = useState(initialData)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState(null)
  const isMounted = useRef(true)

  useEffect(() => {
    isMounted.current = true
    return () => { isMounted.current = false }
  }, [])

  const fetch = useCallback(async () => {
    if (!enabled) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn()
      if (isMounted.current) setData(res.data)
    } catch (err) {
      if (isMounted.current) {
        const msg = err.response?.data?.error || err.message || 'Error al cargar datos'
        setError(msg)
        if (showError) toast.error(msg)
      }
    } finally {
      if (isMounted.current) setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { fetch() }, [fetch])

  // Polling: refresca cada `pollInterval` ms cuando la pestaña está activa
  useEffect(() => {
    if (!pollInterval || pollInterval <= 0) return

    let timerId = null

    const schedule = () => {
      timerId = setTimeout(async () => {
        if (!isMounted.current) return
        if (document.visibilityState === 'visible') {
          await fetch()
        }
        if (isMounted.current) schedule()
      }, pollInterval)
    }

    schedule()

    // Si el usuario vuelve a la pestaña, refetch inmediato
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timerId)
        fetch().then(() => { if (isMounted.current) schedule() })
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearTimeout(timerId)
      document.removeEventListener('visibilitychange', onVisible)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch, pollInterval])

  return { data, loading, error, refetch: fetch }
}
