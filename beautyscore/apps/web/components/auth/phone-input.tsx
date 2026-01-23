'use client';

import { useState, useEffect } from 'react';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function PhoneInput({ value, onChange, error, disabled, className = '' }: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Format phone number for display
  useEffect(() => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '+7 ';
    
    if (cleaned.length > 1) {
      const digits = cleaned.startsWith('7') || cleaned.startsWith('8') 
        ? cleaned.slice(1) 
        : cleaned;
      
      if (digits.length > 0) formatted += `(${digits.slice(0, 3)}`;
      if (digits.length >= 3) formatted += `) ${digits.slice(3, 6)}`;
      if (digits.length >= 6) formatted += `-${digits.slice(6, 8)}`;
      if (digits.length >= 8) formatted += `-${digits.slice(8, 10)}`;
    }
    
    setDisplayValue(formatted);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Extract only digits
    const digits = input.replace(/\D/g, '');
    
    // Limit to 11 digits (Russian phone)
    const limited = digits.slice(0, 11);
    
    // Ensure starts with 7
    const normalized = limited.startsWith('8') 
      ? '7' + limited.slice(1) 
      : limited.startsWith('7') 
        ? limited 
        : '7' + limited;
    
    onChange(normalized);
  };

  return (
    <div className={className}>
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          inset: '0',
          left: '0',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '16px',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <div style={{
            width: '24px',
            height: '16px',
            borderRadius: '2px',
            overflow: 'hidden',
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ flex: 1, backgroundColor: 'white' }}></div>
            <div style={{ flex: 1, backgroundColor: '#0039A6' }}></div>
            <div style={{ flex: 1, backgroundColor: '#D52B1E' }}></div>
          </div>
        </div>
        <input
          type="tel"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="+7 (999) 123-45-67"
          disabled={disabled}
          autoComplete="tel"
          style={{
            width: '100%',
            height: '52px',
            paddingLeft: '48px',
            paddingRight: '16px',
            backgroundColor: isFocused ? '#FDFCFB' : '#F7F5F3',
            border: error 
              ? '2px solid #DC2626' 
              : isFocused 
                ? '2px solid #2D7A4F' 
                : '2px solid transparent',
            borderRadius: '14px',
            fontSize: '1rem',
            color: '#1A1714',
            outline: 'none',
            transition: 'border-color 0.15s, background-color 0.15s',
            opacity: disabled ? 0.5 : 1,
            cursor: disabled ? 'not-allowed' : 'text',
          }}
        />
      </div>
      {error && <p style={{ marginTop: '4px', fontSize: '0.875rem', color: '#DC2626' }}>{error}</p>}
    </div>
  );
}
