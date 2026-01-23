'use client';

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';

interface CodeInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function CodeInput({
  length = 6,
  value,
  onChange,
  error,
  disabled,
  className = '',
}: CodeInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Focus first input on mount
  useEffect(() => {
    if (!disabled) {
      inputRefs.current[0]?.focus();
    }
  }, [disabled]);

  // Split value into array
  const digits = value.split('').slice(0, length);
  while (digits.length < length) digits.push('');

  const handleChange = (index: number, inputValue: string) => {
    // Only accept digits
    const digit = inputValue.replace(/\D/g, '').slice(-1);
    
    const newDigits = [...digits];
    newDigits[index] = digit;
    onChange(newDigits.join(''));

    // Move to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      
      const newDigits = [...digits];
      
      if (digits[index]) {
        // Clear current digit
        newDigits[index] = '';
        onChange(newDigits.join(''));
      } else if (index > 0) {
        // Move to previous and clear
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputRefs.current[index - 1]?.focus();
        setFocusedIndex(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);
    
    // Focus appropriate input
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
    setFocusedIndex(focusIndex);
  };

  const getInputStyle = (index: number): React.CSSProperties => {
    const isFocused = focusedIndex === index;
    
    return {
      width: '48px',
      height: '56px',
      textAlign: 'center',
      fontSize: '1.5rem',
      fontWeight: 700,
      borderRadius: '12px',
      border: error 
        ? '2px solid #DC2626' 
        : isFocused 
          ? '2px solid #2D7A4F' 
          : '2px solid #EDE9E4',
      backgroundColor: disabled ? '#F3F4F6' : '#F7F5F3',
      color: '#1A1714',
      outline: 'none',
      transition: 'border-color 0.15s, background-color 0.15s',
      boxShadow: isFocused && !error ? '0 0 0 4px rgba(45, 122, 79, 0.15)' : 'none',
      cursor: disabled ? 'not-allowed' : 'text',
      opacity: disabled ? 0.5 : 1,
    };
  };

  return (
    <div className={className}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => setFocusedIndex(index)}
            disabled={disabled}
            maxLength={1}
            style={getInputStyle(index)}
          />
        ))}
      </div>
      {error && <p style={{ marginTop: '8px', fontSize: '0.875rem', color: '#DC2626', textAlign: 'center' }}>{error}</p>}
    </div>
  );
}
