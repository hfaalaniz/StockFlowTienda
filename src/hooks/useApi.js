import { useState, useEffect, useCallback, useRef } from 'react'
import toast from 'react-hot-toast'

/**
 * Hook genérico para fetch de datos.
 * @param {Function} fetchFn - función async que retorna un axios response
 * @param {Array} deps - dependencias que disparan el refetch
 * @param {Object} opts - { initialData, showError, enabled }
 */
export function useFetch(fetchFn, deps = [], opts = {}) {
  const { initialData = null, showError = true, enabled = true } = opts
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

  return { data, loading, error, refetch: fetch }
}
