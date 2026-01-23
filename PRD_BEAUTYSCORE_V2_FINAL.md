# 📋 PRD: BeautyScore v2.0 — FINAL
# Гиперперсонализированная платформа ухода за кожей и волосами

**Версия:** 2.0 FINAL  
**Дата:** 20 января 2026  
**Статус:** Production-Ready  
**Платформа:** PWA (Progressive Web Application)  
**Стили:** Inline styles (React style objects)

---

## 📌 Executive Summary

### Миссия
BeautyScore — это **гиперперсонализированная** платформа, которая помогает пользователям понять, какие косметические средства **подходят именно им**.

### Ключевое Отличие
> "Это будет самое гиперперсонализированное приложение в мире."

| Конкуренты | BeautyScore |
|------------|-------------|
| Универсальная оценка | **Персональная оценка под профиль** |
| Статичные описания | **LLM-генерируемые рекомендации** |
| Одинаково для всех | **Уникально для каждого** |

### ⚠️ ВАЖНЫЕ ДИСКЛЕЙМЕРЫ

```
1. BeautyScore НЕ является медицинским приложением
2. Рекомендации носят информационный характер
3. При серьезных проблемах обратитесь к дерматологу
4. Мы не несем ответственности за индивидуальные реакции
```

---

## 🏗️ Архитектура Приложения

### Навигация (Bottom Tab Bar)

```
┌────────┬────────────┬──────────────┬──────────┬──────────┐
│ 🔍     │  📦        │  📚         │  📈      │  👤      │
│ Поиск  │  Полка     │ Энциклопед. │ Тренды β │ Профиль  │
└────────┴────────────┴──────────────┴──────────┴──────────┘
```

### Матрица Доступа

| Функция | Без регистр. | После рег. | После базового | После дермат. | После трихол. | Полный |
|---------|-------------|------------|----------------|---------------|---------------|--------|
| Просмотр энциклопедии | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Поиск по энциклопедии | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Регистрация | ✅ | — | — | — | — | — |
| Персональный поиск | ❌ | ❌ | ⚠️ базовый | ✅ кожа | ✅ волосы | ✅ |
| Моя полка | ❌ | ❌ | ⚠️ базовый | ✅ кожа | ✅ волосы | ✅ |
| LLM-рекомендации | ❌ | ❌ | ⚠️ базовые | ✅ кожа | ✅ волосы | ✅ |
| Тренды персональные | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| Клинический опрос | ❌ | ❌ | ❌ | ✅ | ✅ | — |

---

## 📱 USER FLOWS (Все сценарии)

### Flow 1: Первый вход (новый пользователь)

```
1. Открытие приложения
   │
   ├─→ [Splash Screen] (2 сек, логотип + слоган)
   │
   ├─→ [Welcome Screen]
   │   ├── Заголовок: "Добро пожаловать в BeautyScore"
   │   ├── Подзаголовок: "Узнай, что подходит именно тебе"
   │   ├── Иллюстрация
   │   ├── [Войти] → Flow 2
   │   ├── [Зарегистрироваться] → Flow 3
   │   └── [Посмотреть энциклопедию] → Энциклопедия (гостевой режим)
   │
   └─→ Гостевой режим:
       ├── Энциклопедия: ✅ доступна
       ├── Поиск: ❌ плашка "Войдите для персональных рекомендаций"
       ├── Полка: ❌ плашка "Войдите чтобы сохранять товары"
       ├── Тренды: ✅ общие тренды
       └── Профиль: [Войти] / [Зарегистрироваться]
```

### Flow 2: Вход (существующий пользователь)

```
1. [Экран входа]
   ├── Email / Телефон
   ├── Пароль
   ├── [Войти]
   ├── [Забыли пароль?] → Flow 4
   ├── [Войти через Яндекс]
   ├── [Войти через VK]
   └── [Нет аккаунта? Зарегистрироваться]

2. После успешного входа:
   ├── Если onboarding НЕ завершен → Flow 5 (Опросы)
   └── Если onboarding завершен → Главный экран (Поиск)
```

### Flow 3: Регистрация

```
1. [Экран регистрации]
   ├── Имя
   ├── Email / Телефон (переключатель)
   ├── Пароль (требования: 8+ символов, буквы + цифры)
   ├── [✓] Согласие на обработку ПД (обязательно)
   ├── [✓] Согласие на рассылку (опционально)
   └── [Зарегистрироваться]

2. [Подтверждение]
   ├── Email: письмо с кодом (6 цифр)
   ├── Телефон: SMS с кодом (6 цифр)
   ├── Ввод кода
   ├── [Отправить код повторно] (доступно через 60 сек)
   └── Таймер: 5 минут на ввод

3. После подтверждения → Flow 5 (Опросы)
```

### Flow 4: Восстановление пароля

```
1. [Забыли пароль?]
   ├── Email / Телефон
   └── [Отправить код]

2. [Ввод кода]
   ├── 6 цифр
   └── [Подтвердить]

3. [Новый пароль]
   ├── Новый пароль
   ├── Подтверждение пароля
   └── [Сохранить]

4. [Успех] → Автоматический вход → Главный экран
```

### Flow 5: Онбординг (Опросы)

```
1. [Приветствие опросов]
   ├── Заголовок: "Расскажите о себе"
   ├── Подзаголовок: "Это займет 3 минуты и поможет нам..."
   ├── Что вы получите: [список преимуществ]
   └── [Начать] → Базовый опрос

2. [Базовый опрос] (5 вопросов, ~2 мин)
   ├── Прогресс: [███░░░░░░░] 1/5
   ├── Вопрос + варианты ответа
   ├── [Назад] (кроме первого вопроса)
   ├── [Далее] (активна после выбора)
   └── [✕] Закрыть → Подтверждение "Прогресс будет сохранен"

3. [Завершение базового]
   ├── "Отлично! Базовый профиль создан"
   ├── "Теперь вам доступны базовые рекомендации"
   ├── [Продолжить с дерматологией] → Опрос дерматологии
   ├── [Продолжить с трихологией] → Опрос трихологии
   └── [Позже] → Главный экран

4. [Опрос дерматологии] (6 вопросов, ~3-5 мин)
   ├── Аналогичная структура
   └── После завершения: "Теперь вам доступны рекомендации по уходу за кожей"

5. [Опрос трихологии] (6 вопросов, ~3-5 мин)
   ├── Аналогичная структура
   └── После завершения: "Теперь вам доступны рекомендации по уходу за волосами"
```

### Flow 6: Поиск товара

```
1. [Экран поиска]
   ├── Если опросы НЕ пройдены:
   │   ├── [🔒 Плашка блокировки]
   │   ├── "Мы заботимся о вашем здоровье..."
   │   ├── [Пройти опрос]
   │   └── "Пока можете искать в энциклопедии" → ссылка
   │
   └── Если опросы пройдены:
       ├── [Поле поиска] с автокомплитом
       ├── Быстрые действия: [Добавить] [Узнать] [Найти для]
       ├── [Свободный ввод LLM]
       ├── Фильтр бюджета (слайдер)
       └── История поиска

2. [Результаты поиска]
   ├── Список товаров
   ├── Каждый товар:
   │   ├── Фото, название, бренд
   │   ├── Цена
   │   ├── [Персональная оценка] (loading → число)
   │   └── [→] Детали
   ├── Фильтры: категория, бренд, цена, тип кожи
   └── Сортировка: по оценке, по цене, по популярности

3. [Детали товара]
   ├── Фото (галерея)
   ├── Название, бренд, цена
   ├── [Персональная оценка] (большой виджет)
   │   ├── Score: 87/100
   │   ├── "Отлично подходит для твоей сухой кожи"
   │   ├── ✅ Плюсы (список)
   │   ├── ⚠️ Минусы (список)
   │   └── Совместимость с полкой
   ├── Состав (INCI) → раскрываемый
   ├── Описание
   ├── [+ Добавить на полку]
   └── [Спросить про этот товар] → LLM чат
```

### Flow 7: LLM Чат ("Спросить")

```
1. [Чат с AI]
   ├── История сообщений
   ├── Сообщение пользователя
   ├── [Отправить]
   │
   ├── [Loading state]
   │   ├── "Анализирую..." (typing indicator)
   │   └── Время ожидания: до 15 сек
   │
   ├── [Ответ AI]
   │   ├── Текст рекомендации
   │   ├── Связанные товары (карточки)
   │   └── Альтернативы (если есть)
   │
   └── [Error state]
       ├── "Не удалось получить ответ"
       └── [Попробовать снова]
```

### Flow 8: Полка

```
1. [Экран полки]
   ├── Если опросы НЕ пройдены → Плашка блокировки
   │
   └── Если опросы пройдены:
       ├── [Общая оценка полки]
       │   ├── Score: 78/100
       │   ├── Breakdown: состав, совместимость, полнота
       │   └── [Подробнее]
       │
       ├── [Рекомендации]
       │   ├── ⚠️ Заменить: товар X (причина)
       │   ├── ➕ Добавить: категория (причина)
       │   └── ✅ Отлично: товар Y + Z (почему)
       │
       ├── [Список товаров]
       │   ├── Фильтры: статус, категория
       │   ├── Сортировка: по дате, по оценке
       │   └── Каждый товар:
       │       ├── Фото, название
       │       ├── Персональная оценка
       │       ├── Статус: [Использую ▼] dropdown
       │       └── [⋮] меню: заметка, удалить
       │
       └── [+ Добавить товар]

2. [Добавление товара]
   ├── Откуда:
   │   ├── Поиск → результаты → [+]
   │   ├── Энциклопедия → товар → [+]
   │   └── Детали товара → [+ Добавить на полку]
   │
   └── [Модалка подтверждения]
       ├── Товар добавлен!
       ├── Оценка: 87
       ├── [Перейти на полку]
       └── [Продолжить поиск]

3. [Удаление товара]
   ├── Свайп влево → [Удалить]
   ├── Или: [⋮] → Удалить
   ├── [Подтверждение] "Удалить товар с полки?"
   ├── [Отмена] [Удалить]
   └── [Toast] "Товар удален" + [Отменить] (5 сек)
```

### Flow 9: Профиль и настройки

```
1. [Экран профиля]
   ├── Аватар + имя + email
   ├── [Редактировать профиль]
   │
   ├── [Заполненность профиля]
   │   └── Прогресс-бар: 60%
   │
   ├── [Твои опросы]
   │   ├── ✅ Базовый — пройден [Редактировать]
   │   ├── ✅ Дерматология — пройден [Редактировать]
   │   ├── ⏳ Трихология — не пройден [Пройти]
   │   └── 🔒 Клинический — заблокирован
   │
   ├── [Твой профиль]
   │   ├── Кожа: Сухая, Тусклость
   │   ├── Аллергии: Нет
   │   └── [Редактировать]
   │
   ├── [Настройки]
   │   ├── Уведомления
   │   ├── Конфиденциальность
   │   └── Язык
   │
   ├── [Помощь]
   │   ├── FAQ
   │   ├── Написать в поддержку
   │   └── О приложении
   │
   └── [Выйти]
       ├── Подтверждение
       └── → Welcome Screen

2. [Редактирование опроса]
   ├── Показать текущие ответы
   ├── Возможность изменить каждый
   ├── [Сохранить изменения]
   └── ⚠️ "Оценки товаров будут пересчитаны"

3. [Удаление аккаунта]
   ├── Настройки → Конфиденциальность → Удалить аккаунт
   ├── [Предупреждение] "Все данные будут удалены"
   ├── Ввод пароля для подтверждения
   ├── [Удалить навсегда]
   └── → Welcome Screen
```

---

## 🔌 API SPECIFICATION (Полное покрытие)

### Аутентификация

```yaml
# Регистрация и вход
POST   /api/auth/register
       Body: { email?, phone?, password, name, acceptTerms: true, acceptMarketing?: false }
       Response: { user, tokens: { access, refresh } }
       Errors: 400 (validation), 409 (already exists)

POST   /api/auth/login
       Body: { email?, phone?, password }
       Response: { user, tokens }
       Errors: 401 (invalid credentials), 423 (account locked)

POST   /api/auth/logout
       Headers: Authorization: Bearer {token}
       Body: { refreshToken }
       Response: { success: true }

POST   /api/auth/refresh
       Body: { refreshToken }
       Response: { tokens }
       Errors: 401 (invalid/expired token)

# Верификация
POST   /api/auth/verify-email
       Body: { email, code }
       Response: { verified: true }
       Errors: 400 (invalid code), 410 (expired)

POST   /api/auth/verify-phone
       Body: { phone, code }
       Response: { verified: true }

POST   /api/auth/resend-code
       Body: { email?, phone?, type: "email" | "phone" }
       Response: { sent: true, retryAfter: 60 }
       Errors: 429 (too many requests)

# Восстановление пароля
POST   /api/auth/forgot-password
       Body: { email?, phone? }
       Response: { sent: true }

POST   /api/auth/reset-password
       Body: { email?, phone?, code, newPassword }
       Response: { success: true }

# OAuth
POST   /api/auth/oauth/yandex
       Body: { code }
       Response: { user, tokens, isNewUser: boolean }

POST   /api/auth/oauth/vk
       Body: { code }
       Response: { user, tokens, isNewUser: boolean }

# Текущий пользователь
GET    /api/auth/me
       Headers: Authorization: Bearer {token}
       Response: { user }
```

### Профиль

```yaml
GET    /api/profile
       Response: {
         user: {...},
         skinProfile?: {...},
         hairProfile?: {...},
         surveyProgress: { basic: true, dermatology: true, trichology: false, clinical: false },
         completionPercent: 60
       }

PUT    /api/profile
       Body: { name?, avatar? }
       Response: { user }

PUT    /api/profile/email
       Body: { newEmail, password }
       Response: { verificationSent: true }

PUT    /api/profile/phone
       Body: { newPhone, password }
       Response: { verificationSent: true }

PUT    /api/profile/password
       Body: { currentPassword, newPassword }
       Response: { success: true }

DELETE /api/profile
       Body: { password, confirmation: "DELETE" }
       Response: { deleted: true }
       Note: Soft delete, данные хранятся 30 дней

GET    /api/profile/export
       Response: { downloadUrl } (JSON файл со всеми данными пользователя)
       Note: 152-ФЗ compliance

GET    /api/profile/system-prompt
       Response: { prompt: string, generatedAt: datetime, version: number }

POST   /api/profile/regenerate-prompt
       Response: { prompt, generatedAt, version }
       Note: Вызывается после изменения опросов
```

### Опросы

```yaml
GET    /api/surveys
       Response: {
         surveys: [
           { type: "BASIC", completed: true, completedAt: "...", canEdit: true },
           { type: "DERMATOLOGY", completed: false, locked: false },
           { type: "TRICHOLOGY", completed: false, locked: false },
           { type: "CLINICAL", completed: false, locked: true, unlockRequirements: ["DERMATOLOGY", "TRICHOLOGY"] }
         ],
         progress: 25
       }

GET    /api/surveys/:type
       Params: type = BASIC | DERMATOLOGY | TRICHOLOGY | CLINICAL
       Response: {
         type,
         version: "1.0",
         questions: [
           {
             id: "q1",
             text: "Как бы вы описали свою кожу?",
             type: "single" | "multiple" | "text" | "slider",
             options?: [{ value: "DRY", label: "Сухая" }, ...],
             required: true
           }
         ],
         currentAnswers?: {...} // если редактирование
       }
       Errors: 403 (locked), 404 (not found)

POST   /api/surveys/:type
       Body: {
         answers: { q1: "DRY", q2: ["ACNE", "DRYNESS"], ... }
       }
       Response: {
         completed: true,
         profile: {...}, // обновленный профиль
         unlockedFeatures: ["personalized_search", "shelf"]
       }
       Errors: 400 (validation)

PUT    /api/surveys/:type
       Body: { answers: {...} }
       Response: { updated: true, profile, promptRegenerated: true }
       Note: Триггерит пересчет оценок на полке

DELETE /api/surveys/:type
       Response: { deleted: true }
       Note: Сбрасывает опрос, нужно проходить заново
       Errors: 403 (cannot delete BASIC if other surveys exist)

GET    /api/surveys/:type/progress
       Response: { answeredQuestions: 3, totalQuestions: 6, savedAnswers: {...} }
       Note: Для восстановления прогресса после выхода
```

### Поиск

```yaml
GET    /api/search
       Query: q, category?, brand?, priceMin?, priceMax?, skinType?, hairType?, page?, limit?
       Headers: Authorization (optional for encyclopedia search)
       Response: {
         results: [
           {
             id, name, brand, imageUrl,
             priceRegular, priceDiscount,
             personalScore?: number, // только для авторизованных с опросами
             personalScoreLoading?: boolean
           }
         ],
         total,
         page,
         hasMore,
         appliedFilters: {...}
       }
       Note: Без опросов personalScore = null

GET    /api/search/suggestions
       Query: q (min 2 chars)
       Response: {
         products: [{ id, name, brand }],
         brands: ["LIBREDERM", ...],
         ingredients: ["Гиалуроновая кислота", ...]
       }

GET    /api/search/popular
       Response: { queries: ["увлажняющий крем", ...], products: [...] }

POST   /api/search/ask
       Body: { query: "Моя подруга посоветовала крем..." }
       Response: {
         answer: "Судя по вашему профилю...",
         relatedProducts: [...],
         alternatives: [...]
       }
       Errors: 403 (surveys required), 429 (rate limit), 503 (LLM unavailable)
       Timeout: 30 sec
       Rate limit: 10 req/min

GET    /api/search/history
       Query: limit?
       Response: { history: [{ id, query, type, createdAt, productId? }] }

DELETE /api/search/history
       Response: { deleted: true }

DELETE /api/search/history/:id
       Response: { deleted: true }
```

### Полка

```yaml
GET    /api/shelf
       Query: status?, category?, sort?, page?, limit?
       Response: {
         items: [
           {
             id, productId, product: {...},
             personalScore, personalComment,
             userNotes, userRating,
             status, addedAt, updatedAt
           }
         ],
         total,
         stats: { total: 5, active: 3, wishlist: 1, finished: 1 }
       }
       Errors: 403 (surveys required)

POST   /api/shelf
       Body: { productId, status?: "ACTIVE" }
       Response: {
         item: {...},
         personalScore, // сразу вычисляется
         personalComment
       }
       Errors: 409 (already on shelf), 404 (product not found)

GET    /api/shelf/:itemId
       Response: { item, product, personalScore, personalComment, shelfAnalysis }

PUT    /api/shelf/:itemId
       Body: { status?, userNotes?, userRating? }
       Response: { item }

DELETE /api/shelf/:itemId
       Response: { deleted: true }

POST   /api/shelf/:itemId/undo-delete
       Note: Доступно 30 секунд после удаления
       Response: { item }

GET    /api/shelf/score
       Response: {
         overallScore: 78,
         breakdown: {
           composition: 82,
           compatibility: 88,
           completeness: 52
         },
         analysis: "Хорошая подборка, но не хватает..."
       }

GET    /api/shelf/recommendations
       Response: {
         replace: [{ item, reason, alternatives: [...] }],
         add: [{ category, reason, suggestions: [...] }],
         conflicts: [{ items: [item1, item2], reason }],
         synergies: [{ items: [...], reason }]
       }

GET    /api/shelf/history
       Query: limit?
       Response: { history: [{ action, itemId, productName, timestamp }] }
```

### Продукты

```yaml
GET    /api/products/:id
       Response: {
         product: {...},
         ingredients: [{ name, inciName, safety, function }], // parsed
         relatedProducts: [...]
       }

GET    /api/products/:id/score
       Response: {
         personalScore: 87,
         scoreBreakdown: {
           skinCompatibility: 92,
           ingredientSafety: 85,
           shelfCompatibility: 90,
           priceValue: 80
         },
         personalComment: "...",
         pros: [...],
         cons: [...],
         shelfAnalysis: { compatible: true, conflicts: [], synergies: [...] }
       }
       Errors: 403 (surveys required)
       Cache: 24 hours, invalidate on profile change

GET    /api/products/:id/ingredients
       Response: {
         raw: "Aqua, Glycerin, ...",
         parsed: [
           { name: "Aqua", inciName: "AQUA", function: "solvent", safety: "safe" },
           ...
         ]
       }

POST   /api/products/:id/report
       Body: { type: "wrong_info" | "missing_info" | "other", description }
       Response: { reported: true }
```

### Энциклопедия

```yaml
GET    /api/encyclopedia/products
       Query: page?, limit?, category?, brand?, search?
       Response: { products: [...], total, page, hasMore }
       Note: Доступно всем, без персонализации

GET    /api/encyclopedia/products/:id
       Response: { product } // без personalScore

GET    /api/encyclopedia/search
       Query: q
       Response: { products: [...], ingredients: [...] }

GET    /api/encyclopedia/categories
       Response: { categories: [{ id, name, count, subcategories: [...] }] }

GET    /api/encyclopedia/brands
       Query: search?
       Response: { brands: [{ name, count, logoUrl? }] }

GET    /api/encyclopedia/filters
       Response: {
         categories: [...],
         brands: [...],
         skinTypes: [...],
         priceRange: { min, max }
       }

GET    /api/encyclopedia/ingredients
       Query: search?, category?, page?, limit?
       Response: { ingredients: [...], total }

GET    /api/encyclopedia/ingredients/:name
       Response: {
         ingredient: {
           name, inciName, description,
           functions, safety, concerns,
           goodFor, badFor, incompatibleWith
         },
         productsWithIngredient: [...]
       }
```

### Тренды

```yaml
GET    /api/trends
       Response: {
         featured: { title, description, products: [...] },
         weekly: [...],
         categories: [{ name, products: [...] }]
       }

GET    /api/trends/personalized
       Response: { trends: [...] } // на основе профиля
       Errors: 403 (surveys required)

GET    /api/trends/weekly
       Response: { products: [...], period: "2026-01-13 - 2026-01-20" }

GET    /api/trends/by-category/:category
       Response: { category, products: [...] }
```

### Уведомления

```yaml
GET    /api/notifications
       Query: unreadOnly?, page?, limit?
       Response: {
         notifications: [
           { id, type, title, body, read, createdAt, data?: {...} }
         ],
         unreadCount
       }

PUT    /api/notifications/:id/read
       Response: { read: true }

PUT    /api/notifications/read-all
       Response: { updated: number }

GET    /api/settings/notifications
       Response: {
         push: true,
         email: true,
         marketing: false,
         productUpdates: true,
         recommendations: true
       }

PUT    /api/settings/notifications
       Body: { push?, email?, marketing?, ... }
       Response: { settings }
```

### Обратная связь

```yaml
POST   /api/feedback
       Body: { type: "bug" | "feature" | "other", message, screenshot? }
       Response: { submitted: true, ticketId }

POST   /api/feedback/product/:id
       Body: { rating: 1-5, comment? }
       Response: { submitted: true }
```

### Health & System

```yaml
GET    /api/health
       Response: { status: "ok", timestamp }

GET    /api/health/detailed
       Response: {
         status: "ok",
         services: {
           database: "ok",
           redis: "ok",
           llm: "ok" | "degraded" | "down"
         },
         version: "2.0.0"
       }
```

---

## 🔒 Rate Limiting

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| `/api/auth/*` | 10 | 1 min |
| `/api/auth/login` | 5 | 1 min |
| `/api/search/ask` | 10 | 1 min |
| `/api/profile/regenerate-prompt` | 5 | 1 min |
| `/api/shelf/*` | 60 | 1 min |
| `/api/encyclopedia/*` | 100 | 1 min |
| Default | 100 | 1 min |

---

## 🎨 UI States (Все состояния)

### Кнопки (Inline Styles)

```javascript
const buttonStyles = {
  primary: {
    base: {
      backgroundColor: '#2D7A4F',
      color: 'white',
      padding: '16px 24px',
      borderRadius: '12px',
      border: 'none',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    hover: {
      backgroundColor: '#246840',
    },
    active: {
      backgroundColor: '#1d5535',
      transform: 'scale(0.98)',
    },
    disabled: {
      backgroundColor: '#A5D6B8',
      cursor: 'not-allowed',
    },
    loading: {
      backgroundColor: '#2D7A4F',
      cursor: 'wait',
    },
  },
  secondary: {
    base: {
      backgroundColor: 'transparent',
      color: '#2D7A4F',
      padding: '16px 24px',
      borderRadius: '12px',
      border: '2px solid #2D7A4F',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
    },
    // ... hover, active, disabled
  },
  ghost: {
    base: {
      backgroundColor: 'transparent',
      color: '#6B6259',
      padding: '12px 16px',
      borderRadius: '8px',
      border: 'none',
      fontSize: '0.875rem',
      cursor: 'pointer',
    },
  },
}
```

### Карточки

```javascript
const cardStyles = {
  product: {
    base: {
      backgroundColor: '#F7F5F3',
      borderRadius: '16px',
      padding: '16px',
      display: 'flex',
      gap: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    hover: {
      backgroundColor: '#EDE9E4',
      transform: 'translateY(-2px)',
    },
    onShelf: {
      border: '2px solid #2D7A4F',
    },
    outOfStock: {
      opacity: 0.6,
    },
  },
  score: {
    excellent: { backgroundColor: '#E8F5EC', color: '#2D7A4F' }, // 85-100
    good: { backgroundColor: '#EDF7ED', color: '#5B9A6F' },      // 70-84
    average: { backgroundColor: '#FEF3C7', color: '#C49234' },    // 50-69
    poor: { backgroundColor: '#FEE2E2', color: '#C45252' },       // 0-49
    loading: { backgroundColor: '#F7F5F3', color: '#6B6259' },
  },
}
```

### Loading States

```javascript
// Skeleton для карточки товара
const SkeletonProduct = () => (
  <div style={cardStyles.product.base}>
    <div style={{ width: 80, height: 80, backgroundColor: '#EDE9E4', borderRadius: 12 }} />
    <div style={{ flex: 1 }}>
      <div style={{ width: '70%', height: 16, backgroundColor: '#EDE9E4', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ width: '40%', height: 14, backgroundColor: '#EDE9E4', borderRadius: 4 }} />
    </div>
  </div>
)

// Spinner для LLM
const LLMSpinner = () => (
  <div style={{ textAlign: 'center', padding: 24 }}>
    <div style={{ /* animated spinner */ }} />
    <p style={{ color: '#6B6259', marginTop: 12 }}>Анализирую...</p>
    <p style={{ color: '#8C8177', fontSize: '0.75rem' }}>Это может занять до 15 секунд</p>
  </div>
)
```

### Empty States

```javascript
const emptyStates = {
  shelf: {
    icon: '📦',
    title: 'Полка пуста',
    description: 'Добавьте первый товар, чтобы получить персональные рекомендации',
    action: { text: 'Найти товар', href: '/app/search' },
  },
  search: {
    icon: '🔍',
    title: 'Ничего не найдено',
    description: 'Попробуйте изменить запрос или фильтры',
    action: { text: 'Сбросить фильтры', onClick: () => {} },
  },
  searchHistory: {
    icon: '🕐',
    title: 'История пуста',
    description: 'Ваши поиски будут отображаться здесь',
  },
}
```

### Error States

```javascript
const errorStates = {
  network: {
    icon: '📡',
    title: 'Нет подключения',
    description: 'Проверьте интернет-соединение',
    action: { text: 'Повторить', onClick: retry },
  },
  llmUnavailable: {
    icon: '🤖',
    title: 'Сервис временно недоступен',
    description: 'Персональные рекомендации временно недоступны. Попробуйте позже.',
    fallback: 'Показываем общую информацию',
  },
  generic: {
    icon: '😔',
    title: 'Что-то пошло не так',
    description: 'Попробуйте обновить страницу',
    action: { text: 'Обновить', onClick: () => window.location.reload() },
  },
}
```

---

## ⚠️ Edge Cases

### Опросы
1. **Выход посреди опроса** → Сохранять прогресс в localStorage + API
2. **Изменение вопросов** → Версионирование опросов, миграция ответов
3. **Одновременно с двух устройств** → Last-write-wins + уведомление

### Поиск
4. **Query > 500 символов** → Обрезать + предупреждение
5. **Спецсимволы в запросе** → Санитизация
6. **Пустой результат** → Empty state + предложения

### LLM
7. **Timeout (>30 сек)** → Retry 1 раз, потом fallback
8. **Невалидный JSON** → Fallback на базовый ответ
9. **Галлюцинация** → Валидация productId перед показом
10. **Rate limit exceeded** → Показать сообщение + cooldown timer

### Полка
11. **Товар удален из базы** → Показывать с пометкой "Товар недоступен"
12. **Двойное добавление** → Unique constraint + toast "Уже на полке"
13. **Изменение профиля** → Фоновый пересчет оценок + уведомление

### Профиль
14. **Смена email** → Верификация нового
15. **Удаление аккаунта** → 30 дней на восстановление

---

## 📊 Метрики

### Ключевые KPI

| Метрика | MVP Target | 6 мес Target |
|---------|------------|--------------|
| WAU | 1,000 | 50,000 |
| Conversion to registration | 15% | 25% |
| Survey completion (basic) | 70% | 85% |
| Survey completion (full) | 30% | 50% |
| Products on shelf (avg) | 2 | 5 |
| DAU/WAU | 20% | 35% |
| LLM questions/user/week | 3 | 8 |

### Tracking Events

```javascript
const events = {
  // Auth
  'auth.register_started': {},
  'auth.register_completed': { method: 'email' | 'phone' | 'oauth' },
  'auth.login': { method },
  'auth.logout': {},
  
  // Surveys
  'survey.started': { type: 'BASIC' | 'DERMATOLOGY' | ... },
  'survey.question_answered': { type, questionId },
  'survey.abandoned': { type, progress },
  'survey.completed': { type, duration },
  
  // Search
  'search.query': { query, resultsCount },
  'search.filter_applied': { filter, value },
  'search.product_clicked': { productId, position },
  'search.llm_asked': { query },
  'search.llm_response_received': { duration },
  
  // Shelf
  'shelf.product_added': { productId, source },
  'shelf.product_removed': { productId },
  'shelf.status_changed': { productId, from, to },
  
  // Product
  'product.viewed': { productId, source },
  'product.score_viewed': { productId, score },
}
```

---

## 🚀 Launch Checklist

### Pre-Launch

- [ ] Все API endpoints реализованы и протестированы
- [ ] Rate limiting настроен
- [ ] Error handling на всех уровнях
- [ ] Логирование настроено
- [ ] Мониторинг (Sentry) подключен
- [ ] Analytics events отправляются
- [ ] 152-ФЗ compliance (политика, согласия, экспорт данных)
- [ ] Дисклеймеры на всех экранах с рекомендациями
- [ ] База товаров загружена (минимум 2 для теста)
- [ ] LLM интеграция работает + fallback
- [ ] Все опросы созданы с вопросами
- [ ] Email/SMS отправка работает

### Launch

- [ ] DNS настроен
- [ ] SSL сертификат
- [ ] Backup настроен
- [ ] Rollback план готов

---

**Версия:** 2.0 FINAL  
**Дата:** 20 января 2026  
**Статус:** Production-Ready
