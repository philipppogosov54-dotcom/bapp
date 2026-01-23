'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, WifiOff, ServerOff } from 'lucide-react';

type ErrorType = 'generic' | 'network' | 'server' | 'notFound';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

const errorConfig: Record<
  ErrorType,
  { icon: React.ReactNode; defaultTitle: string; defaultDescription: string }
> = {
  generic: {
    icon: <AlertCircle size={48} />,
    defaultTitle: 'Что-то пошло не так',
    defaultDescription: 'Произошла ошибка. Попробуйте ещё раз.',
  },
  network: {
    icon: <WifiOff size={48} />,
    defaultTitle: 'Нет подключения',
    defaultDescription: 'Проверьте интернет-соединение и попробуйте снова.',
  },
  server: {
    icon: <ServerOff size={48} />,
    defaultTitle: 'Сервер недоступен',
    defaultDescription: 'Мы уже работаем над решением проблемы.',
  },
  notFound: {
    icon: <AlertCircle size={48} />,
    defaultTitle: 'Не найдено',
    defaultDescription: 'Запрашиваемый ресурс не существует.',
  },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type = 'generic',
  title,
  description,
  onRetry,
  retryLabel = 'Попробовать снова',
}) => {
  const config = errorConfig[type];

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
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#C45252',
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

      {onRetry && (
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onRetry}
          style={{
            backgroundColor: '#F7F5F3',
            color: '#1A1714',
            padding: '12px 24px',
            borderRadius: '12px',
            border: 'none',
            fontSize: '0.875rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <RefreshCw size={16} />
          {retryLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default ErrorState;
