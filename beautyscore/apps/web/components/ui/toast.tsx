'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, action?: Toast['action']) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const toastIcons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={20} />,
  error: <AlertCircle size={20} />,
  info: <Info size={20} />,
  warning: <AlertTriangle size={20} />,
};

const toastColors: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: '#E8F5EC', border: '#2D7A4F', icon: '#2D7A4F' },
  error: { bg: '#FEE2E2', border: '#C45252', icon: '#C45252' },
  info: { bg: '#EBF5FF', border: '#3B82F6', icon: '#3B82F6' },
  warning: { bg: '#FEF3C7', border: '#C49234', icon: '#C49234' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', action?: Toast['action']) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, action }]);

    // Auto dismiss after 5 seconds (or 10 if has action)
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, action ? 10000 : 5000);
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: '100px', // Above bottom nav
          left: '16px',
          right: '16px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {toasts.map((toast) => {
            const colors = toastColors[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                style={{
                  backgroundColor: colors.bg,
                  borderLeft: `4px solid ${colors.border}`,
                  borderRadius: '12px',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  pointerEvents: 'auto',
                }}
              >
                <div style={{ color: colors.icon, flexShrink: 0 }}>
                  {toastIcons[toast.type]}
                </div>
                <p
                  style={{
                    flex: 1,
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#1A1714',
                    fontWeight: 500,
                  }}
                >
                  {toast.message}
                </p>
                {toast.action && (
                  <button
                    onClick={() => {
                      toast.action?.onClick();
                      hideToast(toast.id);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: colors.border,
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    {toast.action.label}
                  </button>
                )}
                <button
                  onClick={() => hideToast(toast.id)}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#8C8177',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
