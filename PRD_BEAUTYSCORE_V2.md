# 📋 PRD: BeautyScore v2.0
# Гиперперсонализированная платформа ухода за кожей и волосами

**Версия:** 2.0  
**Дата:** 20 января 2026  
**Статус:** В разработке  
**Платформа:** PWA (Progressive Web Application)

---

## 📌 Executive Summary

### Миссия
BeautyScore — это **гиперперсонализированная** платформа, которая помогает пользователям понять, какие косметические средства **подходят именно им**, на основе их уникального профиля кожи, волос и здоровья.

### Ключевое Отличие
> "Это будет самое гиперперсонализированное приложение в мире. Так не сделало ни у одного компетитора."

| Конкуренты | BeautyScore |
|------------|-------------|
| Универсальная оценка "вредности" | **Персональная оценка "подходит ли МНЕ"** |
| Одинаковый результат для всех | **Уникальный результат для каждого пользователя** |
| Статичные описания | **LLM-генерируемые персональные рекомендации** |

### Бизнес-модель
- **Всё бесплатно** на старте (сбор аудитории)
- Монетизация позже: подписка, данные, реклама, интеграции с маркетплейсами

---

## 🏗️ Архитектура Приложения

### Навигационная Структура (5 разделов)

```
┌────────────────────────────────────────────────────────────────────────┐
│                              WELCOME                                    │
│                    (Базовый опрос при первом входе)                    │
│                              ▼                                         │
│              ОБЯЗАТЕЛЬНЫЕ ОПРОСЫ → Системный Промпт                    │
└────────────────────────────────────────────────────────────────────────┘
                                   │
    ┌──────────────────────────────┼──────────────────────────────┐
    ▼                              ▼                              ▼
┌──────────┐                ┌──────────────┐               ┌──────────────┐
│  ПОИСК   │                │  МОЯ ПОЛКА   │               │ ЭНЦИКЛОПЕДИЯ │
│          │                │    (БАЗА)    │               │              │
│ Персонал.│◄──────────────►│ Персонал.    │               │ Без персонал.│
│ рекоменд.│   Системный    │ оценки       │               │ Общие данные │
│          │    промпт      │              │               │              │
└──────────┘                └──────────────┘               └──────────────┘
    ▲                              ▲                              
    │        ┌─────────────────────┴─────────────────────┐       
    │        ▼                                           ▼       
┌──────────────┐                                  ┌──────────────┐
│  ТРЕНДЫ β   │                                  │   ПРОФИЛЬ    │
│              │                                  │              │
│ Соц.данные  │◄─────────────────────────────────│ Опросы       │
│ От юзеров   │         Данные профиля           │ Сист. промпт │
└──────────────┘                                  └──────────────┘
```

### Bottom Navigation

```
┌────────┬────────────┬──────────────┬──────────┬──────────┐
│ 🔍     │  📦        │  📚         │  📈      │  👤      │
│ Поиск  │  Полка     │ Энциклопед. │ Тренды β │ Профиль  │
└────────┴────────────┴──────────────┴──────────┴──────────┘
```

---

## 🔐 Система Доступа (Критическая логика)

### Матрица Доступа

| Функция | Без опросов | После базового | После дерматологии | После трихологии | Полный профиль |
|---------|-------------|----------------|-------------------|------------------|----------------|
| **Энциклопедия** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Поиск по энциклопедии** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Персональный поиск** | ❌ | ⚠️ базовый | ✅ кожа | ✅ волосы | ✅ полный |
| **Моя полка** | ❌ | ⚠️ базовый | ✅ кожа | ✅ волосы | ✅ полный |
| **Рекомендации** | ❌ | ⚠️ базовые | ✅ кожа | ✅ волосы | ✅ полные |
| **Тренды** | ✅ (общие) | ✅ | ✅ (персонал.) | ✅ (персонал.) | ✅ (персонал.) |

### Сообщения Блокировки

```
БЕЗ ОПРОСОВ:
┌─────────────────────────────────────────────────────────┐
│  🔒 Персональные рекомендации недоступны                │
│                                                         │
│  Мы заботимся о вашем здоровье.                        │
│  Чтобы давать точные рекомендации, нам нужно           │
│  узнать о вас больше.                                  │
│                                                         │
│  [Пройти опрос — 3 минуты]                             │
│                                                         │
│  Пока вы можете искать в энциклопедии →                │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Система Опросов

### Структура Опросов

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           WELCOME                                        │
│                    Базовый опрос (обязательный)                         │
│                         ~2 минуты                                       │
│                                                                         │
│  Собирает: пол, возраст, базовые предпочтения                          │
│  Открывает: базовый доступ к поиску и полке                            │
└─────────────────────────────────────────────────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    ▼                              ▼
┌─────────────────────────────┐    ┌─────────────────────────────┐
│       ДЕРМАТОЛОГИЯ          │    │        ТРИХОЛОГИЯ           │
│     ~3-5 минут              │    │      ~3-5 минут             │
│                             │    │                             │
│  Тип кожи                   │    │  Тип волос                  │
│  Проблемы кожи              │    │  Проблемы волос             │
│  Чувствительность           │    │  Частота мытья              │
│  Реакции на ингредиенты     │    │  Реакции на средства        │
│                             │    │                             │
│  Открывает:                 │    │  Открывает:                 │
│  • Рекоменд. по уходу кожи  │    │  • Рекоменд. по уходу волос │
│  • Оценку средств для кожи  │    │  • Оценку средств для волос │
└─────────────────────────────┘    └─────────────────────────────┘
                    │                              │
                    └──────────────┬──────────────┘
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          КЛИНИЧЕСКИЙ                                     │
│                    (опциональный, для 90%+ точности)                    │
│                         ~5-10 минут                                     │
│                                                                         │
│  Медицинские данные, хронические заболевания, анализы                  │
│  Открывает: максимальную персонализацию                                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Опрос: БАЗОВЫЙ (Welcome)

| # | Вопрос | Тип | Варианты |
|---|--------|-----|----------|
| 1 | Ваш пол | Single | Женский, Мужской, Другой |
| 2 | Ваш возраст | Single | 16-24, 25-34, 35-44, 45-54, 55+ |
| 3 | Что вас больше интересует? | Multiple | Уход за кожей, Уход за волосами, Макияж |
| 4 | Есть ли у вас аллергии на косметику? | Single | Да, Нет, Не знаю |
| 5 | Если да, на что? | Text | Свободный ввод |

### Опрос: ДЕРМАТОЛОГИЯ

| # | Вопрос | Тип | Варианты |
|---|--------|-----|----------|
| 1 | Как бы вы описали свою кожу? | Single | Сухая, Жирная, Комбинированная, Нормальная, Чувствительная |
| 2 | Какие проблемы кожи вас беспокоят? | Multiple | Акне, Сухость, Жирный блеск, Покраснения, Пигментация, Морщины, Расширенные поры, Тусклость |
| 3 | Как кожа реагирует на новые средства? | Single | Хорошо переносит, Иногда раздражение, Часто раздражение |
| 4 | Есть ли у вас диагностированные заболевания кожи? | Multiple | Нет, Розацеа, Экзема, Псориаз, Атопический дерматит, Другое |
| 5 | Используете ли вы SPF ежедневно? | Single | Да, Нет, Иногда |
| 6 | Какие активные ингредиенты вы уже используете? | Multiple | Ретинол, Витамин C, Ниацинамид, Кислоты (AHA/BHA), Пептиды, Не знаю, Никакие |

### Опрос: ТРИХОЛОГИЯ

| # | Вопрос | Тип | Варианты |
|---|--------|-----|----------|
| 1 | Тип ваших волос | Single | Прямые, Волнистые, Кудрявые, Очень кудрявые |
| 2 | Толщина волос | Single | Тонкие, Средние, Толстые |
| 3 | Состояние кожи головы | Single | Нормальная, Сухая, Жирная, Чувствительная |
| 4 | Какие проблемы волос вас беспокоят? | Multiple | Выпадение, Сухость, Жирность, Перхоть, Секущиеся кончики, Тусклость, Ломкость |
| 5 | Окрашены ли волосы? | Single | Да, Нет, Частично |
| 6 | Как часто моете голову? | Single | Каждый день, Через день, 2-3 раза в неделю, Раз в неделю, Реже |

---

## 🧠 Системный Промпт (Ядро Персонализации)

### Формирование Промпта

```
СИСТЕМНЫЙ ПРОМПТ = f(базовый_опрос, дерматология, трихология, клинический, полка)
```

### Шаблон Системного Промпта

```python
SYSTEM_PROMPT_TEMPLATE = """
Ты — топ-левел консультант в дерматологии, трихологии и косметике.
К тебе пришёл клиент со следующим профилем:

## БАЗОВЫЕ ДАННЫЕ
- Пол: {gender}
- Возраст: {age_group}
- Основной интерес: {interests}
- Известные аллергии: {allergies}

## ПРОФИЛЬ КОЖИ (если заполнен)
- Тип кожи: {skin_type}
- Проблемы: {skin_problems}
- Чувствительность: {skin_sensitivity}
- Заболевания: {skin_conditions}
- Используемые активы: {current_actives}

## ПРОФИЛЬ ВОЛОС (если заполнен)
- Тип волос: {hair_type}
- Толщина: {hair_thickness}
- Кожа головы: {scalp_condition}
- Проблемы: {hair_problems}
- Окрашивание: {hair_colored}

## ТЕКУЩИЕ СРЕДСТВА (полка)
{shelf_products_with_ingredients}

## ТВОИ ЗАДАЧИ
1. Оценивай совместимость каждого нового товара с профилем клиента
2. Учитывай взаимодействие с текущими средствами на полке
3. Давай персонализированные рекомендации
4. Предупреждай о потенциальных рисках и конфликтах ингредиентов
5. Объясняй простым языком, почему что-то подходит или не подходит

## ФОРМАТ ОТВЕТА
- Персональная оценка: 0-100 (где 100 = идеально подходит)
- Краткое объяснение (2-3 предложения)
- Ключевые плюсы для этого пользователя
- Возможные минусы/предупреждения
- Совместимость с полкой
"""
```

### Пример Сгенерированного Промпта

```
Клиент: Женщина, 28 лет
Кожа: Комбинированная, проблемы — акне, расширенные поры
Используемые активы: Ниацинамид, Салициловая кислота
Полка: CeraVe SA Cleanser, The Ordinary Niacinamide 10%

Товар для анализа: LIBREDERM Гиалуроновый ночной крем
Ингредиенты: Aqua, Hyaluronic Acid, Ceramide NP, Ceramide AP...

→ LLM анализирует и выдаёт персональную оценку
```

---

## 🗄️ База Данных

### Структура Товара (из Золотого Яблока)

```json
{
  "item_id": "19760305104",
  "url": "https://goldapple.ru/...",
  "name": "hyaluronic ultra-moisturizing",
  "brand": "LIBREDERM",
  "product_type": "Ультраувлажняющий ночной крем для сухой кожи лица",
  "category": "уход > уход для лица > увлажнение и питание",
  
  "description": "Крем восстанавливает липидный барьер...",
  "how_to_use": "Ежедневно вечером за час до сна...",
  
  "inci": "Aqua, C12-20 Acid Peg-8 Ester, Ricinus Communis Seed Oil...",
  
  "attributes_json": {
    "тип продукта": "крем для лица",
    "для кого": "универсально",
    "назначение": "увлажнение, восстановление",
    "тип кожи": "для сухой кожи",
    "область применения": "лицо",
    "объём": "50 мл"
  },
  
  "attr_skin_type": "для сухой кожи",
  "attr_purpose": "увлажнение, восстановление",
  
  "price_regular": 1072,
  "price_discount": 761,
  "discount_percent": 29,
  
  "image_url": "https://pcdn.goldapple.ru/...",
  "country": "Россия",
  
  "in_stock": true,
  "parsed_at": "2026-01-15T16:44:38.532251"
}
```

### Prisma Schema

```prisma
// ============================================
// USER & AUTHENTICATION
// ============================================

model User {
  id            String    @id @default(cuid())
  
  // Auth
  email         String?   @unique
  phone         String?   @unique
  passwordHash  String?
  
  // OAuth
  vkId          String?   @unique
  yandexId      String?   @unique
  telegramId    String?   @unique
  
  // Profile (базовые)
  name          String?
  avatar        String?
  gender        Gender?
  ageGroup      AgeGroup?
  interests     Interest[]
  
  // Allergies
  hasAllergies  Boolean   @default(false)
  allergies     String[]
  
  // Survey completion flags
  hasBasicSurvey       Boolean @default(false)
  hasDermatologySurvey Boolean @default(false)
  hasTrichologySurvey  Boolean @default(false)
  hasClinicalSurvey    Boolean @default(false)
  
  // Computed system prompt (cached)
  systemPrompt         String?   @db.Text
  systemPromptUpdatedAt DateTime?
  
  // Relations
  surveys       Survey[]
  skinProfile   SkinProfile?
  hairProfile   HairProfile?
  shelf         ShelfItem[]
  searchHistory SearchHistory[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@map("users")
}

// ============================================
// SURVEYS
// ============================================

model Survey {
  id        String     @id @default(cuid())
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  type      SurveyType
  answers   Json       // All answers as JSON
  
  completedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, type])
  @@map("surveys")
}

enum SurveyType {
  BASIC
  DERMATOLOGY
  TRICHOLOGY
  CLINICAL
}

// ============================================
// PROFILES (derived from surveys)
// ============================================

model SkinProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  skinType           SkinType
  problems           SkinProblem[]
  sensitivity        SensitivityLevel
  conditions         String[]          // Diagnosed conditions
  currentActives     String[]          // Currently used actives
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("skin_profiles")
}

model HairProfile {
  id        String   @id @default(cuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  hairType           HairType
  hairThickness      HairThickness
  scalpCondition     ScalpCondition
  problems           HairProblem[]
  isColored          Boolean
  washFrequency      WashFrequency
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("hair_profiles")
}

// ============================================
// PRODUCTS (from Golden Apple)
// ============================================

model Product {
  id              String   @id @default(cuid())
  
  // External ID
  itemId          String   @unique  // Golden Apple ID
  url             String
  
  // Basic info
  name            String
  brand           String
  productType     String
  category        String
  
  // Description
  description     String?  @db.Text
  howToUse        String?  @db.Text
  
  // Ingredients (CRITICAL for analysis)
  inci            String?  @db.Text  // Full INCI list
  
  // Attributes
  attrProductType String?
  attrGender      String?
  attrPurpose     String?
  attrSkinType    String?
  attrHairType    String?
  attrArea        String?
  attrVolume      String?
  attrTexture     String?
  attrFinish      String?
  
  // Pricing
  priceRegular    Int
  priceDiscount   Int?
  discountPercent Int?
  
  // Media
  imageUrl        String?
  imageCount      Int       @default(1)
  
  // Metadata
  country         String?
  inStock         Boolean   @default(true)
  isAdult         Boolean   @default(false)
  
  // Parsed data
  parsedAt        DateTime
  
  // Relations
  shelfItems      ShelfItem[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([brand])
  @@index([category])
  @@index([attrSkinType])
  @@index([attrHairType])
  @@map("products")
}

// ============================================
// USER SHELF (My Products)
// ============================================

model ShelfItem {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  
  // Personal score (generated by LLM)
  personalScore     Int?      // 0-100
  personalComment   String?   @db.Text  // LLM-generated explanation
  
  // User's own notes
  userNotes         String?
  userRating        Int?      // 1-5 stars
  
  // Status
  status            ShelfStatus @default(ACTIVE)
  
  addedAt           DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@unique([userId, productId])
  @@map("shelf_items")
}

enum ShelfStatus {
  ACTIVE      // Currently using
  WISHLIST    // Want to try
  FINISHED    // Used up
  ARCHIVED    // No longer using
}

// ============================================
// SEARCH HISTORY
// ============================================

model SearchHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  query     String
  type      SearchType  // PRODUCT, INGREDIENT, FREE_TEXT
  
  // If it was a product search
  productId String?
  
  // LLM response (if applicable)
  llmResponse String?  @db.Text
  
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@map("search_history")
}

enum SearchType {
  PRODUCT
  INGREDIENT
  FREE_TEXT
  RECOMMENDATION
}

// ============================================
// ENUMS
// ============================================

enum Gender {
  MALE
  FEMALE
  OTHER
}

enum AgeGroup {
  AGE_16_24
  AGE_25_34
  AGE_35_44
  AGE_45_54
  AGE_55_PLUS
}

enum Interest {
  SKINCARE
  HAIRCARE
  MAKEUP
}

enum SkinType {
  DRY
  OILY
  COMBINATION
  NORMAL
  SENSITIVE
}

enum SkinProblem {
  ACNE
  DRYNESS
  OILINESS
  REDNESS
  PIGMENTATION
  WRINKLES
  ENLARGED_PORES
  DULLNESS
}

enum SensitivityLevel {
  LOW       // Хорошо переносит
  MEDIUM    // Иногда раздражение
  HIGH      // Часто раздражение
}

enum HairType {
  STRAIGHT
  WAVY
  CURLY
  COILY
}

enum HairThickness {
  THIN
  MEDIUM
  THICK
}

enum ScalpCondition {
  NORMAL
  DRY
  OILY
  SENSITIVE
}

enum HairProblem {
  HAIR_LOSS
  DRYNESS
  OILINESS
  DANDRUFF
  SPLIT_ENDS
  DULLNESS
  BRITTLENESS
}

enum WashFrequency {
  DAILY
  EVERY_OTHER_DAY
  TWICE_A_WEEK
  ONCE_A_WEEK
  LESS_OFTEN
}
```

---

## 🔌 API Specification

### Endpoints

```yaml
# ============================================
# AUTHENTICATION
# ============================================

POST   /api/auth/register           # Email/phone registration
POST   /api/auth/login              # Login
POST   /api/auth/logout             # Logout
POST   /api/auth/refresh            # Refresh token
GET    /api/auth/me                 # Current user

POST   /api/auth/oauth/yandex       # Yandex OAuth
POST   /api/auth/oauth/vk           # VK OAuth

# ============================================
# SURVEYS
# ============================================

GET    /api/surveys                 # List all surveys with completion status
GET    /api/surveys/:type           # Get survey questions
POST   /api/surveys/:type           # Submit survey answers
GET    /api/surveys/progress        # Get overall progress (%)

# Response example:
# {
#   "surveys": [
#     { "type": "BASIC", "completed": true, "completedAt": "..." },
#     { "type": "DERMATOLOGY", "completed": false },
#     { "type": "TRICHOLOGY", "completed": false },
#     { "type": "CLINICAL", "completed": false, "locked": true }
#   ],
#   "progress": 25,
#   "systemPromptReady": false
# }

# ============================================
# PROFILE
# ============================================

GET    /api/profile                 # Get full profile
PUT    /api/profile                 # Update profile
GET    /api/profile/system-prompt   # Get generated system prompt
POST   /api/profile/regenerate-prompt # Force regenerate prompt

# ============================================
# SEARCH (requires surveys)
# ============================================

GET    /api/search                  # Search products
       ?q=query                     # Search query
       ?category=skincare           # Filter by category
       ?brand=LIBREDERM             # Filter by brand
       ?priceMin=500                # Min price
       ?priceMax=2000               # Max price
       ?skinType=dry                # Filter by skin type

POST   /api/search/ask              # LLM-powered search
       # Body: { "query": "Моя подруга посоветовала крем..." }
       # Returns: personalized recommendation

GET    /api/search/restrictions     # Check what's available without surveys

# ============================================
# SHELF (requires surveys)
# ============================================

GET    /api/shelf                   # Get user's shelf
POST   /api/shelf                   # Add product to shelf
       # Body: { "productId": "...", "status": "ACTIVE" }
DELETE /api/shelf/:itemId           # Remove from shelf
PUT    /api/shelf/:itemId           # Update (notes, rating)

GET    /api/shelf/score             # Get overall shelf score
       # Returns: { "score": 78, "analysis": "..." }

GET    /api/shelf/recommendations   # Get recommendations
       # Returns: { "replace": [...], "add": [...], "conflicts": [...] }

# ============================================
# PRODUCTS (individual)
# ============================================

GET    /api/products/:id            # Get product details
GET    /api/products/:id/score      # Get personalized score for user
       # Returns: {
       #   "personalScore": 87,
       #   "comment": "Этот крем отлично подходит...",
       #   "pros": [...],
       #   "cons": [...],
       #   "shelfCompatibility": "compatible"
       # }

# ============================================
# ENCYCLOPEDIA (available to all)
# ============================================

GET    /api/encyclopedia/products   # List all products (no personalization)
       ?page=1&limit=20
       ?category=skincare
       ?brand=LIBREDERM

GET    /api/encyclopedia/products/:id # Product details (no personalization)

GET    /api/encyclopedia/ingredients  # List ingredients
GET    /api/encyclopedia/ingredients/:name # Ingredient details

GET    /api/encyclopedia/search     # Search encyclopedia
       ?q=гиалуроновая

# ============================================
# TRENDS (beta)
# ============================================

GET    /api/trends                  # Get trending products
GET    /api/trends/categories       # Trends by category
```

### Response Examples

#### GET /api/products/:id/score (Personalized)

```json
{
  "product": {
    "id": "19760305104",
    "name": "LIBREDERM Hyaluronic Ultra-Moisturizing",
    "brand": "LIBREDERM",
    "imageUrl": "https://...",
    "priceRegular": 1072,
    "priceDiscount": 761
  },
  "personalScore": 87,
  "scoreBreakdown": {
    "skinCompatibility": 92,
    "ingredientSafety": 85,
    "shelfCompatibility": 90,
    "priceValue": 80
  },
  "personalComment": "Этот крем отлично подходит для вашей сухой кожи. Гиалуроновая кислота и церамиды в составе помогут восстановить липидный барьер, что особенно важно при вашей проблеме с сухостью.",
  "pros": [
    "Содержит церамиды — отлично для сухой кожи",
    "Гиалуроновая кислота для глубокого увлажнения",
    "Совместим с вашим текущим ниацинамидом"
  ],
  "cons": [
    "Содержит отдушку — может вызвать реакцию при высокой чувствительности"
  ],
  "shelfAnalysis": {
    "compatible": true,
    "conflicts": [],
    "synergies": ["Хорошо сочетается с The Ordinary Niacinamide"]
  }
}
```

#### POST /api/search/ask (LLM Search)

```json
// Request
{
  "query": "Моя подруга посоветовала мне крем La Roche-Posay, стоит ли мне его покупать?"
}

// Response
{
  "answer": "Судя по вашему профилю (комбинированная кожа, проблемы с акне), крем La Roche-Posay Toleriane может вам подойти, но есть нюансы...",
  "relatedProducts": [
    {
      "id": "...",
      "name": "La Roche-Posay Toleriane",
      "personalScore": 76,
      "quickComment": "Подходит, но есть альтернативы лучше"
    }
  ],
  "alternatives": [
    {
      "id": "...",
      "name": "CeraVe PM Facial Moisturizing Lotion",
      "personalScore": 89,
      "quickComment": "Лучше подходит для вашего типа кожи"
    }
  ]
}
```

---

## 📱 UI/UX Спецификации

### Экран: ПОИСК (без опросов)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Поиск                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🔒 Персональный поиск недоступен                      │  │
│  │                                                        │  │
│  │  Мы заботимся о вашем здоровье.                       │  │
│  │  Чтобы давать точные рекомендации под ваш тип кожи    │  │
│  │  и волос, нам нужно узнать о вас больше.              │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐   │  │
│  │  │  [🎯 Пройти опрос — 3 минуты]                  │   │  │
│  │  └────────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │  Что вы получите:                                      │  │
│  │  ✓ Персональные рекомендации средств                  │  │
│  │  ✓ Оценку совместимости с вашей кожей                 │  │
│  │  ✓ Предупреждения о потенциальных рисках              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ─────────────── или ───────────────                        │
│                                                              │
│  Ищите в энциклопедии (без персонализации):                 │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔍 Поиск товаров, ингредиентов...                     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Экран: ПОИСК (после опросов)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Найди или спроси                                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔍 Поиск по названию или бренду...                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  Что ты хочешь?                                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  ➕         │ │  ❓         │ │  🎯         │            │
│  │  Добавить   │ │  Узнать    │ │  Найти     │            │
│  │  товар      │ │  про       │ │  для       │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                              │
│  💬 Или напиши в свободной форме:                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ "Моя подруга посоветовала мне крем, нужен ли он мне?" │  │
│  │                                              [Отправить]│  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  💰 Бюджет                                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  0₽ ────────────●──────────────────────────── 10000₽  │  │
│  │                2500₽                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  📜 Недавние поиски                                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🧴 LIBREDERM крем              87 ✅ Подходит тебе    │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 💄 Rimmel тональный            64 ⚠️ Есть нюансы     │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Экран: МОЯ ПОЛКА

```
┌─────────────────────────────────────────────────────────────┐
│  📦 Моя полка                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │            Общая оценка твоей полки                   │  │
│  │                                                        │  │
│  │                   ┌───────────┐                        │  │
│  │                   │    78     │                        │  │
│  │                   │   /100    │                        │  │
│  │                   └───────────┘                        │  │
│  │                                                        │  │
│  │            "Хорошо, но есть что улучшить"             │  │
│  │                                                        │  │
│  │  Состав полки    ████████████░░░░  78%                │  │
│  │  Совместимость   ██████████████░░  88%                │  │
│  │  Полнота рутины  ████████░░░░░░░░  52%                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  🎯 Рекомендации для тебя                                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ⚠️ Замени: "Крем X" содержит спирт — конфликт с Y    │  │
│  │ ➕ Добавь: Увлажняющее средство — у тебя не хватает   │  │
│  │ ✅ Отличное сочетание: Сыворотка A + Крем B           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  📦 Твои средства (2)                         [+ Добавить]  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ┌─────┐                                               │  │
│  │ │ 🧴  │  LIBREDERM Hyaluronic         87 ✅          │  │
│  │ └─────┘  Ночной крем                                  │  │
│  │          "Отлично для твоей сухой кожи"               │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ ┌─────┐                                               │  │
│  │ │ 💄  │  Rimmel Blur It Out           64 ⚠️          │  │
│  │ └─────┘  Тональный крем                               │  │
│  │          "Подходит, но есть альтернативы лучше"       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Экран: ЭНЦИКЛОПЕДИЯ

```
┌─────────────────────────────────────────────────────────────┐
│  📚 Энциклопедия                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔍 Поиск товаров и ингредиентов...                    │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  📦 Товары                                    [Все товары →] │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ┌─────┐ LIBREDERM                                     │  │
│  │ │ 🧴  │ Hyaluronic Ultra-Moisturizing                 │  │
│  │ └─────┘ Ночной крем • Сухая кожа                      │  │
│  │         761₽ (−29%)                                   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ ┌─────┐ Rimmel                                        │  │
│  │ │ 💄  │ Kind & Free Blur It Out                       │  │
│  │ └─────┘ Тональный крем • Комби/жирная                 │  │
│  │         795₽ (−33%)                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  🧪 Ингредиенты                           [Все ингредиенты →]│
│  ┌─────────────────────────────────────────────────────────┐│
│  │[Гиалуроновая][Церамиды][Ниацинамид][Пантенол][Сквален]  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  📂 Категории                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │ 🧴          │ │ 💇          │ │ 💄          │            │
│  │ Уход за     │ │ Уход за     │ │ Макияж      │            │
│  │ кожей       │ │ волосами    │ │             │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Экран: ПРОФИЛЬ (с опросами)

```
┌─────────────────────────────────────────────────────────────┐
│  👤 Твой профиль                                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ┌─────┐                                               │  │
│  │  │  А  │  Алина                                        │  │
│  │  └─────┘  alina@email.com                              │  │
│  │                                              [✏️]       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Заполненность профиля                                │  │
│  │  [████████████░░░░░░░░] 60%                           │  │
│  │                                                        │  │
│  │  Чем больше данных — тем точнее рекомендации!         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  📋 Твои опросы                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ✅ Базовый опрос                           пройден    │  │
│  │    Открыт доступ к энциклопедии и базовым функциям    │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ ✅ Дерматология                            пройден    │  │
│  │    Персональные рекомендации по уходу за кожей        │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ ⏳ Трихология                              не начат   │  │
│  │    [Пройти] → откроет рекомендации по волосам        │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │ 🔒 Клинический                          заблокирован  │  │
│  │    Пройдите все базовые опросы для разблокировки      │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  📊 Твой профиль (из опросов)                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Кожа                                                 │  │
│  │  • Тип: Сухая                                         │  │
│  │  • Проблемы: Сухость, Тусклость                       │  │
│  │  • Чувствительность: Средняя                          │  │
│  │                                                        │  │
│  │  [Редактировать]                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ⚙️ Настройки                                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 🔔 Уведомления                                    [→] │  │
│  │ 🔒 Конфиденциальность                             [→] │  │
│  │ ❓ Помощь                                         [→] │  │
│  │ 🚪 Выйти из аккаунта                              [→] │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Дизайн-система [[memory:13485295]]

### Цвета

```css
/* Основные */
--bg-primary: #FDFCFB;       /* Белый (основной фон) */
--bg-secondary: #F7F5F3;     /* Бежевый (карточки) */
--bg-tertiary: #EDE9E4;      /* Темнее бежевого */

/* Текст */
--text-primary: #1A1714;     /* Основной текст */
--text-secondary: #4A4540;   /* Вторичный текст */
--text-hint: #6B6259;        /* Подсказки */

/* Акценты */
--accent-green: #2D7A4F;     /* Основной акцент */
--accent-green-light: #E8F5EC;
--accent-orange: #C4804D;    /* Предупреждения */
--accent-red: #C45252;       /* Ошибки/опасность */

/* Оценки */
--score-excellent: #2D7A4F;  /* 85-100 */
--score-good: #5B9A6F;       /* 70-84 */
--score-average: #C49234;    /* 50-69 */
--score-poor: #C45252;       /* 0-49 */
```

### Типографика

```css
/* Шрифт */
--font-family: 'Outfit', sans-serif;

/* Размеры */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Компоненты

```css
/* Кнопки */
--btn-radius: 12px;
--btn-radius-lg: 16px;

/* Карточки */
--card-radius: 16px;
--card-radius-lg: 20px;

/* Отступы */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;
```

---

## 🛠️ Технический Стек

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State:** React Context + Zustand
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod

### Backend
- **Framework:** NestJS
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Cache:** Redis
- **Auth:** JWT + OAuth (Yandex, VK)

### AI/LLM
- **Primary:** Grok API (или аналог)
- **Fallback:** GigaChat / YandexGPT
- **Task:** Персонализация, оценка совместимости

### Infrastructure
- **Hosting:** TimeWeb Cloud
- **CDN:** для изображений
- **Storage:** S3-compatible для медиа

---

## 📊 Метрики Успеха

### Ключевые KPI

| Метрика | Target (MVP) | Target (6 мес) |
|---------|--------------|----------------|
| MAU | 10,000 | 100,000 |
| Conversion (регистрация) | 20% | 30% |
| Survey completion rate | 60% | 75% |
| Products on shelf (avg) | 3 | 8 |
| DAU/MAU ratio | 15% | 25% |

### Воронка Пользователя

```
Посетитель
    │ 100%
    ▼
Регистрация
    │ 20%
    ▼
Базовый опрос
    │ 70%
    ▼
Дерматология/Трихология
    │ 50%
    ▼
Добавление в полку
    │ 40%
    ▼
Активный пользователь (DAU)
```

---

## 🚀 Roadmap

### Phase 1: Core (Текущая)
- [x] Авторизация (Email, OAuth)
- [ ] Система опросов (BASIC, DERMATOLOGY, TRICHOLOGY)
- [ ] Генерация системного промпта
- [ ] Энциклопедия с 2 товарами
- [ ] Блокировки доступа без опросов

### Phase 2: Personalization
- [ ] LLM-интеграция для оценки товаров
- [ ] Персонализированный поиск
- [ ] Моя полка с оценками
- [ ] Рекомендации

### Phase 3: Scale
- [ ] Загрузка 120К товаров из Золотого Яблока
- [ ] Оптимизация LLM-запросов
- [ ] Кеширование оценок
- [ ] Тренды

### Phase 4: Growth
- [ ] Социальные функции
- [ ] Push-уведомления
- [ ] Premium-функции
- [ ] B2B API

---

## 📎 Приложения

### A. Пример товара из базы

```json
{
  "item_id": "19760305104",
  "name": "hyaluronic ultra-moisturizing",
  "brand": "LIBREDERM",
  "product_type": "Ультраувлажняющий ночной крем для сухой кожи лица",
  "category": "уход > уход для лица > увлажнение и питание",
  "inci": "Aqua, C12-20 Acid Peg-8 Ester, Ricinus Communis Seed Oil, Propylene Glycol, Caprylyl Methicone, Butylene Glycol Dicaprylate/Dicaprate, Olus Oil, Sesamum Indicum Oil, Butyrospermum Parkii Butter, Cetearyl Alcohol, Prunus Persica (Peach) Kernel Oil, Saccharide Isomerate, Potassium Cetyl Phosphate, Polymethylsilsesquioxane, Betaine, Sodium Pca, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Glyceryl Laurate, Sodium Lactate, Copernicia Cerifera Cera, Pca, C30-45 Alkyl Cetearyl Dimethicone Crosspolymer, Cera Alba, Serine, Alanine, Glycine, Hydrogenated Castor Oil, Ceramide Np, Beta-Sitosterol, Ceramide Ap, Phytosphingosine, Carbomer, Cholesterol, Lysine Hcl, Threonine, Arginine, Xanthan Gum, Tocopherol (Mixed), Squalene, Proline, Phenoxyethanol, Citric Acid, Sodium Citrate, Glutamic Acid, Ceramide Eop, Parfum, Chlorphenesin, Triethanolamine, Sodium Phytate.",
  "attr_skin_type": "для сухой кожи",
  "attr_purpose": "увлажнение, восстановление",
  "price_regular": 1072,
  "price_discount": 761,
  "discount_percent": 29,
  "image_url": "https://pcdn.goldapple.ru/p/p/19760305104/web/696d674d61696e5064708ddc451926dfd30fullhd.jpg",
  "country": "Россия"
}
```

### B. Пример системного промпта

```
Ты — топ-левел консультант в дерматологии, трихологии и косметике.
К тебе пришла клиентка со следующим профилем:

## БАЗОВЫЕ ДАННЫЕ
- Пол: Женский
- Возраст: 25-34
- Основной интерес: Уход за кожей
- Известные аллергии: Нет

## ПРОФИЛЬ КОЖИ
- Тип кожи: Сухая
- Проблемы: Сухость, Тусклость
- Чувствительность: Средняя
- Заболевания: Нет
- Используемые активы: Гиалуроновая кислота, Церамиды

## ТЕКУЩИЕ СРЕДСТВА (полка)
Пусто — клиент только начал пользоваться приложением.

## ТВОИ ЗАДАЧИ
1. Оценивай совместимость каждого нового товара с профилем клиента
2. Давай персонализированные рекомендации
3. Объясняй простым языком
```

---

**Документ подготовлен:** AI Assistant  
**Дата:** 20 января 2026  
**Версия:** 2.0
