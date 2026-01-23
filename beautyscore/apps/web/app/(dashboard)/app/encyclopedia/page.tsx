'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, ChevronRight, Book, Beaker, Filter, X, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { api } from '@/lib/api'

interface Product {
  id: string
  itemId: string
  name: string
  brand: string | null
  productType: string | null
  category: string
  imageUrl: string | null
  priceRegular: number | null
  priceDiscount: number | null
  discountPercent: number | null
  score: number | null
  inStock: boolean
}

interface Ingredient {
  id: string
  nameRu: string
  nameEn: string | null
  nameInci: string | null
  safetyRating: string
  category: string
}

interface Category {
  id: string
  name: string
  count: number
}

interface Brand {
  name: string
  count: number
}

interface PaginatedResponse<T> {
  products?: T[]
  ingredients?: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

type Tab = 'products' | 'ingredients'

const ITEMS_PER_PAGE = 20

const safetyColors: Record<string, { bg: string; text: string }> = {
  SAFE: { bg: '#E8F5EC', text: '#2D7A4F' },
  GENERALLY_SAFE: { bg: '#E8F5EC', text: '#2D7A4F' },
  MODERATE_CONCERN: { bg: '#FEF3C7', text: '#D97706' },
  HIGH_CONCERN: { bg: '#FEE2E2', text: '#DC2626' },
  AVOID: { bg: '#FEE2E2', text: '#DC2626' },
}

const safetyLabels: Record<string, string> = {
  SAFE: 'Безопасно',
  GENERALLY_SAFE: 'Безопасно',
  MODERATE_CONCERN: 'Умеренный риск',
  HIGH_CONCERN: 'Высокий риск',
  AVOID: 'Избегать',
}

export default function EncyclopediaPage() {
  const [tab, setTab] = useState<Tab>('products')
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [total, setTotal] = useState(0)
  
  // Ref for infinite scroll observer
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  // Load initial data
  useEffect(() => {
    loadFilters()
  }, [])

  // Reset and reload data when filters change
  useEffect(() => {
    setPage(1)
    setProducts([])
    setIngredients([])
    setHasMore(true)
    loadData(1, true)
  }, [tab, selectedCategory, selectedBrand, searchQuery])

  // Setup intersection observer for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting && hasMore && !isLoading && !isLoadingMore) {
          loadMore()
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
  }, [hasMore, isLoading, isLoadingMore, page])

  const loadFilters = async () => {
    try {
      const data = await api.get<{
        categories: Category[]
        brands: Brand[]
      }>('/encyclopedia/filters')
      setCategories(data.categories)
      setBrands(data.brands)
    } catch (err) {
      console.error('Failed to load filters:', err)
    }
  }

  const loadData = async (pageNum: number, reset: boolean = false) => {
    if (reset) {
      setIsLoading(true)
    } else {
      setIsLoadingMore(true)
    }
    
    try {
      if (tab === 'products') {
        const params = new URLSearchParams()
        params.set('page', String(pageNum))
        params.set('limit', String(ITEMS_PER_PAGE))
        if (searchQuery) params.set('search', searchQuery)
        if (selectedCategory) params.set('category', selectedCategory)
        if (selectedBrand) params.set('brand', selectedBrand)
        
        const data = await api.get<PaginatedResponse<Product>>(
          `/encyclopedia/products?${params.toString()}`
        )
        
        if (reset) {
          setProducts(data.products || [])
        } else {
          setProducts(prev => [...prev, ...(data.products || [])])
        }
        setHasMore(data.hasMore)
        setTotal(data.total)
      } else {
        const params = new URLSearchParams()
        params.set('page', String(pageNum))
        params.set('limit', String(ITEMS_PER_PAGE))
        if (searchQuery) params.set('search', searchQuery)
        
        const data = await api.get<PaginatedResponse<Ingredient>>(
          `/encyclopedia/ingredients?${params.toString()}`
        )
        
        if (reset) {
          setIngredients(data.ingredients || [])
        } else {
          setIngredients(prev => [...prev, ...(data.ingredients || [])])
        }
        setHasMore(data.hasMore)
        setTotal(data.total)
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
      setIsLoadingMore(false)
    }
  }

  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadData(nextPage, false)
    }
  }, [page, isLoadingMore, hasMore])

  const clearFilters = () => {
    setSelectedCategory(null)
    setSelectedBrand(null)
    setSearchQuery('')
  }

  const hasActiveFilters = selectedCategory || selectedBrand || searchQuery

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#1A1714',
          marginBottom: '8px',
        }}>
          Энциклопедия
        </h1>
        <p style={{ color: '#6B6259' }}>
          Изучай продукты и ингредиенты
        </p>
      </div>

      {/* Search */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
      }}>
        <div style={{
          flex: 1,
          position: 'relative',
        }}>
          <Search
            size={20}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#8C8177',
            }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tab === 'products' ? 'Поиск продуктов...' : 'Поиск ингредиентов...'}
            style={{
              width: '100%',
              padding: '14px 14px 14px 46px',
              backgroundColor: '#F7F5F3',
              border: 'none',
              borderRadius: '14px',
              fontSize: '1rem',
              color: '#1A1714',
              outline: 'none',
            }}
          />
        </div>
        {tab === 'products' && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              padding: '14px',
              backgroundColor: showFilters ? '#2D7A4F' : '#F7F5F3',
              color: showFilters ? 'white' : '#1A1714',
              border: 'none',
              borderRadius: '14px',
              cursor: 'pointer',
            }}
          >
            <Filter size={20} />
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && tab === 'products' && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          style={{
            backgroundColor: '#F7F5F3',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: 600, color: '#1A1714' }}>Фильтры</span>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'none',
                  border: 'none',
                  color: '#2D7A4F',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                <X size={14} />
                Сбросить
              </button>
            )}
          </div>

          {/* Categories */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.75rem', color: '#6B6259', marginBottom: '8px', display: 'block' }}>
              Категории
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: selectedCategory === cat.id ? '#2D7A4F' : 'white',
                    color: selectedCategory === cat.id ? 'white' : '#1A1714',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          <div>
            <span style={{ fontSize: '0.75rem', color: '#6B6259', marginBottom: '8px', display: 'block' }}>
              Бренды
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {brands.map(brand => (
                <button
                  key={brand.name}
                  onClick={() => setSelectedBrand(selectedBrand === brand.name ? null : brand.name)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: selectedBrand === brand.name ? '#2D7A4F' : 'white',
                    color: selectedBrand === brand.name ? 'white' : '#1A1714',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                  }}
                >
                  {brand.name} ({brand.count})
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '20px',
        backgroundColor: '#F7F5F3',
        padding: '4px',
        borderRadius: '12px',
      }}>
        <button
          onClick={() => setTab('products')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: tab === 'products' ? 'white' : 'transparent',
            color: tab === 'products' ? '#1A1714' : '#6B6259',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Book size={18} />
          Продукты
        </button>
        <button
          onClick={() => setTab('ingredients')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            backgroundColor: tab === 'ingredients' ? 'white' : 'transparent',
            color: tab === 'ingredients' ? '#1A1714' : '#6B6259',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Beaker size={18} />
          Ингредиенты
        </button>
      </div>

      {/* Results count */}
      {!isLoading && total > 0 && (
        <div style={{
          fontSize: '0.875rem',
          color: '#6B6259',
          marginBottom: '16px',
        }}>
          Найдено: {total} {tab === 'products' ? 'продуктов' : 'ингредиентов'}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '48px',
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #EDE9E4',
            borderTopColor: '#2D7A4F',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : tab === 'products' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {products.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#6B6259',
            }}>
              <Book size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Продукты не найдены</p>
            </div>
          ) : (
            <>
              {products.map(product => (
                <Link
                  key={product.id}
                  href={`/app/product/${product.id}`}
                  style={{ textDecoration: 'none' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      border: '1px solid #EDE9E4',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.2s',
                    }}
                  >
                    {/* Image */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '12px',
                      backgroundColor: '#F7F5F3',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}>
                      {product.imageUrl && (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#6B6259',
                        marginBottom: '4px',
                      }}>
                        {product.brand}
                      </div>
                      <div style={{
                        fontWeight: 600,
                        color: '#1A1714',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {product.name}
                      </div>
                      <div style={{
                        fontSize: '0.8125rem',
                        color: '#8C8177',
                        marginBottom: '8px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {product.productType}
                      </div>

                      {/* Price */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {product.priceDiscount && (
                          <span style={{ fontWeight: 600, color: '#2D7A4F' }}>
                            {product.priceDiscount} ₽
                          </span>
                        )}
                        {product.priceRegular && (
                          <span style={{
                            fontSize: '0.875rem',
                            color: '#8C8177',
                            textDecoration: product.priceDiscount ? 'line-through' : 'none',
                          }}>
                            {product.priceRegular} ₽
                          </span>
                        )}
                        {product.discountPercent && (
                          <span style={{
                            padding: '2px 6px',
                            backgroundColor: '#FEE2E2',
                            color: '#DC2626',
                            fontSize: '0.75rem',
                            borderRadius: '4px',
                            fontWeight: 500,
                          }}>
                            -{product.discountPercent}%
                          </span>
                        )}
                      </div>
                    </div>

                    <ChevronRight size={20} style={{ color: '#C4BFBA', flexShrink: 0 }} />
                  </motion.div>
                </Link>
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
                  color: '#6B6259',
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
                  color: '#8C8177',
                  fontSize: '0.875rem',
                }}>
                  Показаны все {total} продуктов
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ingredients.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '48px',
              color: '#6B6259',
            }}>
              <Beaker size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>Ингредиенты не найдены</p>
            </div>
          ) : (
            <>
              {ingredients.map(ingredient => {
                const defaultSafety = { bg: '#E8F5EC', text: '#2D7A4F' }
                const safety = safetyColors[ingredient.safetyRating] || defaultSafety
                const safetyLabel = safetyLabels[ingredient.safetyRating] || 'Неизвестно'
                return (
                  <motion.div
                    key={ingredient.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '16px',
                      backgroundColor: 'white',
                      borderRadius: '16px',
                      border: '1px solid #EDE9E4',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Safety indicator */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: safety.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Beaker size={24} style={{ color: safety.text }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 600,
                        color: '#1A1714',
                        marginBottom: '4px',
                      }}>
                        {ingredient.nameRu}
                      </div>
                      <div style={{
                        fontSize: '0.8125rem',
                        color: '#8C8177',
                      }}>
                        {ingredient.nameInci || ingredient.nameEn}
                      </div>
                    </div>

                    {/* Safety badge */}
                    <div style={{
                      padding: '4px 10px',
                      backgroundColor: safety.bg,
                      color: safety.text,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      borderRadius: '6px',
                      flexShrink: 0,
                    }}>
                      {safetyLabel}
                    </div>

                    <ChevronRight size={20} style={{ color: '#C4BFBA', flexShrink: 0 }} />
                  </motion.div>
                )
              })}
              
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
                  color: '#6B6259',
                }}>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Загрузка...</span>
                </div>
              )}
              
              {/* End of list */}
              {!hasMore && ingredients.length > 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '24px',
                  color: '#8C8177',
                  fontSize: '0.875rem',
                }}>
                  Показаны все {total} ингредиентов
                </div>
              )}
            </>
          )}
        </div>
      )}
    </motion.div>
  )
}
