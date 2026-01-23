'use client';

import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface DisclaimerProps {
  type?: 'warning' | 'info';
  title?: string;
  children?: React.ReactNode;
}

/**
 * Disclaimer component for AI recommendations
 * Required by PRD on all screens with personalized recommendations
 */
export const Disclaimer: React.FC<DisclaimerProps> = ({
  type = 'warning',
  title,
  children,
}) => {
  const isWarning = type === 'warning';

  return (
    <div
      style={{
        backgroundColor: isWarning ? '#FEF3C7' : '#EBF5FF',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          color: isWarning ? '#C49234' : '#3B82F6',
          flexShrink: 0,
          marginTop: '2px',
        }}
      >
        {isWarning ? <AlertTriangle size={18} /> : <Info size={18} />}
      </div>
      <div>
        {title && (
          <p
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: isWarning ? '#92400E' : '#1E40AF',
              margin: '0 0 4px 0',
            }}
          >
            {title}
          </p>
        )}
        <p
          style={{
            fontSize: '0.75rem',
            color: isWarning ? '#92400E' : '#1E40AF',
            margin: 0,
            lineHeight: 1.5,
            opacity: 0.9,
          }}
        >
          {children}
        </p>
      </div>
    </div>
  );
};

/**
 * Standard AI disclaimer for product recommendations
 */
export const AIDisclaimer: React.FC = () => (
  <Disclaimer type="warning" title="Важно">
    BeautyScore не является медицинским приложением. Рекомендации носят
    информационный характер. При серьёзных проблемах с кожей или волосами
    обратитесь к специалисту.
  </Disclaimer>
);

/**
 * Personalization disclaimer
 */
export const PersonalizationDisclaimer: React.FC = () => (
  <Disclaimer type="info" title="Персональная оценка">
    Эта оценка рассчитана специально для вас на основе вашего профиля.
    Результат может отличаться от общей оценки продукта.
  </Disclaimer>
);

/**
 * Survey required disclaimer
 */
export const SurveyRequiredDisclaimer: React.FC<{ onAction?: () => void }> = ({
  onAction,
}) => (
  <div
    style={{
      backgroundColor: '#F7F5F3',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
    }}
  >
    <p
      style={{
        fontSize: '0.875rem',
        color: '#4A4540',
        margin: '0 0 12px 0',
      }}
    >
      Для персональных рекомендаций пройдите опросы
    </p>
    {onAction && (
      <button
        onClick={onAction}
        style={{
          backgroundColor: '#2D7A4F',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '10px',
          border: 'none',
          fontSize: '0.875rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Пройти опросы
      </button>
    )}
  </div>
);

export default Disclaimer;
