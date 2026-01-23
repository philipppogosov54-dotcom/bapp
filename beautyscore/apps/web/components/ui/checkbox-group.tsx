'use client';

import { motion } from 'framer-motion';

interface CheckboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  values: string[];
  onChange: (values: string[]) => void;
  name: string;
  variant?: 'default' | 'cards';
  columns?: 1 | 2 | 3;
  maxSelections?: number;
  className?: string;
}

export function CheckboxGroup({
  options,
  values,
  onChange,
  name,
  variant = 'default',
  columns = 1,
  maxSelections,
  className = '',
}: CheckboxGroupProps) {
  const handleChange = (optionValue: string, checked: boolean) => {
    if (checked) {
      if (maxSelections && values.length >= maxSelections) {
        return; // Don't add if max reached
      }
      onChange([...values, optionValue]);
    } else {
      onChange(values.filter((v) => v !== optionValue));
    }
  };

  const getGridStyle = (): React.CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: '12px',
  });

  if (variant === 'cards') {
    return (
      <div style={getGridStyle()} className={className}>
        {options.map((option) => {
          const isSelected = values.includes(option.value);
          const isDisabled = !isSelected && maxSelections !== undefined && values.length >= maxSelections;

          return (
            <motion.label
              key={option.value}
              whileHover={!isDisabled ? { scale: 1.02 } : {}}
              whileTap={!isDisabled ? { scale: 0.98 } : {}}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                padding: '16px',
                borderRadius: '14px',
                border: isSelected ? '2px solid #2D7A4F' : '2px solid #EDE9E4',
                backgroundColor: isDisabled 
                  ? '#F3F4F6' 
                  : isSelected 
                    ? '#E8F5EC' 
                    : '#F7F5F3',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                opacity: isDisabled ? 0.6 : 1,
                boxShadow: isSelected ? '0 4px 12px rgba(45, 122, 79, 0.15)' : 'none',
              }}
            >
              <input
                type="checkbox"
                name={name}
                value={option.value}
                checked={isSelected}
                onChange={(e) => handleChange(option.value, e.target.checked)}
                disabled={isDisabled}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
              />
              
              {option.icon && (
                <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{option.icon}</div>
              )}
              
              <span style={{
                fontWeight: 500,
                color: isSelected ? '#1B5E3A' : '#1A1714',
              }}>
                {option.label}
              </span>
              
              {option.description && (
                <span style={{ fontSize: '0.8125rem', color: '#6B6259', marginTop: '4px' }}>
                  {option.description}
                </span>
              )}
              
              {/* Checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#2D7A4F',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <svg width="12" height="12" fill="white" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}
            </motion.label>
          );
        })}
      </div>
    );
  }

  // Default variant
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} className={className}>
      {options.map((option) => {
        const isSelected = values.includes(option.value);
        const isDisabled = !isSelected && maxSelections !== undefined && values.length >= maxSelections;

        return (
          <label
            key={option.value}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px',
              borderRadius: '12px',
              border: isSelected ? '2px solid #2D7A4F' : '2px solid #EDE9E4',
              backgroundColor: isDisabled 
                ? '#F3F4F6' 
                : isSelected 
                  ? '#E8F5EC' 
                  : '#F7F5F3',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              opacity: isDisabled ? 0.6 : 1,
            }}
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={isSelected}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              disabled={isDisabled}
              style={{ 
                width: '16px', 
                height: '16px', 
                accentColor: '#2D7A4F',
                borderRadius: '4px',
              }}
            />
            <div style={{ marginLeft: '12px' }}>
              <span style={{ fontWeight: 500, color: '#1A1714' }}>{option.label}</span>
              {option.description && (
                <p style={{ fontSize: '0.8125rem', color: '#6B6259', marginTop: '2px' }}>
                  {option.description}
                </p>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
