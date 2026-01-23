'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', asChild = false, loading, children, disabled, style, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      borderRadius: '14px',
      fontWeight: 600,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.15s',
      border: 'none',
      opacity: disabled || loading ? 0.7 : 1,
    }
    
    const variantStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: '#2D7A4F',
        color: 'white',
      },
      secondary: {
        backgroundColor: '#F7F5F3',
        color: '#1A1714',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#2D7A4F',
        border: '2px solid #2D7A4F',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#6B6259',
      },
    }
    
    const sizeStyles: Record<string, React.CSSProperties> = {
      default: {
        height: '44px',
        padding: '0 24px',
        fontSize: '0.875rem',
      },
      sm: {
        height: '36px',
        padding: '0 16px',
        fontSize: '0.75rem',
      },
      lg: {
        height: '52px',
        padding: '0 32px',
        fontSize: '1rem',
      },
    }
    
    const combinedStyle = {
      ...baseStyle,
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    }
    
    return (
      <Comp
        style={combinedStyle}
        className={cn(
          'hover:opacity-90 active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D7A4F]/50',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button }
