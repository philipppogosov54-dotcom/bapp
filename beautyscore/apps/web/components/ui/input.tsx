'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, id, ...props }, ref) => {
    const inputId = id || React.useId()
    
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1A1714',
              marginBottom: '8px',
            }}
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          style={{
            width: '100%',
            height: '52px',
            padding: '0 16px',
            backgroundColor: '#F7F5F3',
            border: error ? '2px solid #DC2626' : '2px solid transparent',
            borderRadius: '14px',
            fontSize: '1rem',
            color: '#1A1714',
            outline: 'none',
            transition: 'border-color 0.15s, background-color 0.15s',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? '#DC2626' : '#2D7A4F';
            e.target.style.backgroundColor = '#FDFCFB';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? '#DC2626' : 'transparent';
            e.target.style.backgroundColor = '#F7F5F3';
          }}
          className={cn(
            'placeholder:text-[#8C8177]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '4px' }}>
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
