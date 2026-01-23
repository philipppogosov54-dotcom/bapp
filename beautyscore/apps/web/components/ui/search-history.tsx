'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Trash2 } from 'lucide-react';
import { SearchHistoryItem } from '@/lib/api/hooks';

// Design system colors [[memory:13485295]]
const colors = {
  bgPrimary: '#FDFCFB',
  bgSecondary: '#F7F5F3',
  bgTertiary: '#EDE9E4',
  textPrimary: '#1A1714',
  textSecondary: '#6B6259',
  textTertiary: '#8C8177',
  accentGreen: '#2D7A4F',
  danger: '#DC2626',
};

interface SearchHistoryProps {
  history: SearchHistoryItem[];
  onSelect: (query: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

// I-1: Search History Component
export const SearchHistory: React.FC<SearchHistoryProps> = ({
  history,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (history.length === 0) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDeleting(id);
    onDelete(id);
    setTimeout(() => setIsDeleting(null), 300);
  };

  const handleClearAll = () => {
    onClearAll();
    setShowClearConfirm(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '12px',
      }}>
        <h3 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.textTertiary,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          <Clock size={14} />
          История поиска
        </h3>
        <button
          onClick={() => setShowClearConfirm(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: colors.textTertiary,
            fontSize: '0.75rem',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = colors.danger}
          onMouseLeave={(e) => e.currentTarget.style.color = colors.textTertiary}
        >
          Очистить
        </button>
      </div>

      <div style={{
        borderRadius: '14px',
        backgroundColor: colors.bgSecondary,
        overflow: 'hidden',
      }}>
        <AnimatePresence>
          {history.slice(0, 5).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={() => onSelect(item.query)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: index < history.slice(0, 5).length - 1 ? `1px solid ${colors.bgTertiary}` : 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  opacity: isDeleting === item.id ? 0.5 : 1,
                }}
              >
                <Clock size={16} style={{ color: colors.textTertiary, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.9375rem',
                    color: colors.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {item.query}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.textTertiary }}>
                    {formatDate(item.createdAt)}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(e, item.id)}
                  style={{
                    padding: '6px',
                    borderRadius: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: colors.textTertiary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = colors.danger;
                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = colors.textTertiary;
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <X size={16} />
                </button>
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Clear confirmation modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              padding: '24px',
            }}
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '320px',
                width: '100%',
                textAlign: 'center',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#FEE2E2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <Trash2 size={24} style={{ color: colors.danger }} />
              </div>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 600,
                color: colors.textPrimary,
                marginBottom: '8px',
              }}>
                Очистить историю?
              </h3>
              <p style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                marginBottom: '20px',
              }}>
                Вся история поиска будет удалена
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: colors.bgSecondary,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    color: colors.textPrimary,
                  }}
                >
                  Отмена
                </button>
                <button
                  onClick={handleClearAll}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: colors.danger,
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 500,
                    color: 'white',
                  }}
                >
                  Очистить
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchHistory;
