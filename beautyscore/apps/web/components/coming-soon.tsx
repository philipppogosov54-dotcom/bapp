'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ComingSoonProps {
  title: string
  description: string
  icon?: string
  showBackButton?: boolean
}

export function ComingSoon({ 
  title, 
  description, 
  icon = '🚧',
  showBackButton = true 
}: ComingSoonProps) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FDFCFB',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '600px',
      }}>
        {/* Icon */}
        <div style={{
          fontSize: 'clamp(4rem, 10vw, 6rem)',
          marginBottom: '24px',
        }}>
          {icon}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
          fontWeight: 700,
          color: '#1A1714',
          marginBottom: '16px',
          letterSpacing: '-0.02em',
        }}>
          {title}
        </h1>

        {/* Description */}
        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.125rem)',
          color: '#6B6259',
          lineHeight: 1.7,
          marginBottom: '32px',
        }}>
          {description}
        </p>

        {/* Back Button */}
        {showBackButton && (
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 28px',
            backgroundColor: '#2D7A4F',
            color: 'white',
            borderRadius: '12px',
            fontSize: '1rem',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}>
            <ArrowLeft size={20} />
            На главную
          </Link>
        )}
      </div>
    </div>
  )
}
