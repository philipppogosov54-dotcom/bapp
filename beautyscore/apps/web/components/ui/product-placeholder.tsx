'use client'

import React from 'react'
import Image from 'next/image'

// Design system colors
const colors = {
  bgSecondary: '#F7F5F3',
  bgTertiary: '#EDE9E4',
  accentGreen: '#2D7A4F',
  textTertiary: '#8C8177',
}

type PlaceholderSize = 'sm' | 'md' | 'lg'

interface ProductPlaceholderProps {
  size?: PlaceholderSize
  category?: string
  className?: string
}

const sizeMap: Record<PlaceholderSize, number> = {
  sm: 48,
  md: 80,
  lg: 120,
}

// Get icon based on product category
function getCategoryIcon(category?: string): string {
  if (!category) return '🧴'
  
  const lowerCategory = category.toLowerCase()
  
  if (lowerCategory.includes('крем') || lowerCategory.includes('cream')) return '🧴'
  if (lowerCategory.includes('шампунь') || lowerCategory.includes('shampoo')) return '🧴'
  if (lowerCategory.includes('маска') || lowerCategory.includes('mask')) return '🎭'
  if (lowerCategory.includes('сыворотка') || lowerCategory.includes('serum')) return '💧'
  if (lowerCategory.includes('тоник') || lowerCategory.includes('toner')) return '💦'
  if (lowerCategory.includes('масло') || lowerCategory.includes('oil')) return '🫒'
  if (lowerCategory.includes('солнц') || lowerCategory.includes('sun')) return '☀️'
  if (lowerCategory.includes('губ') || lowerCategory.includes('lip')) return '💋'
  if (lowerCategory.includes('глаз') || lowerCategory.includes('eye')) return '👁️'
  if (lowerCategory.includes('волос') || lowerCategory.includes('hair')) return '💇'
  if (lowerCategory.includes('тело') || lowerCategory.includes('body')) return '🧴'
  if (lowerCategory.includes('рук') || lowerCategory.includes('hand')) return '🤲'
  if (lowerCategory.includes('ног') || lowerCategory.includes('foot')) return '🦶'
  if (lowerCategory.includes('очищ') || lowerCategory.includes('clean')) return '🧼'
  if (lowerCategory.includes('пилинг') || lowerCategory.includes('peel') || lowerCategory.includes('скраб') || lowerCategory.includes('scrub')) return '✨'
  
  return '🧴'
}

/**
 * Branded SVG placeholder for product images
 * Shows a BeautyScore-branded placeholder when product image is not available
 */
export const ProductPlaceholder: React.FC<ProductPlaceholderProps> = ({
  size = 'md',
  category,
}) => {
  const pixelSize = sizeMap[size]
  const iconSize = Math.round(pixelSize * 0.4)
  const icon = getCategoryIcon(category)

  return (
    <div
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        borderRadius: size === 'sm' ? '8px' : size === 'md' ? '12px' : '16px',
        backgroundColor: colors.bgSecondary,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: size === 'sm' ? '2px' : '4px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background pattern */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox={`0 0 ${pixelSize} ${pixelSize}`}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          opacity: 0.3,
        }}
      >
        <defs>
          <pattern
            id={`dots-${size}`}
            x="0"
            y="0"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1" fill={colors.bgTertiary} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#dots-${size})`} />
      </svg>

      {/* Product icon */}
      <span
        style={{
          fontSize: `${iconSize}px`,
          lineHeight: 1,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {icon}
      </span>

      {/* BeautyScore mini logo for larger sizes */}
      {size !== 'sm' && (
        <div
          style={{
            position: 'absolute',
            bottom: size === 'lg' ? '8px' : '4px',
            right: size === 'lg' ? '8px' : '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            backgroundColor: 'rgba(255,255,255,0.8)',
            padding: '2px 4px',
            borderRadius: '4px',
          }}
        >
          <span style={{ fontSize: size === 'lg' ? '8px' : '6px' }}>🔬</span>
          <span
            style={{
              fontSize: size === 'lg' ? '7px' : '5px',
              fontWeight: 600,
              color: colors.accentGreen,
              letterSpacing: '-0.02em',
            }}
          >
            BS
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Product image with fallback to placeholder
 * Uses Next/Image for optimization (lazy loading, quality, blur placeholder)
 */
export const ProductImage: React.FC<{
  src?: string | null
  alt: string
  size?: PlaceholderSize
  category?: string
  priority?: boolean
}> = ({ src, alt, size = 'md', category, priority = false }) => {
  const [hasError, setHasError] = React.useState(false)
  const pixelSize = sizeMap[size]
  const borderRadius = size === 'sm' ? '8px' : size === 'md' ? '12px' : '16px'

  if (!src || hasError) {
    return <ProductPlaceholder size={size} category={category} />
  }

  // Check if URL is from allowed remote patterns
  const isRemoteImage = src.startsWith('http')

  return (
    <div
      style={{
        width: `${pixelSize}px`,
        height: `${pixelSize}px`,
        borderRadius,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: colors.bgSecondary,
      }}
    >
      {isRemoteImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${pixelSize}px`}
          quality={75}
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          style={{
            objectFit: 'cover',
          }}
          onError={() => setHasError(true)}
        />
      ) : (
        // Fallback for non-remote images
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}

export default ProductPlaceholder
