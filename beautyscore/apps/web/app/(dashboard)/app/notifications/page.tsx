'use client'

import { motion } from 'framer-motion'
import { Bell, Package, Sparkles, AlertTriangle, CheckCircle, Info, RefreshCw, AlertCircle } from 'lucide-react'
import { useNotifications, NotificationItem } from '@/lib/api/hooks'
import { NotificationSkeleton } from '@/components/ui'

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
  accentOrange: '#C4804D',
  accentOrangeLight: '#FEF3C7',
  accentBlue: '#3B82F6',
  accentBlueLight: '#EFF6FF',
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Только что'
  if (diffMins < 60) return `${diffMins} мин. назад`
  if (diffHours < 24) return `${diffHours} ч. назад`
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'recommendation':
      return <Sparkles size={20} style={{ color: colors.accentBlue }} />
    case 'product':
      return <Package size={20} style={{ color: colors.accentGreen }} />
    case 'alert':
      return <AlertTriangle size={20} style={{ color: colors.accentOrange }} />
    case 'success':
      return <CheckCircle size={20} style={{ color: colors.accentGreen }} />
    default:
      return <Info size={20} style={{ color: colors.textSecondary }} />
  }
}

function getNotificationBg(type: string) {
  switch (type) {
    case 'recommendation':
      return colors.accentBlueLight
    case 'product':
      return colors.accentGreenLight
    case 'alert':
      return colors.accentOrangeLight
    case 'success':
      return colors.accentGreenLight
    default:
      return colors.bgSecondary
  }
}

export default function NotificationsPage() {
  const { notifications, unreadCount, isLoading, error, refresh, markAsRead, markAllAsRead } = useNotifications()

  // Loading state with skeleton loaders
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <Bell size={28} style={{ color: colors.accentGreen }} />
            <h1 style={{
              fontSize: '1.75rem',
              fontWeight: 600,
              color: colors.textPrimary,
              margin: 0,
            }}>
              Уведомления
            </h1>
          </div>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            Важные обновления и рекомендации
          </p>
        </div>

        {/* Notification Skeletons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <NotificationSkeleton key={i} />
          ))}
        </div>
      </motion.div>
    )
  }

  // Error state
  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        gap: '16px',
        padding: '24px',
      }}>
        <AlertCircle size={48} style={{ color: '#DC2626' }} />
        <h3 style={{ color: colors.textPrimary, margin: 0 }}>Ошибка загрузки</h3>
        <p style={{ color: colors.textSecondary, textAlign: 'center', margin: 0 }}>{error}</p>
        <button
          onClick={() => refresh()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            borderRadius: '12px',
            backgroundColor: colors.accentGreen,
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
          }}
        >
          <RefreshCw size={18} />
          Повторить
        </button>
      </div>
    )
  }

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Bell size={28} style={{ color: colors.accentGreen }} />
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: 0,
          }}>
            Уведомления
          </h1>
          {unreadCount > 0 && (
            <span style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              backgroundColor: colors.accentGreen,
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              {unreadCount} новых
            </span>
          )}
        </div>
        <p style={{ color: colors.textSecondary, margin: 0 }}>
          Важные обновления и рекомендации
        </p>
      </div>

      {/* Mark all as read */}
      {unreadCount > 0 && (
        <button
          onClick={markAllAsRead}
          style={{
            display: 'block',
            marginLeft: 'auto',
            marginBottom: '16px',
            padding: '8px 16px',
            borderRadius: '10px',
            backgroundColor: 'transparent',
            color: colors.accentGreen,
            border: 'none',
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.875rem',
          }}
        >
          Отметить все как прочитанные
        </button>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px 24px',
          backgroundColor: colors.bgSecondary,
          borderRadius: '16px',
        }}>
          <Bell size={48} style={{ color: colors.textTertiary, marginBottom: '16px' }} />
          <h3 style={{ color: colors.textPrimary, marginBottom: '8px' }}>
            Нет уведомлений
          </h3>
          <p style={{ color: colors.textSecondary, margin: 0 }}>
            Здесь будут появляться важные обновления
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((notification, index) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleNotificationClick(notification)}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                borderRadius: '16px',
                backgroundColor: notification.read ? colors.bgSecondary : 'white',
                border: notification.read ? 'none' : `2px solid ${colors.accentGreen}20`,
                cursor: 'pointer',
              }}
            >
              {/* Icon */}
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: getNotificationBg(notification.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}>
                  <span style={{
                    fontWeight: 600,
                    color: colors.textPrimary,
                  }}>
                    {notification.title}
                  </span>
                  {!notification.read && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: colors.accentGreen,
                    }} />
                  )}
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  color: colors.textSecondary,
                  margin: 0,
                  marginBottom: '8px',
                }}>
                  {notification.body}
                </p>
                <span style={{
                  fontSize: '0.75rem',
                  color: colors.textTertiary,
                }}>
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
