'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Package,
  History,
  Bell,
  FileText,
  ShoppingBag,
  Heart,
} from 'lucide-react';

type EmptyStateType =
  | 'search'
  | 'shelf'
  | 'history'
  | 'notifications'
  | 'surveys'
  | 'products'
  | 'wishlist';

interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const emptyStateConfig: Record<
  EmptyStateType,
  { icon: React.ReactNode; defaultTitle: string; defaultDescription: string }
> = {
  search: {
    icon: <Search size={48} />,
    defaultTitle: 'Ничего не найдено',
    defaultDescription: 'Попробуйте изменить поисковый запрос',
  },
  shelf: {
    icon: <Package size={48} />,
    defaultTitle: 'Полка пуста',
    defaultDescription: 'Добавьте продукты, которыми пользуетесь',
  },
  history: {
    icon: <History size={48} />,
    defaultTitle: 'История пуста',
    defaultDescription: 'Ваши недавние поиски появятся здесь',
  },
  notifications: {
    icon: <Bell size={48} />,
    defaultTitle: 'Нет уведомлений',
    defaultDescription: 'Новые уведомления появятся здесь',
  },
  surveys: {
    icon: <FileText size={48} />,
    defaultTitle: 'Опросы не пройдены',
    defaultDescription: 'Пройдите опросы для персональных рекомендаций',
  },
  products: {
    icon: <ShoppingBag size={48} />,
    defaultTitle: 'Нет продуктов',
    defaultDescription: 'Продукты появятся здесь',
  },
  wishlist: {
    icon: <Heart size={48} />,
    defaultTitle: 'Список желаний пуст',
    defaultDescription: 'Добавляйте продукты, которые хотите попробовать',
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  action,
}) => {
  const config = emptyStateConfig[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          backgroundColor: '#F7F5F3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8C8177',
          marginBottom: '24px',
        }}
      >
        {config.icon}
      </div>

      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 600,
          color: '#1A1714',
          margin: '0 0 8px 0',
        }}
      >
        {title || config.defaultTitle}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: '#6B6259',
          margin: '0 0 24px 0',
          maxWidth: '280px',
        }}
      >
        {description || config.defaultDescription}
      </p>

      {action && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={action.onClick}
          style={{
            backgroundColor: '#2D7A4F',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
