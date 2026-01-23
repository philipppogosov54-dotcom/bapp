# Итоговая конфигурация проекта BeautyScore

**Дата обновления:** 17 января 2026
**Статус:** ✅ Готов к полному тестированию

---

## 🎨 Дизайн-система (Полностью переработана)

### Цветовая палитра
- **Primary (Зелёный):** `#2D7A4F`
  - Используется везде: кнопки, границы, ссылки, акценты
  - Tailwind: `primary-500`, `primary-600`
- **Фоны:**
  - Основной: `#FDFCFB`
  - Input поля: `#F7F5F3` (тёплый бежевый)
  - Активные input: `#FDFCFB` (чуть светлее)
- **Текст:**
  - Основной: `#1A1714`
  - Вторичный: `#6B6259`
  - Третичный: `#8C8177`

### UI Компоненты (С inline-стилями)

#### 1. Input ([components/ui/input.tsx](beautyscore/apps/web/components/ui/input.tsx))
```tsx
- Фон: #F7F5F3 (видимый бежевый)
- При фокусе: #FDFCFB + граница #2D7A4F
- Высота: 52px
- Border-radius: 14px
```

#### 2. Button ([components/ui/button.tsx](beautyscore/apps/web/components/ui/button.tsx))
```tsx
- Primary: bg #2D7A4F, text white
- Secondary: bg #F7F5F3, text #1A1714
- Outline: transparent bg, border #2D7A4F
- Ghost: transparent bg, text #6B6259
```

#### 3. PhoneInput ([components/auth/phone-input.tsx](beautyscore/apps/web/components/auth/phone-input.tsx))
- Флаг России (триколор)
- Маска: +7 (999) 123-45-67
- Те же стили что у Input

#### 4. CodeInput ([components/auth/code-input.tsx](beautyscore/apps/web/components/auth/code-input.tsx))
- 6 ячеек по 48px
- Фон #F7F5F3
- Активная ячейка: зелёная граница + тень

#### 5. RadioGroup ([components/ui/radio-group.tsx](beautyscore/apps/web/components/ui/radio-group.tsx))
- Cards вариант с фоном #F7F5F3
- Выбранный: #E8F5EC фон, #2D7A4F граница
- Чекмарк: зелёный кружок

#### 6. CheckboxGroup ([components/ui/checkbox-group.tsx](beautyscore/apps/web/components/ui/checkbox-group.tsx))
- Аналогично RadioGroup
- Поддержка множественного выбора

---

## 🏗️ Layouts

### SplitLayout ([components/layouts/split-layout.tsx](beautyscore/apps/web/components/layouts/split-layout.tsx))

**Desktop (≥1024px):**
- 50/50 split
- Левая панель: белая (#FDFCFB), форма
- Правая панель: тёмная (градиент #1A1714-#2A2520), декоративная

**Mobile (<1024px):**
- Только левая панель (форма)
- Лёгкий градиент на фоне
- Правая панель скрыта

**Лого:**
- Иконка 🧴 в зелёном квадрате (#E8F5EC)
- Текст: Beauty[Score] (Score зелёный)

**Правая панель:**
- Плавающая иконка с анимацией
- Заголовок + подзаголовок
- 3 карточки фич с иконками

**Используется для:**
- Login ([app/(auth)/login/page.tsx](beautyscore/apps/web/app/(auth)/login/page.tsx))
- Register ([app/(auth)/register/page.tsx](beautyscore/apps/web/app/(auth)/register/page.tsx))
- Phone Login ([app/(auth)/phone-login/page.tsx](beautyscore/apps/web/app/(auth)/phone-login/page.tsx))

---

## 📱 Страницы

### Auth страницы (inline-стили)

1. **Login** - email/пароль + OAuth кнопки
2. **Register** - имя/email/пароль/confirm + соглашение
3. **Phone Login** - двухшаговая (телефон → код)

### Onboarding

1. **Welcome** ([app/onboarding/welcome/page.tsx](beautyscore/apps/web/app/onboarding/welcome/page.tsx))
   - Standalone страница (не использует SplitLayout)
   - Центрированная карточка
   - 4 карточки преимуществ
   - Кнопка "Начать настройку"

2. **Wizard** ([app/onboarding/page.tsx](beautyscore/apps/web/app/onboarding/page.tsx))
   - 5 шагов с прогресс-баром
   - Использует RadioGroup/CheckboxGroup
   - Inline-стили

---

## 🗄️ База данных

### Статус
✅ **Полностью очищена и мигрирована**

### Команда для сброса
```bash
cd beautyscore/apps/api
npx prisma migrate reset --force
```

### Миграции
1. `20260117105608_init` - начальная схема
2. `20260117115140_add_gender_dob_allergies_onboarding` - поля онбординга

---

## 🚀 Серверы

### API (NestJS)
- **URL:** http://localhost:3001
- **Команда:**
```bash
cd beautyscore/apps/api
export YANDEX_CLIENT_ID=6021072f0df3442786032804c46fe2f4
export YANDEX_CLIENT_SECRET=e2800e2f452d44ff9efb8c5ffa95154b
export YANDEX_CALLBACK_URL=http://localhost:3001/api/auth/yandex/callback
export TELEGRAM_BOT_TOKEN=8277716371:AAGkXSDc0kVYKuOqUOsUsIryr_1avqcpUZw
export TELEGRAM_BOT_USERNAME=beautydsoifmsdklbot
export FRONTEND_URL=http://localhost:3000
export CORS_ORIGIN=http://localhost:3000
pnpm dev
```

### Web (Next.js)
- **URL:** http://localhost:3000
- **Команда:**
```bash
cd beautyscore/apps/web
pnpm dev
```

---

## ✅ Что исправлено

1. ✅ Унифицированы цвета (#2D7A4F везде)
2. ✅ Input поля с видимым фоном (#F7F5F3)
3. ✅ Все UI компоненты с inline-стилями
4. ✅ SplitLayout переписан без Tailwind классов
5. ✅ Красивый лого с иконкой
6. ✅ Правая панель с inline-стилями
7. ✅ Мобильная вёрстка через useEffect
8. ✅ Auth страницы согласованы
9. ✅ Onboarding страницы обновлены
10. ✅ БД сброшена и готова к тестированию

---

## 🧪 Тестирование

### Готово к тестированию:
- [x] Лендинг
- [x] Регистрация (email)
- [x] Вход (email)
- [x] Вход (телефон)
- [x] OAuth (VK, Яндекс, Telegram)
- [x] Onboarding Welcome
- [x] Onboarding Wizard
- [x] Мобильные версии всех страниц

### Рекомендуемый порядок тестирования:
1. Регистрация нового пользователя (email)
2. Онбординг (5 шагов)
3. Выход и повторный вход
4. Регистрация через телефон
5. OAuth провайдеры (если настроены)

---

## 📝 Заметки

- Все изменения применены
- Серверы запущены и работают
- БД чистая, готова к тестированию
- Никаких ошибок линтера
- Проверены desktop и mobile версии
