import React, { createContext, useContext, useState, useEffect, useCallback, useRef, useMemo } from 'react'
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

  const getAllCategories = useCallback(async (force = false) => {
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

  const getMainCategories = useCallback(async () => {
    const all = await getAllCategories()
    if (!all) return []
    return all.filter(c => !c.parentCategoryIds || c.parentCategoryIds.length === 0)
  }, [getAllCategories])

  const getSubCategories = useCallback(async () => {
    const all = await getAllCategories()
    if (!all) return []
    return all.filter(c => c.parentCategoryIds && c.parentCategoryIds.length > 0)
  }, [getAllCategories])

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

  const mainCategories = useMemo(() => {
    if (!categories) return []
    return categories.filter(c => !c.parentCategoryIds || c.parentCategoryIds.length === 0)
  }, [categories])

  const subCategories = useMemo(() => {
    if (!categories) return []
    return categories.filter(c => c.parentCategoryIds && c.parentCategoryIds.length > 0)
  }, [categories])

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
    mainCategories,
    subCategories,
    brands,
    loading,
    error,
    getAllCategories,
    getMainCategories,
    getSubCategories,
    fetchCategories: getAllCategories,
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
