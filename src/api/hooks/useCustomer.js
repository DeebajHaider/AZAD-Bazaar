import { useState, useEffect, useCallback } from 'react'
import customerService from '../customerService'

export default function useCustomer(id, options = { immediate: true }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetch = useCallback(async () => {
    if (!id) return null
    setLoading(true)
    setError(null)
    try {
      const res = await customerService.getCustomer(id)
      setData(res)
      return res
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (options && options.immediate) fetch()
  }, [fetch])

  return { data, loading, error, refetch: fetch }
}
