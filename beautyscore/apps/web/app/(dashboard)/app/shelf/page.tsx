'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, ChevronRight, Search, Filter, Trash2, Undo2, AlertCircle, RefreshCw, Ban } from 'lucide-react'
import { useShelf, useShelfAnalysis, ShelfItem } from '@/lib/api/hooks'
import { ShelfListSkeleton, StatsCardsSkeleton, ShelfAnalysisCard, FiltersModal, FilterOptions } from '@/components/ui'
import { analytics } from '@/lib/analytics'

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

// Время для undo (по PRD - 30 секунд)
const UNDO_TIMEOUT_MS = 30 * 1000

function getScoreColor(score: number | null): string {
  if (score === null) return colors.textTertiary
  if (score >= 85) return colors.scoreExcellent
  if (score >= 70) return colors.scoreGood
  if (score >= 50) return colors.scoreAvg
  return colors.scorePoor
}

// Used in shelf item display for product ratings
function _getScoreLabel(score: number | null): string {
  if (score === null) return '—'
  if (score >= 85) return 'Отлично'
  if (score >= 70) return 'Хорошо'
  if (score >= 50) return 'Средне'
  return 'Плохо'
}

interface UndoToast {
  itemId: string
  productName: string
  expiresAt: number
}

export default function ShelfPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [undoToast, setUndoToast] = useState<UndoToast | null>(null)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({})
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)
  
  const { items, isLoading, error, refresh, removeFromShelf, undoRemove } = useShelf()
  const { analysis, isLoading: isAnalyzing, error: analysisError, analyze } = useShelfAnalysis()

  // Countdown timer for undo toast
  useEffect(() => {
    if (undoToast) {
      // Update countdown every second
      const updateCountdown = () => {
        const remaining = Math.max(0, Math.ceil((undoToast.expiresAt - Date.now()) / 1000))
        setTimeRemaining(remaining)
        
        if (remaining <= 0) {
          setUndoToast(null)
        }
      }
      
      // Initial update
      updateCountdown()
      
      // Set interval for countdown
      countdownRef.current = setInterval(updateCountdown, 1000)
      
      return () => {
        if (countdownRef.current) {
          clearInterval(countdownRef.current)
        }
      }
    } else {
      setTimeRemaining(0)
    }
  }, [undoToast])

  // Filter items by search query
  const filteredItems = items.filter(item =>
    item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  )

  // Handle remove with undo toast
  const handleRemove = useCallback(async (item: ShelfItem) => {
    try {
      await removeFromShelf(item.id)
      analytics.shelfRemove(item.product.id)
      
      // Clear any existing timer
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }

      // Show undo toast
      setUndoToast({
        itemId: item.id,
        productName: item.product.name,
        expiresAt: Date.now() + UNDO_TIMEOUT_MS,
      })

      // Auto-hide after 30 seconds
      undoTimerRef.current = setTimeout(() => {
        setUndoToast(null)
      }, UNDO_TIMEOUT_MS)
    } catch (err) {
      console.error('Failed to remove item:', err)
    }
  }, [removeFromShelf])

  // Handle undo
  const handleUndo = useCallback(async () => {
    if (!undoToast) return

    try {
      await undoRemove(undoToast.itemId)
      analytics.shelfUndo(undoToast.itemId)
      setUndoToast(null)
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }
    } catch (err) {
      console.error('Failed to undo:', err)
      // Toast might have expired
      setUndoToast(null)
    }
  }, [undoToast, undoRemove])

  // Loading state with skeleton loaders
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Package size={28} style={{ color: colors.accentGreen }} />
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: 0,
            }}>
              Моя полка
            </h1>
          </div>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            Сохраненные продукты и история сканирований
          </p>
        </div>

        {/* Stats Skeleton */}
        <div style={{ marginBottom: '32px' }}>
          <StatsCardsSkeleton />
        </div>

        {/* List Skeleton */}
        <ShelfListSkeleton count={5} />
      </motion.div>
    )
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '16px',
        padding: '24px',
      }}>
        <AlertCircle size={48} style={{ color: colors.scorePoor }} />
        <h3 style={{ color: colors.textPrimary, margin: 0 }}>Ошибка загрузки</h3>
        <p style={{ color: colors.textSecondary, textAlign: 'center', margin: 0 }}>{error}</p>
        <button
          onClick={refresh}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            backgroundColor: colors.accentGreen,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <RefreshCw size={18} />
          Повторить
        </button>
      </div>
    )
  }

  // Calculate stats - I-8: Fixed to show meaningful stats
  // Note: Score should come from product analysis, not user rating
  const totalCount = items.length
  const activeCount = items.filter(i => i.status === 'ACTIVE').length
  const wishlistCount = items.filter(i => i.status === 'WISHLIST').length
  const finishedCount = items.filter(i => i.status === 'FINISHED' || i.status === 'ARCHIVED').length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Package size={28} style={{ color: colors.accentGreen }} />
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: 0,
          }}>
            Моя полка
          </h1>
        </div>
        <p style={{ color: colors.textSecondary, margin: 0 }}>
          Сохраненные продукты и история сканирований
        </p>
      </div>

      {/* Search & Filter */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '24px',
        flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
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
            placeholder="Поиск по названию или бренду..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '48px',
              paddingLeft: '48px',
              paddingRight: '16px',
              borderRadius: '12px',
              fontSize: '0.9375rem',
              backgroundColor: colors.bgSecondary,
              color: colors.textPrimary,
              border: '2px solid transparent',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          onClick={() => setShowFilters(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 20px',
            height: '48px',
            borderRadius: '12px',
            backgroundColor: Object.keys(filters).length > 0 ? colors.accentGreenLight : colors.bgSecondary,
            color: Object.keys(filters).length > 0 ? colors.accentGreen : colors.textPrimary,
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9375rem',
            fontWeight: 500,
          }}
        >
          <Filter size={18} />
          Фильтры
          {Object.keys(filters).length > 0 && (
            <span style={{
              width: '20px',
              height: '20px',
              borderRadius: '10px',
              backgroundColor: colors.accentGreen,
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {Object.keys(filters).length}
            </span>
          )}
        </button>
      </div>

      {/* Stats - I-8: Fixed to show product status instead of rating */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
        gap: '12px',
        marginBottom: '32px',
      }}>
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: colors.bgSecondary,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: colors.textPrimary }}>
            {totalCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.textTertiary }}>
            Всего
          </div>
        </div>
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: colors.accentGreenLight,
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: colors.accentGreen }}>
            {activeCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: colors.accentGreen }}>
            Активные
          </div>
        </div>
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: '#EFF6FF',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3B82F6' }}>
            {wishlistCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#3B82F6' }}>
            Хочу купить
          </div>
        </div>
        <div style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: '#F3F4F6',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#6B7280' }}>
            {finishedCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
            Завершено
          </div>
        </div>
      </div>

      {/* AI Analysis Card - PRD Gap */}
      <ShelfAnalysisCard
        analysis={analysis}
        isLoading={isAnalyzing}
        error={analysisError}
        onAnalyze={analyze}
        productCount={items.length}
      />

      {/* Products List */}
      {filteredItems.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: colors.bgSecondary,
          borderRadius: '16px',
        }}>
          <Package size={48} style={{ color: colors.textTertiary, marginBottom: '16px' }} />
          <h3 style={{ color: colors.textPrimary, marginBottom: '8px' }}>
            {searchQuery ? 'Ничего не найдено' : 'Полка пуста'}
          </h3>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            {searchQuery 
              ? 'Попробуйте изменить поисковый запрос'
              : 'Отсканируйте продукт, чтобы добавить его сюда'
            }
          </p>
          {!searchQuery && (
            <Link
              href="/app"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '16px',
                padding: '12px 24px',
                borderRadius: '12px',
                backgroundColor: colors.accentGreen,
                color: 'white',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Сканировать продукт
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredItems.map((item, index) => {
            // Edge Case: Product deleted from database
            const isUnavailable = item.isUnavailable === true
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '16px',
                  borderRadius: '16px',
                  backgroundColor: isUnavailable ? '#FEF2F2' : colors.bgSecondary,
                  border: isUnavailable ? '1px solid #FECACA' : 'none',
                  opacity: isUnavailable ? 0.8 : 1,
                }}
              >
                {/* Product content - Link disabled for unavailable products */}
                {isUnavailable ? (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flex: 1,
                    }}
                  >
                    {/* Unavailable Product Image */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      backgroundColor: '#FEE2E2',
                      flexShrink: 0,
                      position: 'relative',
                    }}>
                      <Ban size={24} style={{ color: '#DC2626' }} />
                    </div>
                    
                    {/* Unavailable Product Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 500,
                        color: colors.textTertiary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '4px',
                        textDecoration: 'line-through',
                      }}>
                        {item.product.name}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#DC2626',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}>
                        <AlertCircle size={14} />
                        Товар удалён из каталога
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    href={`/app/product/${item.product.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '16px',
                      flex: 1,
                      textDecoration: 'none',
                    }}
                  >
                    {/* Product Image */}
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      backgroundColor: colors.bgTertiary,
                      flexShrink: 0,
                      overflow: 'hidden',
                      position: 'relative',
                    }}>
                      {item.product.imageUrl ? (
                        <Image
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          fill
                          style={{ objectFit: 'cover' }}
                        />
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
                        marginBottom: '4px',
                      }}>
                        {item.product.name}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: colors.textTertiary,
                      }}>
                        {item.product.brand || 'Без бренда'} • {item.product.category}
                      </div>
                    </div>
                    
                    {/* Rating Badge */}
                    {item.rating && (
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'flex-end', 
                        gap: '4px' 
                      }}>
                        <div style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          color: 'white',
                          backgroundColor: getScoreColor(item.rating * 20),
                        }}>
                          {'★'.repeat(item.rating)}
                        </div>
                      </div>
                    )}
                    
                    <ChevronRight size={20} style={{ color: colors.textTertiary }} />
                  </Link>
                )}

                {/* Remove button */}
                <button
                  onClick={() => handleRemove(item)}
                  data-testid="delete-button"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: '#FEE2E2',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={18} style={{ color: '#DC2626' }} />
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Undo Toast with Countdown */}
      <AnimatePresence>
        {undoToast && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            style={{
              position: 'fixed',
              bottom: '100px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1F2937',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              zIndex: 1000,
              minWidth: '280px',
            }}
          >
            {/* Progress bar */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '14px 14px 0 0',
              overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: `${(timeRemaining / 30) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
                style={{
                  height: '100%',
                  backgroundColor: colors.accentGreen,
                }}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '0.875rem', flex: 1 }}>
                «{undoToast.productName.length > 20 
                  ? undoToast.productName.slice(0, 20) + '...' 
                  : undoToast.productName}» удалён
              </span>
              
              {/* Countdown badge */}
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: timeRemaining <= 5 ? '#FCA5A5' : 'rgba(255,255,255,0.8)',
              }}>
                {timeRemaining}с
              </span>
            </div>
            
            <button
              onClick={handleUndo}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '10px',
                backgroundColor: colors.accentGreen,
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                width: '100%',
              }}
            >
              <Undo2 size={16} />
              Отменить удаление
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Modal - I-3 */}
      <FiltersModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={(newFilters) => setFilters(newFilters)}
        initialFilters={filters}
        context="shelf"
      />
    </motion.div>
  )
}
