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

export function TermsContent() {
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
        Условия использования
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
          1. Общие положения
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Настоящие Условия использования (далее — «Условия») регулируют отношения между 
          ООО «БьютиСкор» (далее — «Оператор», «мы») и пользователем (далее — «Пользователь», «вы») 
          при использовании сервиса BeautyScore (далее — «Сервис»).
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Регистрируясь и используя Сервис, вы подтверждаете, что прочитали, поняли и согласны 
          с настоящими Условиями. Если вы не согласны с какими-либо положениями, пожалуйста, 
          воздержитесь от использования Сервиса.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          2. Описание Сервиса
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          BeautyScore — это платформа для анализа косметических продуктов с использованием 
          искусственного интеллекта. Сервис предоставляет:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Персонализированную оценку совместимости продуктов с вашим типом кожи/волос</li>
          <li>Анализ состава косметических продуктов</li>
          <li>AI-рекомендации по уходу</li>
          <li>Возможность сохранять продукты и отслеживать свою «Полку»</li>
          <li>Поиск и каталог косметических продуктов</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          3. Регистрация и аккаунт
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          3.1. Для использования персонализированных функций Сервиса требуется регистрация.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          3.2. При регистрации вы обязуетесь предоставить достоверную информацию и поддерживать 
          её актуальность.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          3.3. Вы несёте ответственность за сохранность учётных данных (пароля) и все действия, 
          совершённые под вашим аккаунтом.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          3.4. Один пользователь может иметь только один аккаунт. Создание множественных аккаунтов 
          запрещено.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          3.5. Мы оставляем за собой право заблокировать или удалить аккаунт при нарушении 
          настоящих Условий.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          4. Права и обязанности Пользователя
        </h2>
        
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          4.1. Пользователь имеет право:
        </h3>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Использовать Сервис в соответствии с его функционалом</li>
          <li>Получать персонализированные рекомендации</li>
          <li>Экспортировать свои данные в любой момент</li>
          <li>Удалить аккаунт и все связанные данные</li>
          <li>Обращаться в службу поддержки</li>
        </ul>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          4.2. Пользователь обязуется:
        </h3>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Соблюдать настоящие Условия</li>
          <li>Не использовать Сервис для незаконных целей</li>
          <li>Не пытаться получить несанкционированный доступ к системам Сервиса</li>
          <li>Не распространять вредоносное ПО</li>
          <li>Не создавать автоматизированные запросы (боты, парсеры) без письменного разрешения</li>
          <li>Не нарушать права других пользователей</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          5. Ограничение ответственности
        </h2>
        
        <div style={{
          backgroundColor: '#FEF3C7',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <p style={{ lineHeight: 1.7, color: '#92400E', margin: 0, fontWeight: 500 }}>
            ⚠️ Важно: BeautyScore НЕ является медицинским приложением. Рекомендации носят 
            исключительно информационный характер и не заменяют консультацию специалиста 
            (дерматолога, трихолога, аллерголога).
          </p>
        </div>

        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          5.1. Оператор не гарантирует, что рекомендации Сервиса подойдут конкретному пользователю. 
          Индивидуальная реакция на косметические продукты может отличаться.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          5.2. При серьёзных проблемах с кожей, волосами или аллергических реакциях обязательно 
          обратитесь к врачу.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          5.3. Оператор не несёт ответственности за:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Аллергические реакции или побочные эффекты от использования продуктов</li>
          <li>Неточности в информации о составе продуктов (данные берутся из открытых источников)</li>
          <li>Временную недоступность Сервиса по техническим причинам</li>
          <li>Действия третьих лиц (производителей косметики, ритейлеров)</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          6. Интеллектуальная собственность
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          6.1. Все права на Сервис, включая дизайн, код, алгоритмы AI-анализа, логотипы и 
          торговые знаки, принадлежат Оператору или используются по лицензии.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          6.2. Пользователь получает ограниченную, неисключительную лицензию на использование 
          Сервиса для личных некоммерческих целей.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          6.3. Запрещается копирование, модификация, распространение или создание производных 
          работ на основе Сервиса без письменного разрешения.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          7. Тарифы и оплата
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          7.1. Базовый функционал Сервиса предоставляется бесплатно.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          7.2. Дополнительные платные функции (если будут введены) будут чётко обозначены 
          до их активации.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          7.3. Оператор оставляет за собой право изменять тарифы с предварительным уведомлением.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          8. Прекращение использования
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          8.1. Вы можете прекратить использование Сервиса в любой момент, удалив свой аккаунт 
          в настройках профиля.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          8.2. После удаления аккаунта ваши данные хранятся 30 дней для возможности восстановления, 
          затем безвозвратно удаляются.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          8.3. Оператор может приостановить или прекратить доступ к Сервису при нарушении 
          настоящих Условий.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          9. Изменение Условий
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          9.1. Оператор может изменять настоящие Условия. Актуальная версия всегда доступна 
          на данной странице.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          9.2. О существенных изменениях мы уведомим по электронной почте или через Сервис.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          9.3. Продолжая использовать Сервис после изменений, вы соглашаетесь с новой версией Условий.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          10. Применимое право и разрешение споров
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          10.1. Настоящие Условия регулируются законодательством Российской Федерации.
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          10.2. Споры разрешаются путём переговоров. При невозможности достичь согласия — 
          в суде по месту нахождения Оператора.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          11. Контакты
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          По всем вопросам, связанным с настоящими Условиями:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Email: <a href="mailto:support@beautyscore.ru" style={{ color: colors.accentGreen }}>support@beautyscore.ru</a></li>
          <li>Форма обратной связи: <Link href="/contact" style={{ color: colors.accentGreen }}>/contact</Link></li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          12. Дополнительные документы
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Неотъемлемой частью настоящих Условий являются:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li><Link href="/privacy" style={{ color: colors.accentGreen }}>Политика конфиденциальности</Link></li>
          <li><Link href="/cookies" style={{ color: colors.accentGreen }}>Cookie-политика</Link></li>
        </ul>
      </section>

      <div style={{
        marginTop: '48px',
        padding: '20px',
        backgroundColor: colors.bgSecondary,
        borderRadius: '12px',
      }}>
        <p style={{ fontSize: '0.875rem', color: colors.textTertiary, margin: 0 }}>
          Используя BeautyScore, вы подтверждаете, что ознакомились и согласны с настоящими 
          Условиями использования.
        </p>
      </div>
    </div>
  )
}
