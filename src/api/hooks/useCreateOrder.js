import { useState } from 'react'
import orderService from '../orderService'

export default function useCreateOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [order, setOrder] = useState(null)

  const createOrder = async (orderData) => {
    try {
      setLoading(true)
      setError(null)
      const newOrder = await orderService.createOrder(orderData)
      setOrder(newOrder)
      return newOrder
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createOrder, loading, error, order }
}
