'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScoreBadgeProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  personalized?: boolean;
}

const getScoreStyle = (score: number | null) => {
  if (score === null) {
    return { bg: '#F7F5F3', color: '#8C8177', label: '—' };
  }
  if (score >= 85) {
    return { bg: '#E8F5EC', color: '#2D7A4F', label: 'Отлично' };
  }
  if (score >= 70) {
    return { bg: '#EDF7ED', color: '#5B9A6F', label: 'Хорошо' };
  }
  if (score >= 50) {
    return { bg: '#FEF3C7', color: '#C49234', label: 'Средне' };
  }
  return { bg: '#FEE2E2', color: '#C45252', label: 'Плохо' };
};

const sizeStyles = {
  sm: {
    padding: '4px 8px',
    fontSize: '0.75rem',
    borderRadius: '6px',
    gap: '4px',
  },
  md: {
    padding: '6px 12px',
    fontSize: '0.875rem',
    borderRadius: '8px',
    gap: '6px',
  },
  lg: {
    padding: '12px 20px',
    fontSize: '1.25rem',
    borderRadius: '12px',
    gap: '8px',
  },
};

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = false,
  personalized = false,
}) => {
  const { bg, color, label } = getScoreStyle(score);
  const sizeStyle = sizeStyles[size];

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeStyle.gap,
        backgroundColor: bg,
        color: color,
        padding: sizeStyle.padding,
        borderRadius: sizeStyle.borderRadius,
        fontWeight: 600,
        fontSize: sizeStyle.fontSize,
      }}
    >
      {personalized && (
        <span style={{ fontSize: '0.8em' }}>✨</span>
      )}
      <span>{score !== null ? score : '—'}</span>
      {showLabel && score !== null && (
        <span style={{ fontWeight: 500, opacity: 0.9 }}>{label}</span>
      )}
    </motion.div>
  );
};

// Large score display for product detail
export const ScoreDisplay: React.FC<{
  score: number | null;
  personalized?: boolean;
  loading?: boolean;
}> = ({ score, personalized = false, loading = false }) => {
  const { bg, color, label } = getScoreStyle(score);

  if (loading) {
    return (
      <div
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          backgroundColor: '#F7F5F3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            border: '3px solid #EDE9E4',
            borderTopColor: '#2D7A4F',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        backgroundColor: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
      }}
    >
      {personalized && (
        <span style={{ fontSize: '0.75rem', color: color }}>✨ Для вас</span>
      )}
      <span
        style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: color,
          lineHeight: 1,
        }}
      >
        {score !== null ? score : '—'}
      </span>
      {score !== null && (
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 500,
            color: color,
            opacity: 0.9,
          }}
        >
          {label}
        </span>
      )}
    </motion.div>
  );
};

export default ScoreBadge;
