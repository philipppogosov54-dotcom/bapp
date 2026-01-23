'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BadgeProps {
  count: number;
  max?: number;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({
  count,
  max = 99,
  size = 'md',
  style,
}) => {
  if (count <= 0) return null;

  const displayCount = count > max ? `${max}+` : count.toString();

  const sizeStyles = {
    sm: {
      minWidth: '16px',
      height: '16px',
      fontSize: '0.625rem',
      padding: '0 4px',
    },
    md: {
      minWidth: '20px',
      height: '20px',
      fontSize: '0.75rem',
      padding: '0 6px',
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        style={{
          backgroundColor: '#C45252',
          color: 'white',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          ...sizeStyles[size],
          ...style,
        }}
      >
        {displayCount}
      </motion.div>
    </AnimatePresence>
  );
};

// Status badge (for product status, etc.)
interface StatusBadgeProps {
  status: 'active' | 'finished' | 'wishlist' | 'archived';
  size?: 'sm' | 'md';
}

const statusConfig = {
  active: { bg: '#E8F5EC', color: '#2D7A4F', label: 'Использую' },
  finished: { bg: '#F7F5F3', color: '#6B6259', label: 'Закончился' },
  wishlist: { bg: '#FEF3C7', color: '#C49234', label: 'Хочу' },
  archived: { bg: '#FEE2E2', color: '#C45252', label: 'Удалён' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];

  const sizeStyles = {
    sm: { padding: '2px 8px', fontSize: '0.625rem' },
    md: { padding: '4px 10px', fontSize: '0.75rem' },
  };

  return (
    <span
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderRadius: '6px',
        fontWeight: 500,
        ...sizeStyles[size],
      }}
    >
      {config.label}
    </span>
  );
};

// Tag badge (for categories, ingredients, etc.)
interface TagBadgeProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  onRemove?: () => void;
}

const tagVariants = {
  default: { bg: '#F7F5F3', color: '#4A4540' },
  success: { bg: '#E8F5EC', color: '#2D7A4F' },
  warning: { bg: '#FEF3C7', color: '#C49234' },
  danger: { bg: '#FEE2E2', color: '#C45252' },
};

export const TagBadge: React.FC<TagBadgeProps> = ({
  label,
  variant = 'default',
  onRemove,
}) => {
  const colors = tagVariants[variant];

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: colors.bg,
        color: colors.color,
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: 500,
      }}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: colors.color,
            cursor: 'pointer',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7,
          }}
        >
          ×
        </button>
      )}
    </span>
  );
};

export default Badge;
