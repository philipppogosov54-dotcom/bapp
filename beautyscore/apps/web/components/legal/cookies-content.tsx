'use client'

import Link from 'next/link'

// Design system colors
const colors = {
  bgPrimary: '#FDFCFB',
  bgSecondary: '#F7F5F3',
  textPrimary: '#1A1714',
  textSecondary: '#6B6259',
  textTertiary: '#8C8177',
  accentGreen: '#2D7A4F',
}

export function CookiesContent() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      color: colors.textPrimary,
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 700,
        marginBottom: '8px',
      }}>
        Cookie-политика
      </h1>
      
      <p style={{
        fontSize: '0.875rem',
        color: colors.textTertiary,
        marginBottom: '32px',
      }}>
        Последнее обновление: 21 января 2026
      </p>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          1. Что такое cookies?
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Cookies (куки) — это небольшие текстовые файлы, которые сохраняются на вашем устройстве 
          при посещении веб-сайтов. Они помогают сайтам запоминать информацию о вашем визите, 
          например, предпочтительный язык и другие настройки.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          2. Какие cookies мы используем
        </h2>
        
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          2.1. Строго необходимые cookies
        </h3>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Эти cookies необходимы для работы Сервиса и не могут быть отключены.
        </p>
        <div style={{
          overflowX: 'auto',
          marginBottom: '20px',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
          }}>
            <thead>
              <tr style={{ backgroundColor: colors.bgSecondary }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${colors.bgSecondary}` }}>Название</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${colors.bgSecondary}` }}>Назначение</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${colors.bgSecondary}` }}>Срок хранения</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>refreshToken</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>Поддержание авторизованной сессии</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>7 дней</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>sessionId</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>Идентификация сессии</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>До закрытия браузера</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          2.2. Функциональные cookies
        </h3>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Эти cookies позволяют запоминать ваши предпочтения для улучшения пользовательского опыта.
        </p>
        <div style={{
          overflowX: 'auto',
          marginBottom: '20px',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
          }}>
            <thead>
              <tr style={{ backgroundColor: colors.bgSecondary }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${colors.bgSecondary}` }}>Название</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${colors.bgSecondary}` }}>Назначение</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${colors.bgSecondary}` }}>Срок хранения</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>theme</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>Сохранение темы интерфейса (светлая/тёмная)</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>1 год</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>locale</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>Предпочтительный язык</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>1 год</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          2.3. Аналитические cookies
        </h3>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Эти cookies помогают нам понять, как пользователи взаимодействуют с Сервисом, 
          для его улучшения. Данные собираются в обезличенном виде.
        </p>
        <div style={{
          overflowX: 'auto',
          marginBottom: '20px',
        }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.875rem',
          }}>
            <thead>
              <tr style={{ backgroundColor: colors.bgSecondary }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${colors.bgSecondary}` }}>Название</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${colors.bgSecondary}` }}>Назначение</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${colors.bgSecondary}` }}>Срок хранения</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>bs_session_id</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>Идентификатор аналитической сессии</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>30 минут</td>
              </tr>
              <tr>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>bs_session_time</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>Время последней активности</td>
                <td style={{ padding: '12px', borderBottom: `1px solid ${colors.bgSecondary}`, color: colors.textSecondary }}>30 минут</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          3. Local Storage и Session Storage
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Помимо cookies, мы используем другие технологии хранения данных в браузере:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            <strong>Access Token</strong> — хранится только в памяти приложения (не в cookies/storage) 
            для защиты от XSS-атак
          </li>
          <li>
            <strong>Данные кэша</strong> — временное хранение результатов поиска для ускорения работы
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          4. Управление cookies
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Вы можете управлять cookies следующими способами:
        </p>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          4.1. Настройки браузера
        </h3>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Большинство браузеров позволяют:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Просматривать установленные cookies</li>
          <li>Удалять все или отдельные cookies</li>
          <li>Блокировать cookies с определённых сайтов</li>
          <li>Блокировать все cookies (⚠️ может привести к некорректной работе Сервиса)</li>
        </ul>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          4.2. Последствия отключения cookies
        </h3>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          При отключении строго необходимых cookies:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Вы не сможете оставаться авторизованным</li>
          <li>Потребуется повторный вход при каждом посещении</li>
          <li>Некоторые функции могут работать некорректно</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          5. Сторонние cookies
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          В настоящее время BeautyScore не использует сторонние cookies (рекламные сети, 
          трекеры социальных сетей и т.п.).
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          При авторизации через OAuth (VK, Яндекс) эти сервисы могут устанавливать свои cookies 
          в соответствии с их политиками конфиденциальности.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          6. Изменение политики
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Мы можем обновлять настоящую Cookie-политику. Актуальная версия всегда доступна 
          на данной странице с указанием даты последнего обновления.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          7. Контакты
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          По вопросам использования cookies:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Email: <a href="mailto:privacy@beautyscore.ru" style={{ color: colors.accentGreen }}>privacy@beautyscore.ru</a></li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          8. Дополнительные документы
        </h2>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li><Link href="/privacy" style={{ color: colors.accentGreen }}>Политика конфиденциальности</Link></li>
          <li><Link href="/terms" style={{ color: colors.accentGreen }}>Условия использования</Link></li>
        </ul>
      </section>

      <div style={{
        marginTop: '48px',
        padding: '20px',
        backgroundColor: colors.bgSecondary,
        borderRadius: '12px',
      }}>
        <p style={{ fontSize: '0.875rem', color: colors.textTertiary, margin: 0 }}>
          Продолжая использовать BeautyScore, вы соглашаетесь с использованием cookies 
          в соответствии с настоящей политикой.
        </p>
      </div>
    </div>
  )
}
