'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Settings, Bell, Moon, Globe, Shield, Download, Trash2, ChevronRight, ToggleLeft, ToggleRight, Check, Loader2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useProfile } from '@/lib/api/hooks'
// Analytics is used in event handlers below
import { analytics } from '@/lib/analytics'

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
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
}

// Settings storage key
const SETTINGS_KEY = 'beautyscore_settings'

interface SettingsData {
  notifications: boolean
  darkMode: boolean
  analytics: boolean
}

const defaultSettings: SettingsData = {
  notifications: true,
  darkMode: false,
  analytics: true,
}

interface SettingToggleProps {
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}

function SettingToggle({ label, description, enabled, onToggle }: SettingToggleProps) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 500, color: colors.textPrimary, marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
          {description}
        </div>
      </div>
      {enabled ? (
        <ToggleRight size={32} style={{ color: colors.accentGreen, flexShrink: 0 }} />
      ) : (
        <ToggleLeft size={32} style={{ color: colors.textTertiary, flexShrink: 0 }} />
      )}
    </button>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { exportData, deleteAccount, isExporting, isDeleting } = useProfile()
  
  // Load settings from localStorage
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SETTINGS_KEY)
      if (saved) {
        try {
          setSettings(JSON.parse(saved))
        } catch {
          // Use defaults
        }
      }
    }
  }, [])

  // Save settings to localStorage
  const updateSetting = (key: keyof SettingsData, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
      
      // Show save feedback
      setSaveStatus('saving')
      setTimeout(() => setSaveStatus('saved'), 300)
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }

  // Handle delete account - PRD Gap: Account deletion UI
  const handleDeleteAccount = async () => {
    setDeleteError(null)
    analytics.accountDeleteRequest()
    try {
      await deleteAccount()
      // Logout and redirect after successful deletion
      await logout()
      router.push('/')
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Ошибка удаления аккаунта')
      setShowDeleteConfirm(false)
    }
  }

  // Handle export data - PRD Gap: Data export UI (152-ФЗ)
  const handleExportData = async () => {
    setExportError(null)
    analytics.dataExportRequest()
    try {
      await exportData()
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Ошибка экспорта данных')
    }
  }

  const { notifications, darkMode, analytics: analyticsEnabled } = settings

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Settings size={28} style={{ color: colors.accentGreen }} />
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: 0,
          }}>
            Настройки
          </h1>
        </div>
        <p style={{ color: colors.textSecondary, margin: 0 }}>
          Управление приложением и данными
        </p>
      </div>

      {/* Notifications Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.textTertiary,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Bell size={16} />
          Уведомления
        </h2>
        <div style={{
          borderRadius: '14px',
          backgroundColor: colors.bgSecondary,
          overflow: 'hidden',
        }}>
          <SettingToggle
            label="Push-уведомления"
            description="Получать уведомления о новых рекомендациях"
            enabled={notifications}
            onToggle={() => updateSetting('notifications', !notifications)}
          />
        </div>
      </div>

      {/* Appearance Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.textTertiary,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Moon size={16} />
          Внешний вид
        </h2>
        <div style={{
          borderRadius: '14px',
          backgroundColor: colors.bgSecondary,
          overflow: 'hidden',
        }}>
          <SettingToggle
            label="Тёмная тема"
            description="Переключить на тёмный режим (скоро)"
            enabled={darkMode}
            onToggle={() => updateSetting('darkMode', !darkMode)}
          />
          <div style={{ height: '1px', backgroundColor: colors.bgTertiary }} />
          <button
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: colors.textPrimary, marginBottom: '4px' }}>
                Язык
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                Русский
              </div>
            </div>
            <Globe size={20} style={{ color: colors.textTertiary }} />
            <ChevronRight size={18} style={{ color: colors.textTertiary }} />
          </button>
        </div>
      </div>

      {/* Privacy Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.textTertiary,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Shield size={16} />
          Конфиденциальность
        </h2>
        <div style={{
          borderRadius: '14px',
          backgroundColor: colors.bgSecondary,
          overflow: 'hidden',
        }}>
          <SettingToggle
            label="Аналитика использования"
            description="Помогает улучшить приложение"
            enabled={analyticsEnabled}
            onToggle={() => updateSetting('analytics', !analyticsEnabled)}
          />
        </div>
      </div>

      {/* Data Section - PRD Gap: Data Export UI */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.textTertiary,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Download size={16} />
          Данные
        </h2>
        <div style={{
          borderRadius: '14px',
          backgroundColor: colors.bgSecondary,
          overflow: 'hidden',
        }}>
          <button
            onClick={handleExportData}
            disabled={isExporting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: isExporting ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              opacity: isExporting ? 0.7 : 1,
            }}
          >
            {isExporting ? (
              <Loader2 size={20} style={{ color: colors.accentGreen, animation: 'spin 1s linear infinite' }} />
            ) : (
              <Download size={20} style={{ color: colors.accentGreen }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: colors.textPrimary, marginBottom: '4px' }}>
                {isExporting ? 'Экспорт...' : 'Экспорт данных'}
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                Скачать все ваши данные (152-ФЗ)
              </div>
            </div>
            <ChevronRight size={18} style={{ color: colors.textTertiary }} />
          </button>
        </div>
        {exportError && (
          <p style={{ color: colors.danger, fontSize: '0.875rem', marginTop: '8px' }}>
            {exportError}
          </p>
        )}
      </div>

      {/* Danger Zone - PRD Gap: Account Deletion UI */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.danger,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <Trash2 size={16} />
          Опасная зона
        </h2>
        <div style={{
          borderRadius: '14px',
          backgroundColor: colors.dangerLight,
          overflow: 'hidden',
        }}>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              textAlign: 'left',
              opacity: isDeleting ? 0.6 : 1,
            }}
          >
            {isDeleting ? (
              <Loader2 size={20} style={{ color: colors.danger, animation: 'spin 1s linear infinite' }} />
            ) : (
              <Trash2 size={20} style={{ color: colors.danger }} />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: colors.danger, marginBottom: '4px' }}>
                {isDeleting ? 'Удаление...' : 'Удалить аккаунт'}
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                Данные хранятся 30 дней для возможности восстановления
              </div>
            </div>
            <ChevronRight size={18} style={{ color: colors.danger }} />
          </button>
        </div>
        {deleteError && (
          <p style={{ color: colors.danger, fontSize: '0.875rem', marginTop: '8px' }}>
            {deleteError}
          </p>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '24px',
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: 'white',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: colors.dangerLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <AlertTriangle size={32} style={{ color: colors.danger }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: colors.textPrimary, marginBottom: '8px' }}>
                Удалить аккаунт?
              </h3>
              <p style={{ fontSize: '0.9375rem', color: colors.textSecondary, lineHeight: 1.5 }}>
                Ваш аккаунт будет деактивирован. Данные хранятся 30 дней — вы можете восстановить аккаунт, 
                обратившись в поддержку.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: colors.bgSecondary,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  color: colors.textPrimary,
                }}
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  backgroundColor: colors.danger,
                  border: 'none',
                  cursor: isDeleting ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    Удаление...
                  </>
                ) : (
                  'Удалить'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Account Info */}
      <div style={{
        padding: '16px',
        borderRadius: '14px',
        backgroundColor: colors.bgSecondary,
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '0.875rem', color: colors.textSecondary, margin: 0, marginBottom: '4px' }}>
          Аккаунт: {user?.email}
        </p>
        <p style={{ fontSize: '0.75rem', color: colors.textTertiary, margin: 0 }}>
          ID: {user?.id?.slice(0, 8)}...
        </p>
      </div>

      {/* Save Status Indicator */}
      {saveStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '12px 20px',
            borderRadius: '12px',
            backgroundColor: colors.accentGreen,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          {saveStatus === 'saving' ? (
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
          ) : (
            <Check size={18} />
          )}
          <span style={{ fontWeight: 500 }}>
            {saveStatus === 'saving' ? 'Сохранение...' : 'Сохранено'}
          </span>
        </motion.div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </motion.div>
  )
}
