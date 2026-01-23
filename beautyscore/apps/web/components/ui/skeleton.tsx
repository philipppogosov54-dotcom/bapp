'use client'

import { motion } from 'framer-motion'

// Design system colors
const colors = {
  bgSecondary: '#F7F5F3',
  bgTertiary: '#EDE9E4',
}

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  className?: string
}

/**
 * Skeleton loader component for content placeholders
 * Uses shimmer animation for better UX than spinners
 */
export function Skeleton({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '8px',
  className,
}: SkeletonProps) {
  return (
    <motion.div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: colors.bgTertiary,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <motion.div
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(90deg, transparent 0%, ${colors.bgSecondary} 50%, transparent 100%)`,
        }}
      />
    </motion.div>
  )
}

/**
 * Skeleton for product cards in lists
 */
export function ProductCardSkeleton() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      borderRadius: '16px',
      backgroundColor: colors.bgSecondary,
    }}>
      {/* Image placeholder */}
      <Skeleton width={64} height={64} borderRadius={12} />
      
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="70%" height={16} />
        <Skeleton width="50%" height={14} />
      </div>
      
      {/* Score placeholder */}
      <Skeleton width={48} height={32} borderRadius={8} />
    </div>
  )
}

/**
 * Skeleton for shelf items
 */
export function ShelfItemSkeleton() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '16px',
      borderRadius: '16px',
      backgroundColor: colors.bgSecondary,
    }}>
      {/* Image placeholder */}
      <Skeleton width={56} height={56} borderRadius={12} />
      
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Skeleton width="60%" height={16} />
        <Skeleton width="40%" height={14} />
      </div>
      
      {/* Action placeholder */}
      <Skeleton width={40} height={40} borderRadius={10} />
    </div>
  )
}

/**
 * Skeleton for product detail page
 */
export function ProductDetailSkeleton() {
  return (
    <div>
      {/* Back button */}
      <Skeleton width={80} height={20} borderRadius={6} />
      
      {/* Header */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '16px', marginBottom: '32px' }}>
        <Skeleton width={100} height={100} borderRadius={16} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width="80%" height={24} />
          <Skeleton width="50%" height={16} />
          <Skeleton width="30%" height={20} />
        </div>
      </div>
      
      {/* Score card */}
      <div style={{
        padding: '24px',
        borderRadius: '20px',
        backgroundColor: colors.bgSecondary,
        marginBottom: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Skeleton width={80} height={80} borderRadius="50%" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton width="60%" height={20} />
            <Skeleton width="80%" height={14} />
          </div>
        </div>
      </div>
      
      {/* Description */}
      <div style={{ marginBottom: '24px' }}>
        <Skeleton width={100} height={14} borderRadius={6} />
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width="100%" height={14} />
          <Skeleton width="90%" height={14} />
          <Skeleton width="70%" height={14} />
        </div>
      </div>
      
      {/* Buttons */}
      <Skeleton width="100%" height={52} borderRadius={14} />
    </div>
  )
}

/**
 * Skeleton for notification items
 */
export function NotificationSkeleton() {
  return (
    <div style={{
      display: 'flex',
      gap: '16px',
      padding: '16px',
      borderRadius: '16px',
      backgroundColor: colors.bgSecondary,
    }}>
      {/* Icon placeholder */}
      <Skeleton width={44} height={44} borderRadius={12} />
      
      {/* Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <Skeleton width="50%" height={16} />
        <Skeleton width="80%" height={14} />
        <Skeleton width="30%" height={12} />
      </div>
    </div>
  )
}

/**
 * Skeleton for search results list
 */
export function SearchResultsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for shelf list
 */
export function ShelfListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <ShelfItemSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for stats cards
 */
export function StatsCardsSkeleton() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
      gap: '12px',
    }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: colors.bgSecondary,
          textAlign: 'center',
        }}>
          <Skeleton width={40} height={28} borderRadius={6} />
          <div style={{ marginTop: '8px' }}>
            <Skeleton width="60%" height={12} borderRadius={4} />
          </div>
        </div>
      ))}
    </div>
  )
}
