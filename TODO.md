# 📋 BeautyScore TODO

> **Детальный план реализации:** см. `IMPLEMENTATION_PLAN.md`

## ⚠️ СТРОГИЕ ПРАВИЛА

### Стили: ТОЛЬКО Inline Styles!
```tsx
// ✅ ПРАВИЛЬНО
<button style={{ backgroundColor: '#2D7A4F', color: 'white' }}>

// ❌ НЕПРАВИЛЬНО — НЕ ИСПОЛЬЗОВАТЬ!
<button className="bg-green-600 text-white">
```

> **Tech Debt:** В `components/ui/` и `components/landing/` есть 72 использования className.
> Это нужно будет переписать, но не блокирует MVP.

---

## 🚨 КРИТИЧЕСКАЯ ЗАДАЧА: Интеграция Frontend с Backend

### Проблема
Frontend использует MOCK данные вместо реального API. Backend готов на 100%, но не подключён.

### Приоритет выполнения

```
1. Инфраструктура (30 мин)       → .env, Docker, Seed
2. Backend (2-3 часа)            → Logging, LLM, Services  
3. Frontend интеграция (4-5 ч)   → Hooks, Pages, API
4. Новые страницы (2-3 часа)     → Search, Notifications, Settings
5. Compliance (1 час)            → Disclaimers, Analytics
6A. Unit Tests (2-3 часа)        → Backend + Frontend
6B. Integration Tests (3-4 часа) → API + DB + LLM
7. E2E Tests (3-4 часа)          → Playwright user flows
```

**Итого: 18-24 часа с полным покрытием тестами**

---

## 🔧 ФАЗА 1: Инфраструктура

### Environment Setup
- [ ] Создать `apps/api/.env` с YandexGPT ключами
- [ ] Создать `apps/web/.env.local` с API_URL
- [ ] Проверить Docker compose (PostgreSQL:5433 + Redis:6379)

### Database
- [ ] `npx prisma migrate dev`
- [ ] `npx prisma db seed` (2 товара + 4 ингредиента)
- [ ] Проверить: `SELECT COUNT(*) FROM products;` → должно быть 2

---

## 🔧 ФАЗА 2: Backend

### Logging
- [ ] Создать `logging.interceptor.ts`
- [ ] Подключить в `app.module.ts`
- [ ] Проверить логи в консоли

### YandexGPT
- [x] ~~Обновить `yandexgpt.provider.ts` с реальным ключом~~ — ИСПРАВЛЕН БАГ: YANDEX_FOLDER_ID → YANDEX_GPT_FOLDER_ID
- [ ] Тест: вызвать LLM и получить ответ
- [ ] Проверить fallback при ошибке

### 🤖 LLM Функции (справка):
| Функция | API | Описание | Timeout |
|---------|-----|----------|---------|
| `analyzeProduct()` | GET `/products/:id/score` | Персональная оценка товара | 30 сек |
| `analyzeShelf()` | GET `/shelf/score` | Анализ всей полки | 30 сек |
| `askAboutProduct()` | POST `/search/ask` | Свободный вопрос | 30 сек |

### Products Service
- [ ] Добавить `getProductWithScore()` метод
- [ ] Генерация systemPrompt из профиля пользователя
- [ ] Кеширование LLM ответов в Redis

### Shelf Service
- [ ] Добавить `logShelfAction()` для audit_logs
- [ ] Проверить soft delete работает

---

## 🔧 ФАЗА 3: Frontend Integration

### API Hooks
- [ ] Создать `lib/api/hooks.ts`
- [ ] `useShelf()` hook
- [ ] `useProduct(id)` hook
- [ ] `useTrends()` hook
- [ ] `useSearch(query)` hook

### Shelf Page (`/app/shelf`)
- [ ] Заменить `savedProducts` на `api.get('/shelf')`
- [ ] Добавить loading skeleton
- [ ] Добавить error state с retry
- [ ] Подключить `api.delete('/shelf/:id')`
- [ ] Добавить toast с undo (30 сек!)

### Product Page (`/app/product/[id]`)
- [ ] Заменить `mockProducts` на `api.get('/products/:id')`
- [ ] Добавить `api.get('/products/:id/score')` для LLM
- [ ] Loading state для LLM (до 15 сек)
- [ ] Кнопка "Добавить на полку" → `api.post('/shelf')`
- [ ] Toast "Добавлено" / "Уже на полке"

### Main Page (`/app`)
- [ ] Заменить `mockRecentScans` на реальные данные
- [ ] Интеграция поиска с `/api/search`
- [ ] Подключить историю сканов

### Layout Navigation
- [ ] Исправить путь Тренды: `/app/discover` → `/app/trends`
- [ ] Проверить active state для вложенных путей

### Profile Page
- [ ] Исправить menuItems href (убрать '#')
- [ ] Добавить ссылки на реальные страницы

---

## 🔧 ФАЗА 4: Новые Страницы

### `/app/trends` (вместо /app/discover)
- [ ] Создать новый файл (или переименовать)
- [ ] Интеграция с `/api/trends`
- [ ] Персонализированные тренды для залогиненных

### `/app/search`
- [ ] Создать страницу результатов поиска
- [ ] Query params: `?q=...&category=...`
- [ ] Пагинация / infinite scroll
- [ ] Фильтры (категория, бренд, цена)

### `/app/notifications`
- [ ] Список уведомлений из `/api/notifications`
- [ ] Mark as read
- [ ] Badge в навигации

### `/app/settings`
- [ ] Настройки уведомлений
- [ ] Link на Privacy policy
- [ ] Язык (если будет)

### `/app/product/[id]/chat`
- [ ] LLM чат интерфейс
- [ ] `POST /api/search/ask`
- [ ] История сообщений в session
- [ ] Loading indicator (до 30 сек)

---

## ~~🔧 ФАЗА 5: Гостевой режим~~ — ОТЛОЖЕНО

> **РЕШЕНИЕ:** Для MVP убираем гостевой режим. Причины:
> 1. Добавляет сложность (проверки на каждой странице)
> 2. Легко добавить позже
> 3. MVP фокус = полный рабочий flow
>
> **Вместо этого:** Просто redirect на `/login` для неавторизованных

---

## 🔧 ФАЗА 5: Compliance и Analytics (из PRD!)

### 152-ФЗ Compliance
- [ ] `GET /api/profile/export` — экспорт всех данных пользователя
- [ ] `DELETE /api/profile` — мягкое удаление (30 дней на восстановление)
- [ ] Дисклеймеры на экранах с рекомендациями
- [ ] Согласия при регистрации (обработка ПД, рассылка)

### Analytics Events (важно для метрик!)
```typescript
// Основные события для отслеживания:
'auth.register_completed'
'survey.completed'
'search.query'
'shelf.product_added'
'product.viewed'
```

---

## 🧪 ФАЗА 6A: Unit Tests (2-3 часа)

### Backend Unit Tests (Jest)
- [ ] `llm/llm.service.spec.ts` — fallback, caching, prompts
- [ ] `llm/prompts.spec.ts` — generateSystemPrompt
- [ ] `products/products.service.spec.ts` — getProductWithScore
- [ ] `shelf/shelf.service.spec.ts` — add, delete, undo (30 сек!)
- [ ] `auth/auth.service.spec.ts` — tokens, validation
- [ ] `surveys/surveys.service.spec.ts` — submit, update

### Frontend Unit Tests (Vitest)
- [ ] `lib/api/hooks.test.ts` — useShelf, useProduct, useTrends
- [ ] `lib/api/client.test.ts` — refresh token, error handling
- [ ] `components/ui/*.test.tsx` — Button, Toast, Skeleton

---

## 🧪 ФАЗА 6B: Integration Tests (3-4 часа)

### API Tests (Supertest)
- [ ] Auth endpoints: register, login, refresh, verify
- [ ] Shelf endpoints: add, delete, undo, score
- [ ] Products endpoints: get, score (LLM)
- [ ] Search endpoints: query, ask (LLM)
- [ ] Surveys endpoints: get, submit, update

### Database Tests
- [ ] User CRUD с каскадным удалением
- [ ] AuditLog записывается корректно
- [ ] Soft delete работает

### LLM Integration Tests
- [ ] YandexGPT API вызов успешен
- [ ] Timeout 30 сек обрабатывается
- [ ] Fallback при ошибке
- [ ] Кеширование в Redis работает
- [ ] Невалидный JSON обрабатывается

---

## 🧪 ФАЗА 7: E2E Tests (3-4 часа)

### User Flows (Playwright)
- [ ] Flow 1: Регистрация нового пользователя
- [ ] Flow 2: Вход существующего пользователя
- [ ] Flow 3: Прохождение опросов (Basic → Dermatology → Trichology)
- [ ] Flow 4: Поиск товара
- [ ] Flow 5: Просмотр товара + LLM оценка (до 15 сек)
- [ ] Flow 6: Добавление на полку
- [ ] Flow 7: Удаление с полки + undo (30 сек!)
- [ ] Flow 8: Просмотр профиля
- [ ] Flow 9: Редактирование опросов (с пересчётом оценок!)
- [ ] Flow 10: Выход из системы

### Error States (E2E)
- [ ] Network error → показать ErrorState
- [ ] 401 → redirect на login
- [ ] 500 → user-friendly сообщение
- [ ] LLM timeout → fallback message

### Edge Cases (из PRD - важно!)
- [ ] Выход посреди опроса → сохранять прогресс
- [ ] Query > 500 символов → обрезать + предупреждение
- [ ] LLM Timeout (>30 сек) → retry 1 раз, потом fallback
- [ ] LLM невалидный JSON → fallback на базовый ответ
- [ ] Товар удален из базы → "Товар недоступен"
- [ ] Двойное добавление на полку → 409 + toast "Уже на полке"
- [ ] Изменение профиля → фоновый пересчет оценок

---

## ✅ Выполнено ранее

- [x] Backend API (84/84 endpoints)
- [x] Prisma schema
- [x] Auth flow (register, login, OAuth)
- [x] Surveys backend (6 endpoints)
- [x] Encyclopedia (единственная интегрированная страница!)
- [x] LLM Service структура
- [x] UI компоненты (Toast, Skeleton, EmptyState, ErrorState)
- [x] PWA setup (manifest, icons)

---

## 📝 Известные проблемы

### Schema Drift
**Описание:** Prisma схема может не совпадать с БД после изменений.

**Профилактика:**
```bash
# После изменения schema.prisma:
npx prisma migrate dev --name describe_change
```

### Mock Data Removal
При замене mock на API нужно:
1. Удалить const с mock данными
2. Добавить useState + useEffect для загрузки
3. Добавить loading/error states
4. Проверить типы (interface должны совпадать с API response)

---

## 🚀 Quick Start

```bash
# Terminal 1: Docker
cd beautyscore
docker-compose up -d

# Terminal 2: Backend
cd apps/api
npx prisma migrate dev
npx prisma db seed
pnpm dev

# Terminal 3: Frontend
cd apps/web
pnpm dev

# Browser
open http://localhost:3000
```

---

## 📊 Прогресс

| Фаза | Статус | Прогресс |
|------|--------|----------|
| 1. Инфраструктура | ⏳ | 0% |
| 2. Backend | ⏳ | 0% |
| 3. Frontend Integration | ⏳ | 0% |
| 4. Новые страницы | ⏳ | 0% |
| 5. Compliance | ⏳ | 0% |
| 6A. Unit Tests | ⏳ | 0% |
| 6B. Integration Tests | ⏳ | 0% |
| 7. E2E Tests | ⏳ | 0% |
| **ИТОГО** | ⏳ | **0%** |

### Покрытие тестами (цель)

| Тип | Количество | Покрытие |
|-----|------------|----------|
| Unit (Backend) | ~40-50 | 70% |
| Unit (Frontend) | ~20-30 | 60% |
| Integration | ~30-40 | 25% |
| E2E | ~15-20 | 100% flows |
| **ИТОГО** | **~100-140** | **~85%** |

---

## ⚠️ Важные сроки по PRD

| Функция | Время |
|---------|-------|
| Undo удаления с полки | **30 секунд** |
| LLM score timeout | **15 секунд** |
| LLM ask timeout | **30 секунд** |
| Код верификации | **5 минут** |
| Resend код | **60 секунд** между попытками |
| Soft delete аккаунта | **30 дней** на восстановление |

---

*Последнее обновление: 21 января 2026*
