'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, ChevronRight, Loader2, Package, Filter, X } from 'lucide-react'
import { api } from '@/lib/api'

// Design system colors [[memory:13485295]]
const colors = {
  bgPrimary: '#FDFCFB',
  bgSecondary: '#F7F5F3',
  bgTertiary: '#EDE9E4',
  textPrimary: '#1A1714',
  textSecondary: '#6B6259',
  textTertiary: '#8C8177',
  accentGreen: '#2D7A4F',
  accentGreenLight: '#E8F5EC',
  scoreExcellent: '#2D7A4F',
  scoreGood: '#5B9A6F',
  scoreAvg: '#C49234',
  scorePoor: '#C45252',
}

interface Product {
  id: string
  name: string
  brand: string | null
  productType: string | null
  imageUrl: string | null
  priceRegular: number | null
  priceDiscount: number | null
  score: number | null
}

interface SearchResult {
  products: Product[]
  total: number
  page: number
  hasMore: boolean
}

function getScoreColor(score: number | null): string {
  if (score === null) return colors.textTertiary
  if (score >= 85) return colors.scoreExcellent
  if (score >= 70) return colors.scoreGood
  if (score >= 50) return colors.scoreAvg
  return colors.scorePoor
}

const ITEMS_PER_PAGE = 20

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [products, setProducts] = useState<Product[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Ref for infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Load products with pagination
  const loadProducts = useCallback(async (query: string, pageNum: number, reset: boolean = false) => {
    if (!query || query.length < 2) {
      setProducts([])
      setTotal(0)
      setHasMore(false)
      return
    }

    if (reset) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    setError(null)

    try {
      const params = new URLSearchParams({
        q: query.slice(0, 500),
        page: String(pageNum),
        limit: String(ITEMS_PER_PAGE),
      })
      
      const data = await api.get<SearchResult>(`/search?${params}`)
      
      if (reset) {
        setProducts(data.products)
      } else {
        setProducts(prev => [...prev, ...data.products])
      }
      setTotal(data.total)
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка поиска')
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }, [])

  // Search on initial load if query exists
  useEffect(() => {
    if (initialQuery) {
      setPage(1)
      loadProducts(initialQuery, 1, true)
    }
  }, [initialQuery, loadProducts])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasMore && !isLoading && !isLoadingMore && searchQuery.length >= 2) {
          const nextPage = page + 1
          setPage(nextPage)
          loadProducts(searchQuery, nextPage, false)
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoading, isLoadingMore, page, searchQuery, loadProducts])

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.length >= 2) {
      setPage(1)
      setProducts([])
      setHasMore(true)
      loadProducts(searchQuery, 1, true)
      // Update URL without navigation
      window.history.replaceState({}, '', `/app/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleClear = () => {
    setSearchQuery('')
    setProducts([])
    setTotal(0)
    setHasMore(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Search size={28} style={{ color: colors.accentGreen }} />
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: 0,
          }}>
            Поиск
          </h1>
        </div>
        <p style={{ color: colors.textSecondary, margin: 0 }}>
          Найдите продукт по названию или бренду
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search 
              size={20} 
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textTertiary,
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Название или бренд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                height: '52px',
                paddingLeft: '48px',
                paddingRight: searchQuery ? '48px' : '16px',
                borderRadius: '14px',
                fontSize: '1rem',
                backgroundColor: colors.bgSecondary,
                color: colors.textPrimary,
                border: '2px solid transparent',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '4px',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: colors.textTertiary,
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searchQuery.length < 2}
            style={{
              padding: '0 24px',
              borderRadius: '14px',
              backgroundColor: colors.accentGreen,
              color: 'white',
              border: 'none',
              cursor: searchQuery.length < 2 ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              opacity: searchQuery.length < 2 ? 0.5 : 1,
            }}
          >
            Найти
          </button>
        </div>
      </form>

      {/* Results */}
      {isLoading ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          gap: '16px',
        }}>
          <Loader2 size={32} style={{ color: colors.accentGreen, animation: 'spin 1s linear infinite' }} />
          <p style={{ color: colors.textSecondary }}>Поиск...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : products.length > 0 ? (
        <>
          {/* Results Count */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <p style={{ color: colors.textSecondary, margin: 0 }}>
              Найдено: <strong>{total}</strong> продуктов
            </p>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '10px',
                backgroundColor: colors.bgSecondary,
                color: colors.textSecondary,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              <Filter size={16} />
              Фильтры
            </button>
          </div>

          {/* Products List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {products.map((product, index) => (
              <motion.div
                key={`${product.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.02, 0.5) }}
              >
                <Link
                  href={`/app/product/${product.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '16px',
                    borderRadius: '16px',
                    backgroundColor: colors.bgSecondary,
                    textDecoration: 'none',
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '12px',
                    backgroundColor: colors.bgTertiary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {product.imageUrl ? (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <span style={{ fontSize: '1.5rem' }}>🧴</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 500,
                      color: colors.textPrimary,
                      marginBottom: '4px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {product.name}
                    </div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: colors.textTertiary,
                      marginBottom: '4px',
                    }}>
                      {product.brand || 'Без бренда'}{product.productType ? ` • ${product.productType}` : ''}
                    </div>
                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {product.priceDiscount && (
                        <span style={{ fontWeight: 600, color: colors.accentGreen, fontSize: '0.875rem' }}>
                          {product.priceDiscount} ₽
                        </span>
                      )}
                      {product.priceRegular && (
                        <span style={{
                          fontSize: '0.8125rem',
                          color: colors.textTertiary,
                          textDecoration: product.priceDiscount ? 'line-through' : 'none',
                        }}>
                          {product.priceRegular} ₽
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Score */}
                  {product.score !== null && (
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'white',
                      backgroundColor: getScoreColor(product.score),
                      flexShrink: 0,
                    }}>
                      {product.score}
                    </div>
                  )}

                  <ChevronRight size={20} style={{ color: colors.textTertiary, flexShrink: 0 }} />
                </Link>
              </motion.div>
            ))}
            
            {/* Infinite scroll sentinel */}
            <div ref={loadMoreRef} style={{ height: '20px' }} />
            
            {/* Loading more indicator */}
            {isLoadingMore && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                padding: '24px',
                color: colors.textSecondary,
              }}>
                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Загрузка...</span>
              </div>
            )}
            
            {/* End of list */}
            {!hasMore && products.length > 0 && (
              <div style={{
                textAlign: 'center',
                padding: '24px',
                color: colors.textTertiary,
                fontSize: '0.875rem',
              }}>
                Показаны все {total} продуктов
              </div>
            )}
          </div>
        </>
      ) : searchQuery.length >= 2 && !isLoading ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: colors.bgSecondary,
          borderRadius: '16px',
        }}>
          <Package size={48} style={{ color: colors.textTertiary, marginBottom: '16px' }} />
          <h3 style={{ color: colors.textPrimary, marginBottom: '8px' }}>
            Ничего не найдено
          </h3>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            Попробуйте изменить поисковый запрос
          </p>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: colors.bgSecondary,
          borderRadius: '16px',
        }}>
          <Search size={48} style={{ color: colors.textTertiary, marginBottom: '16px' }} />
          <h3 style={{ color: colors.textPrimary, marginBottom: '8px' }}>
            Введите запрос
          </h3>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            Минимум 2 символа для поиска
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
      }}>
        <Loader2 size={32} style={{ color: colors.accentGreen, animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
