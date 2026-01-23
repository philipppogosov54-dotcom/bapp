'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { TrendingUp, Sparkles, ChevronRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { useTrends } from '@/lib/api/hooks'
import { AIDisclaimer } from '@/components/ui/disclaimer'

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

type TabType = 'trending' | 'recommended'

export default function TrendsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('trending')
  const { trending, recommended, isLoading, error, refresh } = useTrends()

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
        <p style={{ color: colors.textSecondary }}>Загрузка трендов...</p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
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

  const products = activeTab === 'trending' ? trending : recommended

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <TrendingUp size={28} style={{ color: colors.accentGreen }} />
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: 0,
          }}>
            Тренды
          </h1>
        </div>
        <p style={{ color: colors.textSecondary, margin: 0 }}>
          Популярные продукты и персональные рекомендации
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        padding: '4px',
        backgroundColor: colors.bgSecondary,
        borderRadius: '14px',
      }}>
        <button
          onClick={() => setActiveTab('trending')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9375rem',
            backgroundColor: activeTab === 'trending' ? 'white' : 'transparent',
            color: activeTab === 'trending' ? colors.textPrimary : colors.textSecondary,
            boxShadow: activeTab === 'trending' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <TrendingUp size={18} />
          Популярное
        </button>
        <button
          onClick={() => setActiveTab('recommended')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.9375rem',
            backgroundColor: activeTab === 'recommended' ? 'white' : 'transparent',
            color: activeTab === 'recommended' ? colors.textPrimary : colors.textSecondary,
            boxShadow: activeTab === 'recommended' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Sparkles size={18} />
          Для вас
        </button>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: colors.bgSecondary,
          borderRadius: '16px',
        }}>
          <Sparkles size={48} style={{ color: colors.textTertiary, marginBottom: '16px' }} />
          <h3 style={{ color: colors.textPrimary, marginBottom: '8px' }}>
            {activeTab === 'trending' ? 'Нет трендовых продуктов' : 'Нет рекомендаций'}
          </h3>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            {activeTab === 'trending' 
              ? 'Скоро здесь появятся популярные продукты'
              : 'Пройдите опросы для персональных рекомендаций'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '16px',
        }}>
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={`/app/product/${product.id}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px',
                  borderRadius: '16px',
                  backgroundColor: colors.bgSecondary,
                  textDecoration: 'none',
                  height: '100%',
                }}
              >
                {/* Product Image */}
                <div style={{
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '12px',
                  backgroundColor: colors.bgTertiary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
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
                    <span style={{ fontSize: '2rem' }}>🧴</span>
                  )}
                  
                  {/* Score Badge */}
                  {product.score !== null && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: 'white',
                      backgroundColor: getScoreColor(product.score),
                    }}>
                      {product.score}
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: 500,
                    fontSize: '0.9375rem',
                    color: colors.textPrimary,
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {product.name}
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: colors.textTertiary,
                  }}>
                    {product.brand || 'Без бренда'}
                  </div>
                </div>

                {/* View Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  marginTop: '12px',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: colors.accentGreenLight,
                  color: colors.accentGreen,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}>
                  Подробнее
                  <ChevronRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* AI Disclaimer - 152-ФЗ Compliance */}
      <div style={{ marginTop: '32px' }}>
        <AIDisclaimer />
      </div>
    </motion.div>
  )
}
