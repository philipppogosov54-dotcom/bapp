'use client'

import React from 'react'

// Design system colors
const colors = {
  accentGreen: '#2D7A4F',
  bgTertiary: '#EDE9E4',
}

type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

interface SpinnerProps {
  size?: SpinnerSize
  color?: string
  trackColor?: string
  className?: string
}

const sizeMap: Record<SpinnerSize, { size: number; border: number }> = {
  sm: { size: 16, border: 2 },
  md: { size: 24, border: 3 },
  lg: { size: 32, border: 4 },
  xl: { size: 48, border: 4 },
}

/**
 * Unified Loading Spinner component
 * Sizes: sm (16px), md (24px), lg (32px), xl (48px)
 */
export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = colors.accentGreen,
  trackColor = colors.bgTertiary,
}) => {
  const { size: pixelSize, border } = sizeMap[size]

  return (
    <>
      <div
        role="status"
        aria-label="Загрузка"
        style={{
          width: `${pixelSize}px`,
          height: `${pixelSize}px`,
          border: `${border}px solid ${trackColor}`,
          borderTopColor: color,
          borderRadius: '50%',
          animation: 'spinner-rotate 0.8s linear infinite',
        }}
      />
      <style>{`
        @keyframes spinner-rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}

/**
 * Full-page loading state with spinner and optional text
 */
export const LoadingPage: React.FC<{ text?: string }> = ({ text = 'Загрузка...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '16px',
      }}
    >
      <Spinner size="lg" />
      {text && (
        <p style={{ color: '#6B6259', fontSize: '0.9375rem', margin: 0 }}>
          {text}
        </p>
      )}
    </div>
  )
}

/**
 * Inline loading state with spinner
 */
export const LoadingInline: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <Spinner size="sm" />
      {text && (
        <span style={{ color: '#6B6259', fontSize: '0.875rem' }}>
          {text}
        </span>
      )}
    </div>
  )
}

/**
 * Button loading state (replaces button content)
 */
export const ButtonSpinner: React.FC<{ color?: string }> = ({ color = 'white' }) => {
  return <Spinner size="sm" color={color} trackColor={`${color}40`} />
}

export default Spinner
