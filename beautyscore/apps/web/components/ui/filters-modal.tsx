'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RotateCcw } from 'lucide-react';

// Design system colors [[memory:13485295]]
const colors = {
  bgPrimary: '#FDFCFB',
  bgSecondary: '#F7F5F3',
  bgTertiary: '#EDE9E4',
  textPrimary: '#1A1714',
  textSecondary: '#6B6259',
  textTertiary: '#8C8177',
  accentGreen: '#2D7A4F',
  accentGreenLight: '#E8F5EC',
};

export interface FilterOptions {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  skinType?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest';
  status?: 'ACTIVE' | 'WISHLIST' | 'FINISHED' | 'all';
}

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  context: 'search' | 'shelf';
}

// Available filter options
const CATEGORIES = [
  { value: '', label: 'Все категории' },
  { value: 'FACE', label: 'Лицо' },
  { value: 'BODY', label: 'Тело' },
  { value: 'HAIR', label: 'Волосы' },
  { value: 'MAKEUP', label: 'Макияж' },
  { value: 'SUNCARE', label: 'Защита от солнца' },
];

const SKIN_TYPES = [
  { value: '', label: 'Любой тип кожи' },
  { value: 'DRY', label: 'Сухая' },
  { value: 'OILY', label: 'Жирная' },
  { value: 'COMBINATION', label: 'Комбинированная' },
  { value: 'NORMAL', label: 'Нормальная' },
  { value: 'SENSITIVE', label: 'Чувствительная' },
];

const SORT_OPTIONS = [
  { value: '', label: 'По умолчанию' },
  { value: 'price_asc', label: 'Сначала дешевые' },
  { value: 'price_desc', label: 'Сначала дорогие' },
  { value: 'rating', label: 'По рейтингу' },
  { value: 'newest', label: 'Сначала новые' },
];

const SHELF_STATUS = [
  { value: 'all', label: 'Все продукты' },
  { value: 'ACTIVE', label: 'Использую сейчас' },
  { value: 'WISHLIST', label: 'Хочу купить' },
  { value: 'FINISHED', label: 'Закончились' },
];

// I-3: Filters Modal Component
export const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialFilters = {},
  context,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  // Reset to initial when opened
  useEffect(() => {
    if (isOpen) {
      setFilters(initialFilters);
    }
  }, [isOpen, initialFilters]);

  const handleChange = useCallback(<K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K],
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleReset = useCallback(() => {
    setFilters({});
  }, []);

  const handleApply = useCallback(() => {
    onApply(filters);
    onClose();
  }, [filters, onApply, onClose]);

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== '' && v !== 'all');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1050,
            }}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.bgPrimary,
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              zIndex: 1051,
              maxHeight: '85vh',
              overflow: 'auto',
            }}
          >
            {/* Handle */}
            <div style={{
              width: '40px',
              height: '4px',
              borderRadius: '2px',
              backgroundColor: colors.bgTertiary,
              margin: '12px auto 8px',
            }} />

            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 20px 16px',
              borderBottom: `1px solid ${colors.bgTertiary}`,
            }}>
              <button
                onClick={handleReset}
                disabled={!hasFilters}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'none',
                  border: 'none',
                  cursor: hasFilters ? 'pointer' : 'default',
                  color: hasFilters ? colors.accentGreen : colors.textTertiary,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                <RotateCcw size={16} />
                Сбросить
              </button>
              <h2 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: colors.textPrimary,
                margin: 0,
              }}>
                Фильтры
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: colors.bgSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} style={{ color: colors.textSecondary }} />
              </button>
            </div>

            {/* Filter Content */}
            <div style={{ padding: '20px' }}>
              {/* Shelf Status - only for shelf context */}
              {context === 'shelf' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: colors.textTertiary,
                    display: 'block',
                    marginBottom: '12px',
                  }}>
                    Статус
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {SHELF_STATUS.map(opt => {
                      const isSelected = (filters.status || 'all') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleChange('status', opt.value as FilterOptions['status'])}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: isSelected ? colors.accentGreenLight : colors.bgSecondary,
                            color: isSelected ? colors.accentGreen : colors.textPrimary,
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {isSelected && <Check size={14} style={{ marginRight: '6px' }} />}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Category - only for search context */}
              {context === 'search' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: colors.textTertiary,
                    display: 'block',
                    marginBottom: '12px',
                  }}>
                    Категория
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {CATEGORIES.map(cat => {
                      const isSelected = (filters.category || '') === cat.value;
                      return (
                        <button
                          key={cat.value}
                          onClick={() => handleChange('category', cat.value || undefined)}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '10px',
                            border: 'none',
                            backgroundColor: isSelected ? colors.accentGreenLight : colors.bgSecondary,
                            color: isSelected ? colors.accentGreen : colors.textPrimary,
                            fontWeight: isSelected ? 600 : 500,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {isSelected && <Check size={14} style={{ marginRight: '6px' }} />}
                          {cat.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Skin Type */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: colors.textTertiary,
                  display: 'block',
                  marginBottom: '12px',
                }}>
                  Тип кожи
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SKIN_TYPES.map(type => {
                    const isSelected = (filters.skinType || '') === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => handleChange('skinType', type.value || undefined)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: isSelected ? colors.accentGreenLight : colors.bgSecondary,
                          color: isSelected ? colors.accentGreen : colors.textPrimary,
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isSelected && <Check size={14} style={{ marginRight: '6px' }} />}
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range - only for search context */}
              {context === 'search' && (
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: colors.textTertiary,
                    display: 'block',
                    marginBottom: '12px',
                  }}>
                    Цена
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="number"
                      placeholder="От"
                      value={filters.minPrice || ''}
                      onChange={(e) => handleChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: colors.bgSecondary,
                        fontSize: '1rem',
                        color: colors.textPrimary,
                        outline: 'none',
                      }}
                    />
                    <span style={{ color: colors.textTertiary }}>—</span>
                    <input
                      type="number"
                      placeholder="До"
                      value={filters.maxPrice || ''}
                      onChange={(e) => handleChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: colors.bgSecondary,
                        fontSize: '1rem',
                        color: colors.textPrimary,
                        outline: 'none',
                      }}
                    />
                    <span style={{ color: colors.textTertiary, fontSize: '0.875rem' }}>₽</span>
                  </div>
                </div>
              )}

              {/* Sort By */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: colors.textTertiary,
                  display: 'block',
                  marginBottom: '12px',
                }}>
                  Сортировка
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SORT_OPTIONS.map(opt => {
                    const isSelected = (filters.sortBy || '') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleChange('sortBy', opt.value as FilterOptions['sortBy'])}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '10px',
                          border: 'none',
                          backgroundColor: isSelected ? colors.accentGreenLight : colors.bgSecondary,
                          color: isSelected ? colors.accentGreen : colors.textPrimary,
                          fontWeight: isSelected ? 600 : 500,
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      >
                        {isSelected && <Check size={14} style={{ marginRight: '6px' }} />}
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div style={{
              padding: '16px 20px 32px',
              borderTop: `1px solid ${colors.bgTertiary}`,
            }}>
              <button
                onClick={handleApply}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: colors.accentGreen,
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Применить
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FiltersModal;
