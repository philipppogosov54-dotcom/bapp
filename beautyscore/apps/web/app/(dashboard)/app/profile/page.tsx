'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { User, Mail, Calendar, Droplet, Wind, AlertCircle, Edit2, LogOut, ChevronRight, Settings, Bell, Shield, HelpCircle, ClipboardList, CheckCircle2, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { api } from '@/lib/api'

interface SurveyStatus {
  completedCount: number
  totalCount: number
  hasBasic: boolean
  hasDermatology: boolean
  hasTrichology: boolean
}

// Polling interval for survey status (30 seconds)
const SURVEY_POLL_INTERVAL = 30000

// Design system colors
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

// Helper functions
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Не указана'
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
}

function translateSkinType(type: string | null | undefined): string {
  const types: Record<string, string> = {
    DRY: 'Сухая',
    OILY: 'Жирная',
    COMBINATION: 'Комбинированная',
    NORMAL: 'Нормальная',
    SENSITIVE: 'Чувствительная',
  }
  return type ? (types[type] || type) : 'Не указан'
}

function translateHairType(type: string | null | undefined): string {
  const types: Record<string, string> = {
    STRAIGHT: 'Прямые',
    WAVY: 'Волнистые',
    CURLY: 'Кудрявые',
    COILY: 'Очень кудрявые',
  }
  return type ? (types[type] || type) : 'Не указан'
}

function translateGender(gender: string | null | undefined): string {
  const genders: Record<string, string> = {
    MALE: 'Мужской',
    FEMALE: 'Женский',
    OTHER: 'Другой',
  }
  return gender ? (genders[gender] || gender) : 'Не указан'
}

const menuItems = [
  { id: 'settings', icon: Settings, label: 'Настройки', href: '/app/settings' },
  { id: 'notifications', icon: Bell, label: 'Уведомления', href: '/app/notifications' },
  { id: 'privacy', icon: Shield, label: 'Конфиденциальность', href: '/privacy' },
  { id: 'help', icon: HelpCircle, label: 'Помощь', href: '/contact' },
]

export default function ProfilePage() {
  const { user, logout, isLoading } = useAuth()
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [surveyStatus, setSurveyStatus] = useState<SurveyStatus | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch survey status with optional loading indicator
  const fetchSurveyStatus = useCallback(async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true)
    try {
      const response = await api.get<{ meta: SurveyStatus }>('/surveys')
      setSurveyStatus(response.meta)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to fetch survey status:', err)
    } finally {
      if (showLoading) setIsRefreshing(false)
    }
  }, [])

  // Initial fetch and polling setup
  useEffect(() => {
    if (user) {
      // Initial fetch
      fetchSurveyStatus()
      
      // Set up polling for real-time updates
      pollIntervalRef.current = setInterval(() => {
        fetchSurveyStatus()
      }, SURVEY_POLL_INTERVAL)
      
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
        }
      }
    }
  }, [user, fetchSurveyStatus])

  // Manual refresh handler
  const handleRefresh = () => {
    fetchSurveyStatus(true)
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    await logout()
  }
  
  // Calculate if all surveys completed (need BASIC + DERMATOLOGY + TRICHOLOGY)
  const allSurveysCompleted = surveyStatus?.hasBasic && 
                              surveyStatus?.hasDermatology && 
                              surveyStatus?.hasTrichology

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #EDE9E4',
          borderTopColor: '#2D7A4F',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Profile Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '32px',
        padding: '24px',
        borderRadius: '20px',
        backgroundColor: colors.bgSecondary,
      }}>
        {/* Avatar */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2rem',
          fontWeight: 600,
          backgroundColor: colors.accentGreen,
          color: 'white',
          flexShrink: 0,
        }}>
          {user?.name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: colors.textPrimary,
            margin: 0,
            marginBottom: '4px',
          }}>
            {user?.name || 'Пользователь'}
          </h1>
          <p style={{
            fontSize: '0.9375rem',
            color: colors.textSecondary,
            margin: 0,
          }}>
            {user?.email}
          </p>
        </div>

        {/* Edit button */}
        <Link
          href="/app/settings"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: colors.bgTertiary,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Edit2 size={18} style={{ color: colors.textPrimary }} />
        </Link>
      </div>

      {/* Profile Info Cards */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.textTertiary,
          marginBottom: '16px',
        }}>
          Личные данные
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
        }}>
          {/* Gender */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: colors.bgSecondary,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <User size={18} style={{ color: colors.accentGreen }} />
              <span style={{ fontSize: '0.8125rem', color: colors.textTertiary }}>Пол</span>
            </div>
            <div style={{ fontWeight: 500, color: colors.textPrimary }}>
              {translateGender(user?.gender)}
            </div>
          </div>

          {/* Birth Date */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: colors.bgSecondary,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Calendar size={18} style={{ color: colors.accentGreen }} />
              <span style={{ fontSize: '0.8125rem', color: colors.textTertiary }}>Дата рождения</span>
            </div>
            <div style={{ fontWeight: 500, color: colors.textPrimary }}>
              {formatDate(user?.dateOfBirth)}
            </div>
          </div>

          {/* Skin Type */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: colors.bgSecondary,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Droplet size={18} style={{ color: colors.accentGreen }} />
              <span style={{ fontSize: '0.8125rem', color: colors.textTertiary }}>Тип кожи</span>
            </div>
            <div style={{ fontWeight: 500, color: colors.textPrimary }}>
              {translateSkinType(user?.skinType)}
            </div>
          </div>

          {/* Hair Type */}
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: colors.bgSecondary,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Wind size={18} style={{ color: colors.accentGreen }} />
              <span style={{ fontSize: '0.8125rem', color: colors.textTertiary }}>Тип волос</span>
            </div>
            <div style={{ fontWeight: 500, color: colors.textPrimary }}>
              {translateHairType(user?.hairType)}
            </div>
          </div>
        </div>
      </div>

      {/* Surveys Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <h2 style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.textTertiary,
            margin: 0,
          }}>
            Твои опросы
          </h2>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              color: colors.textTertiary,
              fontSize: '0.75rem',
            }}
          >
            <RefreshCw 
              size={14} 
              style={{ 
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }} 
            />
            {lastUpdated && (
              <span>
                {lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </button>
        </div>

        {/* Survey Progress */}
        <div style={{
          padding: '20px',
          borderRadius: '14px',
          backgroundColor: allSurveysCompleted ? colors.bgSecondary : colors.accentGreenLight,
          border: allSurveysCompleted ? 'none' : `1px solid ${colors.accentGreen}40`,
        }}>
          {allSurveysCompleted ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: colors.accentGreenLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <CheckCircle2 size={24} style={{ color: colors.accentGreen }} />
              </div>
              <div>
                <div style={{ fontWeight: 500, color: colors.textPrimary }}>
                  Все опросы пройдены (3/3)
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
                  Рекомендации полностью персонализированы
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: colors.accentGreen,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ClipboardList size={22} style={{ color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '1rem', 
                  fontWeight: 600, 
                  color: colors.textPrimary,
                  marginBottom: '4px',
                }}>
                  Пройдено {surveyStatus?.completedCount || 0} из 3 опросов
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: colors.textSecondary,
                  marginBottom: '12px',
                }}>
                  Пройдите все опросы для персональных рекомендаций
                </p>
                
                {/* Survey checklist */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                    {surveyStatus?.hasBasic ? (
                      <CheckCircle2 size={16} style={{ color: colors.accentGreen }} />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${colors.textTertiary}` }} />
                    )}
                    <span style={{ color: surveyStatus?.hasBasic ? colors.accentGreen : colors.textSecondary }}>
                      Базовый опрос
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                    {surveyStatus?.hasDermatology ? (
                      <CheckCircle2 size={16} style={{ color: colors.accentGreen }} />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${colors.textTertiary}` }} />
                    )}
                    <span style={{ color: surveyStatus?.hasDermatology ? colors.accentGreen : colors.textSecondary }}>
                      Дерматология
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                    {surveyStatus?.hasTrichology ? (
                      <CheckCircle2 size={16} style={{ color: colors.accentGreen }} />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${colors.textTertiary}` }} />
                    )}
                    <span style={{ color: surveyStatus?.hasTrichology ? colors.accentGreen : colors.textSecondary }}>
                      Трихология
                    </span>
                  </div>
                </div>

                <Link 
                  href="/onboarding/welcome"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    backgroundColor: colors.accentGreen,
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    textDecoration: 'none',
                  }}
                >
                  {surveyStatus?.completedCount ? 'Продолжить опросы' : 'Пройти опросы'}
                  <ChevronRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Allergies */}
      {user?.allergies && user.allergies.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: colors.textTertiary,
            marginBottom: '16px',
          }}>
            Аллергии и непереносимости
          </h2>
          <div style={{
            padding: '16px',
            borderRadius: '14px',
            backgroundColor: '#FEF3C7',
            border: '1px solid #F59E0B40',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <AlertCircle size={20} style={{ color: '#D97706', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {user.allergies.map((allergy, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      color: '#92400E',
                    }}
                  >
                    {allergy}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: colors.textTertiary,
          marginBottom: '16px',
        }}>
          Настройки
        </h2>
        <div style={{
          borderRadius: '14px',
          backgroundColor: colors.bgSecondary,
          overflow: 'hidden',
        }}>
          {menuItems.map((item, index) => (
            <Link
              key={item.id}
              href={item.href}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px',
                backgroundColor: 'transparent',
                borderBottom: index < menuItems.length - 1 ? `1px solid ${colors.bgTertiary}` : 'none',
                textDecoration: 'none',
              }}
            >
              <item.icon size={20} style={{ color: colors.textSecondary }} />
              <span style={{ flex: 1, fontWeight: 500, color: colors.textPrimary }}>
                {item.label}
              </span>
              <ChevronRight size={18} style={{ color: colors.textTertiary }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <motion.button
        onClick={handleLogout}
        disabled={isLoggingOut}
        whileTap={{ scale: 0.98 }}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '16px',
          borderRadius: '14px',
          backgroundColor: colors.dangerLight,
          border: 'none',
          cursor: isLoggingOut ? 'not-allowed' : 'pointer',
          opacity: isLoggingOut ? 0.7 : 1,
        }}
      >
        {isLoggingOut ? (
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid #FCA5A5',
            borderTopColor: colors.danger,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        ) : (
          <LogOut size={20} style={{ color: colors.danger }} />
        )}
        <span style={{
          fontWeight: 600,
          fontSize: '1rem',
          color: colors.danger,
        }}>
          {isLoggingOut ? 'Выход...' : 'Выйти из аккаунта'}
        </span>
      </motion.button>

      {/* App Version */}
      <div style={{
        textAlign: 'center',
        marginTop: '32px',
        padding: '16px',
      }}>
        <p style={{
          fontSize: '0.75rem',
          color: colors.textTertiary,
          margin: 0,
        }}>
          BeautyScore v1.0.0
        </p>
      </div>
    </motion.div>
  )
}
