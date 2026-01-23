'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PhoneInput } from '@/components/auth/phone-input';
import { CodeInput } from '@/components/auth/code-input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts';
import { getPostAuthRedirect } from '@/lib/utils/auth-redirect';

type Step = 'phone' | 'code';

export default function PhoneLoginPage() {
  const router = useRouter();
  const { loginWithToken, isAuthenticated, user } = useAuth();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeId, setCodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = getPostAuthRedirect(user, false);
      router.push(redirectPath);
    }
  }, [isAuthenticated, user, router]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendCode = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await api.post<{ codeId: string }>('/auth/sms/send', { phone });
      if (data.codeId) {
        setCodeId(data.codeId);
        setStep('code');
        setResendTimer(60);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Не удалось отправить код';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!codeId || code.length !== 6) return;

    setError(null);
    setIsLoading(true);

    try {
      const data = await api.post<{ accessToken: string; user: { onboardingCompleted?: boolean }; isNewUser?: boolean }>('/auth/sms/verify', {
        codeId,
        code,
      });

      if (data.accessToken) {
        const result = await loginWithToken(data.accessToken);
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to login');
        }

        // Wait a bit for user data to be set
        setTimeout(() => {
          const isNewUser = data.isNewUser || false;
          const redirectPath = getPostAuthRedirect(user, isNewUser);
          router.push(redirectPath);
        }, 100);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Неверный код';
      setError(message);
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    await handleSendCode();
  };

  const handleBack = () => {
    if (step === 'code') {
      setStep('phone');
      setCode('');
      setError(null);
    } else {
      router.back();
    }
  };

  const isPhoneValid = phone.replace(/\D/g, '').length === 11;

  if (step === 'code') {
    return (
      <>
        {/* Back button */}
        <button
          onClick={handleBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#6B6259',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            marginBottom: '24px',
            fontSize: '0.875rem',
          }}
        >
          <ChevronLeft size={18} />
          <span>Назад</span>
        </button>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>
            Введите код
          </h1>
          <p style={{ color: '#6B6259' }}>
            Код отправлен на номер{' '}
            <span style={{ fontWeight: 500, color: '#1A1714' }}>
              +7 ({phone.slice(1, 4)}) ***-**-{phone.slice(-2)}
            </span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '16px',
            backgroundColor: '#FEE2E2',
            border: '1px solid #FCA5A5',
            borderRadius: '12px',
            color: '#DC2626',
            fontSize: '0.875rem',
            marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* Code Input */}
        <div style={{ marginBottom: '24px' }}>
          <CodeInput
            value={code}
            onChange={(newCode) => {
              setCode(newCode);
              setError(null);
            }}
            disabled={isLoading}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleVerifyCode}
          disabled={code.length !== 6 || isLoading}
          loading={isLoading}
          size="lg"
          style={{ width: '100%' }}
        >
          Подтвердить
        </Button>

        {/* Resend */}
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          {resendTimer > 0 ? (
            <p style={{ fontSize: '0.875rem', color: '#6B6259' }}>
              Отправить код повторно через {resendTimer} сек
            </p>
          ) : (
            <button
              onClick={handleResendCode}
              style={{
                background: 'none',
                border: 'none',
                color: '#2D7A4F',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Отправить код повторно
            </button>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Back button */}
      <button
        onClick={handleBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          color: '#6B6259',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '24px',
          fontSize: '0.875rem',
        }}
      >
        <ChevronLeft size={18} />
        <span>Назад</span>
      </button>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1A1714', marginBottom: '8px' }}>
          Вход по телефону
        </h1>
        <p style={{ color: '#6B6259' }}>
          Введите номер телефона для получения кода
        </p>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          borderRadius: '12px',
          color: '#DC2626',
          fontSize: '0.875rem',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Phone Input */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#1A1714',
          marginBottom: '8px',
        }}>
          Номер телефона
        </label>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          disabled={isLoading}
        />
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSendCode}
        disabled={!isPhoneValid || isLoading}
        loading={isLoading}
        size="lg"
        style={{ width: '100%' }}
      >
        Отправить код
      </Button>

      {/* Alternative login */}
      <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.875rem', color: '#6B6259' }}>
        Или{' '}
        <Link href="/login" style={{ color: '#2D7A4F', textDecoration: 'none', fontWeight: 500 }}>
          войдите через email
        </Link>
      </p>
    </>
  );
}
