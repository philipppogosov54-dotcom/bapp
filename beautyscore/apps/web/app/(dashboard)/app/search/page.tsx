'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Search, ChevronRight, Loader2, Package, Filter } from 'lucide-react'
import { useSearch } from '@/lib/api/hooks'

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

function getScoreColor(score: number | null): string {
  if (score === null) return colors.textTertiary
  if (score >= 85) return colors.scoreExcellent
  if (score >= 70) return colors.scoreGood
  if (score >= 50) return colors.scoreAvg
  return colors.scorePoor
}

function SearchContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''
  
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const { results, isLoading, search, clearResults } = useSearch()

  // Search on initial load if query exists
  useEffect(() => {
    if (initialQuery) {
      search(initialQuery)
    }
  }, [initialQuery, search])

  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.length >= 2) {
      search(searchQuery)
      // Update URL without navigation
      window.history.replaceState({}, '', `/app/search?q=${encodeURIComponent(searchQuery)}`)
    }
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
                paddingRight: '16px',
                borderRadius: '14px',
                fontSize: '1rem',
                backgroundColor: colors.bgSecondary,
                color: colors.textPrimary,
                border: '2px solid transparent',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
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
      ) : results ? (
        <>
          {/* Results Count */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}>
            <p style={{ color: colors.textSecondary, margin: 0 }}>
              Найдено: <strong>{results.total}</strong> {results.total === 1 ? 'продукт' : 'продуктов'}
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
          {results.products.length === 0 ? (
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {results.products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
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
                      }}>
                        {product.brand || 'Без бренда'}{product.productType ? ` • ${product.productType}` : ''}
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
            </div>
          )}
        </>
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
