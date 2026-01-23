'use client'

import { useState, use, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Check, Loader2, AlertCircle, MessageCircle, Sparkles, Globe } from 'lucide-react'
import { useProduct, useShelf } from '@/lib/api/hooks'
import { AIDisclaimer } from '@/components/ui/disclaimer'
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
  accentOrange: '#C4804D',
  accentOrangeLight: '#FEF3C7',
  accentBlue: '#3B82F6',
  accentBlueLight: '#EFF6FF',
  scoreExcellent: '#22C55E',
  scoreGood: '#84CC16',
  scoreAvg: '#EAB308',
  scorePoor: '#EF4444',
}

function getScoreColor(score: number | null): string {
  if (score === null) return colors.textTertiary
  if (score >= 85) return colors.scoreExcellent
  if (score >= 70) return colors.scoreGood
  if (score >= 50) return colors.scoreAvg
  return colors.scorePoor
}

function getScoreLabel(score: number | null): string {
  if (score === null) return 'Оценка недоступна'
  if (score >= 85) return 'Отличный выбор! 👍'
  if (score >= 70) return 'Хороший продукт 👌'
  if (score >= 50) return 'Средний продукт ⚠️'
  return 'Не рекомендуем ❌'
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { product, score, isLoading, isScoreLoading, error } = useProduct(id)
  const { items, addToShelf } = useShelf()
  
  const [isAdding, setIsAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)

  // Check if product is already on shelf
  const isOnShelf = items.some(item => item.productId === id)

  // Track product view
  useEffect(() => {
    if (product && !isLoading) {
      analytics.productView(id, 'direct')
    }
  }, [product, isLoading, id])

  // Track score view
  useEffect(() => {
    if (score && !isScoreLoading) {
      analytics.scoreViewed(id, score.score, score.personalized)
    }
  }, [score, isScoreLoading, id])

  const handleAddToShelf = async () => {
    if (isOnShelf || isAdding || !product) return
    
    setIsAdding(true)
    setAddError(null)
    
    try {
      // Pass product info for optimistic update
      await addToShelf(id, {
        id: id,
        name: product.name,
        brand: product.brand,
        imageUrl: product.imageUrl,
        category: product.category,
      })
      analytics.shelfAdd(id)
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Ошибка добавления')
    } finally {
      setIsAdding(false)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '16px',
      }}>
        <Loader2 size={40} style={{ color: colors.accentGreen, animation: 'spin 1s linear infinite' }} />
        <p style={{ color: colors.textSecondary }}>Загрузка продукта...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  // Error state
  if (error || !product) {
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
        <h3 style={{ color: colors.textPrimary, margin: 0 }}>Продукт не найден</h3>
        <p style={{ color: colors.textSecondary, textAlign: 'center', margin: 0 }}>
          {error || 'Этот продукт не существует или был удалён'}
        </p>
        <Link
          href="/app"
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            backgroundColor: colors.accentGreen,
            color: 'white',
            textDecoration: 'none',
            fontWeight: 500,
          }}
        >
          Вернуться к поиску
        </Link>
      </div>
    )
  }

  const displayScore = score?.score ?? null
  const isPerssonalized = score?.personalized ?? false

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back Button */}
      <Link 
        href="/app" 
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px', 
          fontWeight: 500,
          color: colors.accentGreen,
          textDecoration: 'none',
        }}
      >
        <ArrowLeft size={18} />
        Назад
      </Link>

      {/* Product Header */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
        <div style={{
          width: '100px',
          height: '100px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          flexShrink: 0,
          backgroundColor: colors.bgSecondary,
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
            '🧴'
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 600, 
            marginBottom: '4px',
            color: colors.textPrimary,
          }}>
            {product.name}
          </h1>
          <div style={{ fontSize: '0.875rem', marginBottom: '8px', color: colors.textTertiary }}>
            {product.brand || 'Без бренда'} • {product.category}
          </div>
          {product.priceRegular && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {product.priceDiscount && product.priceDiscount < product.priceRegular ? (
                <>
                  <span style={{ fontWeight: 600, color: colors.accentGreen }}>
                    {product.priceDiscount} ₽
                  </span>
                  <span style={{ 
                    textDecoration: 'line-through', 
                    color: colors.textTertiary,
                    fontSize: '0.875rem',
                  }}>
                    {product.priceRegular} ₽
                  </span>
                  {product.discountPercent && (
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '6px',
                      backgroundColor: colors.accentOrangeLight,
                      color: colors.accentOrange,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}>
                      -{product.discountPercent}%
                    </span>
                  )}
                </>
              ) : (
                <span style={{ fontWeight: 600, color: colors.textPrimary }}>
                  {product.priceRegular} ₽
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Score Card */}
      <div style={{
        borderRadius: '20px',
        padding: '24px',
        marginBottom: '24px',
        backgroundColor: colors.bgSecondary,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '16px' }}>
          {/* Score Circle */}
          <div style={{ textAlign: 'center' }}>
            {isScoreLoading ? (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.bgTertiary,
              }}>
                <Loader2 size={24} style={{ color: colors.textTertiary, animation: 'spin 1s linear infinite' }} />
              </div>
            ) : displayScore !== null ? (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `conic-gradient(${getScoreColor(displayScore)} ${displayScore}%, ${colors.bgTertiary} 0)`,
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: colors.bgSecondary,
                }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>{displayScore}</span>
                  <span style={{ fontSize: '0.75rem', color: colors.textTertiary }}>/100</span>
                </div>
              </div>
            ) : (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: colors.bgTertiary,
              }}>
                <span style={{ fontSize: '1.5rem', color: colors.textTertiary }}>—</span>
              </div>
            )}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, margin: 0 }}>
                {getScoreLabel(displayScore)}
              </h2>
              {/* Score Source Badge - C-8 */}
              {displayScore !== null && (
                isPerssonalized ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: colors.accentBlueLight,
                    color: colors.accentBlue,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}>
                    <Sparkles size={12} />
                    Персональная
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: colors.bgTertiary,
                    color: colors.textSecondary,
                    fontSize: '0.75rem',
                    fontWeight: 500,
                  }}>
                    <Globe size={12} />
                    Общая
                  </span>
                )
              )}
            </div>
            {!isPerssonalized && displayScore !== null && (
              <p style={{ color: colors.textSecondary, margin: 0, fontSize: '0.875rem' }}>
                Пройдите опросы для персональной оценки
              </p>
            )}
          </div>
        </div>

        {/* Pros/Cons from LLM */}
        {score?.pros && score.pros.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.accentGreen, marginBottom: '8px' }}>
              ✅ Плюсы:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: colors.textSecondary, fontSize: '0.875rem' }}>
              {score.pros.map((pro, i) => (
                <li key={i}>{pro}</li>
              ))}
            </ul>
          </div>
        )}
        
        {score?.cons && score.cons.length > 0 && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: colors.scorePoor, marginBottom: '8px' }}>
              ⚠️ Минусы:
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: colors.textSecondary, fontSize: '0.875rem' }}>
              {score.cons.map((con, i) => (
                <li key={i}>{con}</li>
              ))}
            </ul>
          </div>
        )}

        {score?.recommendation && (
          <div style={{
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: colors.accentBlueLight,
            border: `1px solid ${colors.accentBlue}40`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span>💡</span>
              <span style={{ fontWeight: 500, color: colors.accentBlue, fontSize: '0.875rem' }}>
                Рекомендация
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: 0 }}>
              {score.recommendation}
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      {product.description && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.textTertiary,
            marginBottom: '12px',
          }}>
            📝 Описание
          </h3>
          <p style={{ 
            color: colors.textSecondary, 
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            margin: 0,
          }}>
            {product.description}
          </p>
        </div>
      )}

      {/* How to Use */}
      {product.howToUse && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.textTertiary,
            marginBottom: '12px',
          }}>
            💆 Как использовать
          </h3>
          <p style={{ 
            color: colors.textSecondary, 
            fontSize: '0.9375rem',
            lineHeight: 1.6,
            margin: 0,
          }}>
            {product.howToUse}
          </p>
        </div>
      )}

      {/* Ingredients */}
      {product.ingredients && product.ingredients.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.textTertiary,
            marginBottom: '12px',
          }}>
            🧪 Состав ({product.ingredients.length} ингредиентов)
          </h3>
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: colors.bgSecondary,
            fontSize: '0.8125rem',
            color: colors.textSecondary,
            lineHeight: 1.6,
            maxHeight: '200px',
            overflow: 'auto',
          }}>
            {product.ingredients.join(', ')}
          </div>
        </div>
      )}

      {/* Ask AI Button */}
      <Link
        href={`/app/product/${id}/chat`}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '14px',
          borderRadius: '14px',
          border: `2px solid ${colors.accentBlue}`,
          backgroundColor: 'transparent',
          color: colors.accentBlue,
          fontSize: '0.9375rem',
          fontWeight: 600,
          textDecoration: 'none',
          marginBottom: '12px',
        }}
      >
        <MessageCircle size={20} />
        Спросить AI об этом продукте
      </Link>

      {/* Add to Shelf Button */}
      <button
        onClick={handleAddToShelf}
        disabled={isOnShelf || isAdding}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '16px',
          borderRadius: '14px',
          border: 'none',
          backgroundColor: isOnShelf ? colors.bgTertiary : colors.accentGreen,
          color: isOnShelf ? colors.textTertiary : 'white',
          fontSize: '1rem',
          fontWeight: 600,
          cursor: isOnShelf || isAdding ? 'default' : 'pointer',
          opacity: isAdding ? 0.7 : 1,
        }}
      >
        {isAdding ? (
          <>
            <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
            Добавление...
          </>
        ) : isOnShelf ? (
          <>
            <Check size={20} />
            Уже на полке
          </>
        ) : (
          <>
            <Plus size={20} />
            Добавить в мою полку
          </>
        )}
      </button>

      {addError && (
        <p style={{ 
          color: colors.scorePoor, 
          fontSize: '0.875rem', 
          textAlign: 'center',
          marginTop: '8px',
        }}>
          {addError}
        </p>
      )}

      {/* AI Disclaimer - 152-ФЗ Compliance */}
      <div style={{ marginTop: '24px' }}>
        <AIDisclaimer />
      </div>
    </motion.div>
  )
}
