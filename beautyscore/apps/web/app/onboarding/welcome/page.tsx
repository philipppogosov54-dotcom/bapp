'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Target, AlertTriangle, BarChart3, Lock } from 'lucide-react';
import { useAuth } from '@/contexts';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

const benefits = [
  {
    icon: Target,
    title: 'Персонализированные рекомендации',
    description: 'Подберем продукты именно для вашего типа кожи и волос',
    color: '#2D7A4F',
    bgColor: '#E8F5EC',
  },
  {
    icon: AlertTriangle,
    title: 'Предупреждения об аллергенах',
    description: 'Сразу увидите, если продукт содержит компоненты, на которые у вас аллергия',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
  {
    icon: BarChart3,
    title: 'Точная оценка безопасности',
    description: 'Учитываем ваши индивидуальные особенности при анализе состава',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
  },
  {
    icon: Lock,
    title: 'Конфиденциально и безопасно',
    description: 'Ваши данные защищены и никогда не передаются третьим лицам',
    color: '#2D7A4F',
    bgColor: '#E8F5EC',
  },
];

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#FDFCFB' 
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '2px solid #EDE9E4',
          borderTopColor: '#2D7A4F',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FDFCFB',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Link href="/" style={{ 
            fontSize: '1.25rem', 
            fontWeight: 700, 
            color: '#2D7A4F',
            textDecoration: 'none',
          }}>
            BeautyScore
          </Link>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            backgroundColor: 'white',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{ fontSize: '3.5rem', marginBottom: '16px' }}
            >
              👋
            </motion.div>
            <h1 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 700, 
              color: '#1A1714', 
              marginBottom: '8px' 
            }}>
              Добро пожаловать в BeautyScore!
            </h1>
            <p style={{ color: '#6B6259' }}>
              Давайте настроим ваш персональный опыт
            </p>
          </div>

          {/* Benefits */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '16px',
                    backgroundColor: '#F7F5F3',
                    borderRadius: '14px',
                  }}
                >
                  <div style={{
                    backgroundColor: benefit.bgColor,
                    padding: '10px',
                    borderRadius: '10px',
                    marginRight: '14px',
                    flexShrink: 0,
                  }}>
                    <Icon style={{ width: '20px', height: '20px', color: benefit.color }} />
                  </div>
                  <div>
                    <h3 style={{ 
                      fontWeight: 600, 
                      color: '#1A1714', 
                      marginBottom: '2px',
                      fontSize: '0.9375rem',
                    }}>
                      {benefit.title}
                    </h3>
                    <p style={{ fontSize: '0.8125rem', color: '#6B6259', lineHeight: 1.5 }}>
                      {benefit.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <Button
              onClick={() => router.push('/onboarding')}
              size="lg"
              style={{ width: '100%', marginBottom: '12px' }}
            >
              Начать настройку
            </Button>
            <Link
              href="/app"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                padding: '12px',
                color: '#8C8177',
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              Заполню позже
            </Link>
          </motion.div>

          {/* Time estimate */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            style={{
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: '#8C8177',
              marginTop: '16px',
            }}
          >
            ⏱️ Займет около 2 минут
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
