'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Camera, ChevronRight, Package, Loader2, X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useSearch, useShelf } from '@/lib/api/hooks'
import { analytics } from '@/lib/analytics'

// Design system colors [[memory:13485295]]
const colors = {
  bgPrimary: '#FDFCFB',
  bgSecondary: '#F7F5F3',
  bgTertiary: '#EDE9E4',
  bgDark: '#1A1714',
  textPrimary: '#1A1714',
  textSecondary: '#6B6259',
  textTertiary: '#8C8177',
  accentGreen: '#2D7A4F',
  accentGreenLight: '#E8F5EC',
  accentGreenDark: '#246840',
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

export default function ScannerPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { user } = useAuth()
  const { items: shelfItems } = useShelf()
  const { results, isLoading: isSearching, search, clearResults } = useSearch()

  // Debounced search with analytics
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        search(searchQuery)
      } else {
        clearResults()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, search, clearResults])

  // Track search results
  useEffect(() => {
    if (results && searchQuery.length >= 2) {
      if (results.products.length === 0) {
        analytics.searchNoResults(searchQuery)
      } else {
        analytics.search.search(searchQuery, results.total)
      }
    }
  }, [results, searchQuery])

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.length >= 2) {
      router.push(`/app/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }, [searchQuery, router])

  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
    clearResults()
  }, [clearResults])

  // Recent items from shelf (last 5)
  const recentItems = shelfItems.slice(0, 5)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Welcome Message */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 600,
          color: colors.textPrimary,
          margin: 0,
          marginBottom: '8px',
        }}>
          Привет{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
        </h1>
        <p style={{ 
          color: colors.textSecondary, 
          margin: 0,
          fontSize: '1rem',
        }}>
          Найди продукт по названию или бренду
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '24px' }}>
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
          placeholder="Найти продукт по названию или бренду..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          style={{
            width: '100%',
            height: '56px',
            paddingLeft: '48px',
            paddingRight: searchQuery ? '48px' : '16px',
            borderRadius: '16px',
            fontSize: '1rem',
            backgroundColor: isFocused ? colors.bgPrimary : colors.bgSecondary,
            color: colors.textPrimary,
            border: `2px solid ${isFocused ? colors.accentGreen : 'transparent'}`,
            outline: 'none',
            boxSizing: 'border-box',
            transition: 'all 0.2s ease',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
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

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {isFocused && searchQuery.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '8px',
                backgroundColor: colors.bgPrimary,
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                zIndex: 100,
                maxHeight: '400px',
                overflow: 'auto',
              }}
            >
              {isSearching ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px',
                  gap: '8px',
                  color: colors.textSecondary,
                }}>
                  <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  Поиск...
                </div>
              ) : results && results.products.length > 0 ? (
                <div style={{ padding: '8px' }}>
                  {results.products.slice(0, 5).map((product, index) => (
                    <Link
                      key={product.id}
                      href={`/app/product/${product.id}`}
                      onClick={() => analytics.searchResultClick(product.id, index)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '12px',
                        textDecoration: 'none',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.bgSecondary}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        backgroundColor: colors.bgTertiary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
                        flexShrink: 0,
                      }}>
                        {product.imageUrl ? (
                          <Image src={product.imageUrl} alt="" fill style={{ objectFit: 'cover' }} />
                        ) : (
                          <span>🧴</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontWeight: 500,
                          color: colors.textPrimary,
                          fontSize: '0.9375rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {product.name}
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: colors.textTertiary }}>
                          {product.brand || 'Без бренда'}
                        </div>
                      </div>
                      {product.score !== null && (
                        <div style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                          color: 'white',
                          backgroundColor: getScoreColor(product.score),
                        }}>
                          {product.score}
                        </div>
                      )}
                    </Link>
                  ))}
                  {results.total > 5 && (
                    <Link
                      href={`/app/search?q=${encodeURIComponent(searchQuery)}`}
                      style={{
                        display: 'block',
                        padding: '12px',
                        textAlign: 'center',
                        color: colors.accentGreen,
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        textDecoration: 'none',
                      }}
                    >
                      Показать все {results.total} результатов →
                    </Link>
                  )}
                </div>
              ) : results && results.products.length === 0 ? (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: colors.textSecondary,
                }}>
                  Ничего не найдено по запросу «{searchQuery}»
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Scan Area - Compact */}
      <motion.div 
        style={{ 
          position: 'relative',
          borderRadius: '20px',
          overflow: 'hidden',
          marginBottom: '24px',
          backgroundColor: colors.bgDark,
          aspectRatio: '16/9',
        }}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        {/* Corner markers */}
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          left: '12px', 
          width: '32px', 
          height: '32px', 
          borderLeft: `3px solid ${colors.accentGreen}`,
          borderTop: `3px solid ${colors.accentGreen}`,
          borderRadius: '6px 0 0 0',
        }} />
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px', 
          width: '32px', 
          height: '32px', 
          borderRight: `3px solid ${colors.accentGreen}`,
          borderTop: `3px solid ${colors.accentGreen}`,
          borderRadius: '0 6px 0 0',
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '12px', 
          left: '12px', 
          width: '32px', 
          height: '32px', 
          borderLeft: `3px solid ${colors.accentGreen}`,
          borderBottom: `3px solid ${colors.accentGreen}`,
          borderRadius: '0 0 0 6px',
        }} />
        <div style={{ 
          position: 'absolute', 
          bottom: '12px', 
          right: '12px', 
          width: '32px', 
          height: '32px', 
          borderRight: `3px solid ${colors.accentGreen}`,
          borderBottom: `3px solid ${colors.accentGreen}`,
          borderRadius: '0 0 6px 0',
        }} />
        
        {/* Scan line */}
        <motion.div 
          animate={{ top: ['20%', '75%', '20%'] }}
          transition={{ duration: 2.5, ease: 'easeInOut', repeat: Infinity }}
          style={{
            position: 'absolute',
            left: '10%',
            right: '10%',
            height: '2px',
            borderRadius: '2px',
            background: `linear-gradient(90deg, transparent, ${colors.accentGreen}, transparent)`,
            boxShadow: `0 0 15px ${colors.accentGreen}`,
          }}
        />

        {/* Camera icon */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              padding: '14px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255,255,255,0.1)',
            }}
          >
            <Camera size={28} color="white" strokeWidth={1.5} />
          </motion.div>
        </div>

        {/* Hint */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          borderRadius: '9999px',
          fontSize: '0.8125rem',
          whiteSpace: 'nowrap',
          backgroundColor: 'rgba(0,0,0,0.6)',
          color: 'white',
        }}>
          📷 Скоро: сканирование штрих-кода
        </div>
      </motion.div>

      {/* Browse Products Button */}
      <Link 
        href="/app/encyclopedia" 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '16px 24px',
          borderRadius: '16px',
          fontSize: '1rem',
          fontWeight: 600,
          backgroundColor: colors.accentGreen,
          color: 'white',
          textDecoration: 'none',
          marginBottom: '32px',
          boxShadow: '0 4px 16px rgba(45, 122, 79, 0.3)',
        }}
      >
        <Search size={22} />
        Каталог продуктов
      </Link>

      {/* Recent Items from Shelf */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: 0,
          }}>
            Моя полка
          </h2>
          {recentItems.length > 0 && (
            <Link
              href="/app/shelf"
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: colors.accentGreen,
                textDecoration: 'none',
              }}
            >
              Все продукты →
            </Link>
          )}
        </div>

        {recentItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              textAlign: 'center',
              padding: '32px 24px',
              backgroundColor: colors.bgSecondary,
              borderRadius: '16px',
            }}
          >
            <Package size={40} style={{ color: colors.textTertiary, marginBottom: '12px' }} />
            <h3 style={{ 
              color: colors.textPrimary, 
              margin: 0, 
              marginBottom: '8px',
              fontSize: '1rem',
            }}>
              Полка пуста
            </h3>
            <p style={{ 
              color: colors.textSecondary, 
              margin: 0,
              fontSize: '0.875rem',
            }}>
              Найдите продукт и добавьте его на полку
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={`/app/product/${item.product.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px',
                    borderRadius: '14px',
                    backgroundColor: colors.bgSecondary,
                    textDecoration: 'none',
                  }}
                >
                  {/* Product Image */}
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    backgroundColor: colors.bgTertiary,
                    flexShrink: 0,
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    {item.product.imageUrl ? (
                      <Image src={item.product.imageUrl} alt="" fill style={{ objectFit: 'cover' }} />
                    ) : (
                      '🧴'
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontWeight: 500,
                      color: colors.textPrimary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: '2px',
                      fontSize: '0.9375rem',
                    }}>
                      {item.product.name}
                    </div>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: colors.textTertiary,
                    }}>
                      {item.product.brand || 'Без бренда'}
                    </div>
                  </div>
                  
                  <ChevronRight size={18} style={{ color: colors.textTertiary, flexShrink: 0 }} />
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </motion.div>
  )
}
