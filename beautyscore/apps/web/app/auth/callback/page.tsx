'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken');
        const redirectUrl = searchParams.get('redirectUrl');
        const errorMessage = searchParams.get('error');

        // Handle error from OAuth provider
        if (errorMessage) {
          setError(decodeURIComponent(errorMessage));
          setIsProcessing(false);
          return;
        }

        // Handle VK/Yandex OAuth callback (token in URL)
        if (accessToken) {
          // Use loginWithToken to set the token and fetch user via /auth/me
          const result = await loginWithToken(accessToken);
          
          if (!result.success) {
            setError(result.error || 'Ошибка авторизации');
            setIsProcessing(false);
            return;
          }
          
          // Use redirectUrl from backend - it already checks onboardingCompleted
          // Backend calculates the correct redirect based on user's actual DB status
          if (redirectUrl) {
            router.push(decodeURIComponent(redirectUrl));
          } else {
            // Fallback to onboarding/welcome for safety (new users)
            router.push('/onboarding/welcome');
          }
          return;
        }

        // No valid auth data found
        setError('Не удалось получить данные авторизации');
        setIsProcessing(false);
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('Произошла ошибка при обработке авторизации');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [searchParams, router, loginWithToken]);

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDFCFB',
        padding: '16px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: '400px',
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#1A1714',
            marginBottom: '8px',
          }}>
            Ошибка авторизации
          </h1>
          <p style={{ color: '#6B6259', marginBottom: '24px' }}>{error}</p>
          <button
            onClick={() => router.push('/login')}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#2D7A4F',
              color: 'white',
              fontWeight: 600,
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'background-color 0.2s',
            }}
          >
            Попробовать снова
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FDFCFB',
    }}>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: 'center' }}
      >
        <div style={{
          position: 'relative',
          width: '64px',
          height: '64px',
          margin: '0 auto 16px',
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '4px solid rgba(45, 122, 79, 0.2)',
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '4px solid #2D7A4F',
            borderTopColor: 'transparent',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
        <p style={{ color: '#6B6259' }}>Выполняется вход...</p>
      </motion.div>
    </div>
  );
}
