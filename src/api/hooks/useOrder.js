import { useState, useEffect }
from 'react'
import orderService from '../orderService'

export default function useOrder(orderId) {
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!orderId) {
      setOrder(null)
      setLoading(false)
      setError(null)
      return
    }

    async function fetchOrder() {
      try {
        setLoading(true)
        const data = await orderService.getOrderById(orderId)
        setOrder(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  return {
    order,
    loading,
    error
  }
}