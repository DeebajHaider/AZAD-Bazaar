import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import categoryService from '../api/categoryService'
import brandService from '../api/brandService'

const DataContext = createContext(null)

const FIVE_MIN = 5 * 60 * 1000

export function DataProvider({ children }) {
  const [categories, setCategories] = useState(null)
  const [brands, setBrands] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const tsRef = useRef(0)

  const isExpired = useCallback(() => {
    return Date.now() - tsRef.current > FIVE_MIN
  }, [])

  const fetchCategories = useCallback(async (force = false) => {
    if (!force && categories && !isExpired()) return categories
    setLoading(true)
    setError(null)
    try {
      const data = await categoryService.getCategories()
      setCategories(data)
      tsRef.current = Date.now()
      return data
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [categories, isExpired])

  const fetchBrands = useCallback(async (force = false) => {
    if (!force && brands && !isExpired()) return brands
    setLoading(true)
    setError(null)
    try {
      const data = await brandService.getBrands()
      setBrands(data)
      tsRef.current = Date.now()
      return data
    } catch (err) {
      setError(err)
      return null
    } finally {
      setLoading(false)
    }
  }, [brands, isExpired])

  // Prefetch on mount
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const [cats, brs] = await Promise.all([categoryService.getCategories(), brandService.getBrands()])
        if (!mounted) return
        setCategories(cats)
        setBrands(brs)
        tsRef.current = Date.now()
      } catch (err) {
        if (!mounted) return
        setError(err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const value = {
    categories,
    brands,
    loading,
    error,
    fetchCategories,
    fetchBrands,
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}

export default DataContext
