'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Package, BookOpen, TrendingUp, User, Bell } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { useNotifications } from '@/lib/api/hooks';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  showBadge?: boolean;
}

// I-2: Navigation with notification badge support
export const BottomNavigation: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const navItems: NavItem[] = [
    { icon: <Search size={24} />, label: 'Поиск', path: '/app' },
    { icon: <Package size={24} />, label: 'Полка', path: '/app/shelf' },
    { icon: <BookOpen size={24} />, label: 'Энциклопедия', path: '/app/encyclopedia' },
    { icon: <TrendingUp size={24} />, label: 'Тренды', path: '/app/trends' },
    { icon: <User size={24} />, label: 'Профиль', path: '/app/profile', showBadge: true },
  ];

  const isActive = (path: string) => {
    if (path === '/app') {
      return pathname === '/app' || pathname === '/app/search';
    }
    return pathname.startsWith(path);
  };

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FDFCFB',
        borderTop: '1px solid #EDE9E4',
        padding: '8px 8px 24px 8px', // Safe area padding
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '500px',
          margin: '0 auto',
        }}
      >
        {navItems.map((item) => {
          const active = isActive(item.path);
          const showBadge = item.showBadge && unreadCount > 0;
          
          return (
            <motion.button
              key={item.path}
              onClick={() => {
                analytics.navClick(item.path);
                router.push(item.path);
              }}
              whileTap={{ scale: 0.9 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              <div
                style={{
                  color: active ? '#2D7A4F' : '#8C8177',
                  transition: 'color 0.2s ease',
                  position: 'relative',
                }}
              >
                {item.icon}
                {/* Notification Badge - I-2 */}
                {showBadge && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-6px',
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: '8px',
                      backgroundColor: '#DC2626',
                      color: 'white',
                      fontSize: '0.625rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </div>
                )}
              </div>
              <span
                style={{
                  fontSize: '0.625rem',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#2D7A4F' : '#8C8177',
                  transition: 'all 0.2s ease',
                }}
              >
                {item.label}
              </span>
              {active && (
                <motion.div
                  layoutId="activeIndicator"
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: '#2D7A4F',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
