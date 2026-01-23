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

export function PrivacyContent() {
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
        Политика конфиденциальности
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
          Настоящая Политика конфиденциальности определяет порядок обработки персональных данных 
          пользователей сервиса BeautyScore (далее — «Сервис»), оператором которого является 
          ООО «БьютиСкор» (далее — «Оператор»).
        </p>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Используя Сервис, вы соглашаетесь с условиями настоящей Политики и даёте согласие 
          на обработку ваших персональных данных в соответствии с Федеральным законом от 27.07.2006 
          № 152-ФЗ «О персональных данных».
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          2. Какие данные мы собираем
        </h2>
        
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          2.1. Данные для авторизации:
        </h3>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Адрес электронной почты</li>
          <li>Номер телефона</li>
          <li>Данные OAuth-провайдеров (VK, Яндекс) — только публичный профиль</li>
        </ul>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          2.2. Данные профиля:
        </h3>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Имя (по желанию)</li>
          <li>Дата рождения (для персонализации рекомендаций)</li>
          <li>Пол</li>
          <li>Аватар</li>
        </ul>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          2.3. Данные опросов (для персонализации):
        </h3>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Тип кожи, проблемы с кожей</li>
          <li>Тип волос, проблемы с волосами</li>
          <li>Аллергии и чувствительность</li>
          <li>Предпочтения в уходе</li>
        </ul>

        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '12px', marginTop: '20px' }}>
          2.4. Данные об использовании:
        </h3>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>История поиска продуктов</li>
          <li>Сохранённые продукты («Полка»)</li>
          <li>Оценки и отзывы</li>
          <li>Взаимодействие с AI-рекомендациями</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          3. Цели обработки данных
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Ваши персональные данные обрабатываются для следующих целей:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Авторизация и безопасность</strong> — идентификация пользователя, защита аккаунта</li>
          <li><strong>Персонализация</strong> — расчёт индивидуальной совместимости продуктов с вашим типом кожи/волос</li>
          <li><strong>AI-рекомендации</strong> — генерация персональных советов на основе вашего профиля</li>
          <li><strong>Улучшение сервиса</strong> — анализ паттернов использования для оптимизации</li>
          <li><strong>Коммуникация</strong> — уведомления о важных обновлениях, ответы на обращения</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          4. Правовые основания обработки (152-ФЗ)
        </h2>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li><strong>Согласие субъекта</strong> — вы даёте согласие при регистрации и прохождении опросов</li>
          <li><strong>Исполнение договора</strong> — обработка необходима для предоставления услуг Сервиса</li>
          <li><strong>Законные интересы</strong> — защита от мошенничества, улучшение безопасности</li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          5. Хранение и безопасность данных
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Мы применяем организационные и технические меры для защиты ваших данных:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Данные хранятся на защищённых серверах в Российской Федерации</li>
          <li>Передача данных осуществляется по шифрованным каналам (TLS 1.3)</li>
          <li>Пароли хранятся в хешированном виде (bcrypt)</li>
          <li>Доступ к данным ограничен и журналируется</li>
          <li>Регулярное резервное копирование</li>
        </ul>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          <strong>Срок хранения:</strong> Данные хранятся в течение срока действия вашего аккаунта 
          и 30 дней после удаления (для возможности восстановления).
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          6. Ваши права (согласно 152-ФЗ)
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Как субъект персональных данных, вы имеете право:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            <strong>Право на доступ</strong> — получить информацию о том, какие ваши данные обрабатываются. 
            Используйте функцию «Экспорт данных» в настройках профиля.
          </li>
          <li>
            <strong>Право на исправление</strong> — изменить неточные данные в любой момент в профиле.
          </li>
          <li>
            <strong>Право на удаление</strong> — удалить аккаунт и все связанные данные. 
            После удаления данные хранятся 30 дней для возможности восстановления, затем уничтожаются.
          </li>
          <li>
            <strong>Право на отзыв согласия</strong> — вы можете отозвать согласие на обработку 
            определённых категорий данных (например, данные опросов).
          </li>
          <li>
            <strong>Право на переносимость</strong> — экспортировать данные в машиночитаемом формате (JSON).
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          7. Передача данных третьим лицам
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Мы не продаём ваши персональные данные. Передача данных третьим лицам возможна только:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>
            <strong>AI-провайдерам</strong> (GigaChat, YandexGPT) — для генерации персональных рекомендаций. 
            Передаются только обезличенные данные о типе кожи/волос без идентификаторов личности.
          </li>
          <li>
            <strong>OAuth-провайдерам</strong> (VK, Яндекс) — при авторизации через их сервисы.
          </li>
          <li>
            <strong>По требованию закона</strong> — по запросу уполномоченных государственных органов.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          8. Cookies и аналитика
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Мы используем cookies для:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Поддержания авторизованной сессии (refresh token)</li>
          <li>Запоминания предпочтений интерфейса</li>
          <li>Сбора анонимной статистики использования</li>
        </ul>
        <p style={{ lineHeight: 1.7, color: colors.textSecondary }}>
          Подробнее см. <Link href="/cookies" style={{ color: colors.accentGreen }}>Cookie-политику</Link>.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          9. Изменение Политики
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          Мы можем обновлять настоящую Политику. При существенных изменениях вы получите уведомление 
          по электронной почте или через Сервис. Продолжая использовать Сервис после изменений, 
          вы соглашаетесь с обновлённой Политикой.
        </p>
      </section>

      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px' }}>
          10. Контакты
        </h2>
        <p style={{ lineHeight: 1.7, marginBottom: '12px', color: colors.textSecondary }}>
          По вопросам, связанным с обработкой персональных данных:
        </p>
        <ul style={{ lineHeight: 1.7, color: colors.textSecondary, paddingLeft: '24px', marginBottom: '16px' }}>
          <li>Email: <a href="mailto:privacy@beautyscore.ru" style={{ color: colors.accentGreen }}>privacy@beautyscore.ru</a></li>
          <li>Форма обратной связи: <Link href="/contact" style={{ color: colors.accentGreen }}>/contact</Link></li>
        </ul>
        <p style={{ lineHeight: 1.7, color: colors.textSecondary }}>
          Ответственный за организацию обработки персональных данных: 
          Иванов Иван Иванович, email: dpo@beautyscore.ru
        </p>
      </section>

      <div style={{
        marginTop: '48px',
        padding: '20px',
        backgroundColor: colors.bgSecondary,
        borderRadius: '12px',
      }}>
        <p style={{ fontSize: '0.875rem', color: colors.textTertiary, margin: 0 }}>
          Принимая условия при регистрации, вы подтверждаете, что ознакомились с данной Политикой 
          конфиденциальности и даёте согласие на обработку персональных данных в указанных целях.
        </p>
      </div>
    </div>
  )
}
