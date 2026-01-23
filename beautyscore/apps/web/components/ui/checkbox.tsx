'use client'

import * as React from 'react'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  error?: string
  label?: React.ReactNode
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ error, label, id, style, ...props }, ref) => {
    const inputId = id || React.useId()
    const [isHovered, setIsHovered] = React.useState(false)
    
    return (
      <div style={{ width: '100%' }}>
        <label
          htmlFor={inputId}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            cursor: 'pointer',
            ...style,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div style={{
            position: 'relative',
            width: '20px',
            height: '20px',
            flexShrink: 0,
            marginTop: '2px',
          }}>
            <input
              id={inputId}
              type="checkbox"
              ref={ref}
              style={{
                position: 'absolute',
                width: '20px',
                height: '20px',
                margin: 0,
                cursor: 'pointer',
                opacity: 0,
              }}
              {...props}
            />
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '6px',
              border: error 
                ? '2px solid #DC2626' 
                : isHovered 
                  ? '2px solid #2D7A4F' 
                  : '2px solid #D4D0CB',
              backgroundColor: props.checked ? '#2D7A4F' : '#FDFCFB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              pointerEvents: 'none',
            }}>
              {props.checked && (
                <svg
                  width="12"
                  height="10"
                  viewBox="0 0 12 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 5L4.5 8.5L11 1.5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
          {label && (
            <span style={{
              fontSize: '0.875rem',
              color: '#4A4540',
              lineHeight: 1.5,
            }}>
              {label}
            </span>
          )}
        </label>
        {error && (
          <p style={{ color: '#DC2626', fontSize: '0.75rem', marginTop: '4px', marginLeft: '32px' }}>
            {error}
          </p>
        )}
      </div>
    )
  }
)
Checkbox.displayName = 'Checkbox'

export { Checkbox }
