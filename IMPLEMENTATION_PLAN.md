# 📋 BeautyScore v2.0 — План Технических Доработок
# Implementation PRD for Full Integration

**Версия:** 1.0  
**Дата:** 21 января 2026  
**Статус:** Ready for Implementation  
**Цель:** 100% работающий локальный MVP

---

## 📌 Executive Summary

### Текущее состояние
- **Backend:** 84/84 endpoints реализованы, но не все интегрированы
- **Frontend:** 7 из 12 страниц используют MOCK данные вместо реального API
- **LLM:** Код готов, ключ YandexGPT доступен
- **БД:** Schema готова, seed работает (2 тестовых товара)

### Цель доработок
Полностью работающий flow для каждого пользователя:
```
Регистрация → Верификация → Опросы → Поиск → Просмотр товара → 
Добавление на полку → Персональные рекомендации → Профиль
```

### Ключи LLM (готовы)
```env
YANDEX_GPT_API_KEY=your-yandex-gpt-api-key
YANDEX_GPT_FOLDER_ID=your-yandex-folder-id
```

---

## 🏗️ Архитектура Интеграции

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js)                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │  Auth   │ │ Search  │ │  Shelf  │ │ Product │ │ Profile │      │
│  │ Context │ │  Page   │ │  Page   │ │  Page   │ │  Page   │      │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘      │
│       │          │          │          │          │              │
│       └──────────┴──────────┴──────────┴──────────┘              │
│                              │                                     │
│                    ┌─────────▼─────────┐                          │
│                    │   API Client      │                          │
│                    │ lib/api/client.ts │                          │
│                    └─────────┬─────────┘                          │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTP (localhost:3001)
┌──────────────────────────────┼──────────────────────────────────────┐
│                        BACKEND (NestJS)                             │
├──────────────────────────────┼──────────────────────────────────────┤
│                    ┌─────────▼─────────┐                          │
│                    │   Controllers     │                          │
│                    └─────────┬─────────┘                          │
│                              │                                     │
│  ┌──────────┐ ┌──────────┐ ┌▼─────────┐ ┌──────────┐            │
│  │  Auth    │ │ Surveys  │ │ Products │ │  Shelf   │            │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │            │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │          │          │          │                        │
│       └──────────┴──────────┼──────────┘                        │
│                             │                                     │
│              ┌──────────────┼──────────────┐                     │
│              │              │              │                     │
│        ┌─────▼─────┐ ┌──────▼─────┐ ┌─────▼─────┐              │
│        │  Prisma   │ │ LLM Service│ │   Redis   │              │
│        │  (PostgreSQL)│ │ (YandexGPT)│ │  (Cache)  │              │
│        └───────────┘ └────────────┘ └───────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Структура Изменений

### Frontend (apps/web/)

| Файл | Тип | Описание |
|------|-----|----------|
| `app/(dashboard)/app/page.tsx` | **MODIFY** | Заменить mock на API вызовы |
| `app/(dashboard)/app/shelf/page.tsx` | **MODIFY** | Полная интеграция с /api/shelf |
| `app/(dashboard)/app/product/[id]/page.tsx` | **MODIFY** | Интеграция с /api/products/:id |
| `app/(dashboard)/app/trends/page.tsx` | **CREATE** | Новая страница (вместо discover) |
| `app/(dashboard)/app/search/page.tsx` | **CREATE** | Страница результатов поиска |
| `app/(dashboard)/app/product/[id]/chat/page.tsx` | **CREATE** | LLM чат по продукту |
| `app/(dashboard)/app/notifications/page.tsx` | **CREATE** | Страница уведомлений |
| `app/(dashboard)/app/settings/page.tsx` | **CREATE** | Страница настроек |
| `app/(dashboard)/layout.tsx` | **MODIFY** | Исправить навигацию |
| `lib/api/hooks.ts` | **CREATE** | React hooks для API |

### Backend (apps/api/)

| Файл | Тип | Описание |
|------|-----|----------|
| `src/llm/providers/yandexgpt.provider.ts` | **MODIFY** | Настроить с реальным ключом |
| `src/products/products.service.ts` | **MODIFY** | Добавить LLM scoring |
| `src/shelf/shelf.service.ts` | **MODIFY** | Добавить history logging |
| `src/common/interceptors/logging.interceptor.ts` | **CREATE** | Логирование всех запросов |
| `.env` | **MODIFY** | Добавить все ключи |
| `prisma/seed.ts` | **VERIFY** | Проверить seed 2 товаров |

### Конфигурация

| Файл | Тип | Описание |
|------|-----|----------|
| `docker-compose.yml` | **VERIFY** | PostgreSQL + Redis |
| `apps/api/.env` | **MODIFY** | Все переменные окружения |
| `apps/web/.env.local` | **CREATE** | Frontend env |

---

## 🔧 ФАЗА 1: Инфраструктура (30 мин)

### 1.1 Настройка Environment Variables

**apps/api/.env:**
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/beautyscore"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="beautyscore-jwt-secret-change-in-production-2026"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"

# YandexGPT (добавьте свой ключ)
YANDEX_GPT_API_KEY="your-yandex-gpt-api-key"
YANDEX_GPT_FOLDER_ID="your-yandex-folder-id"

# GigaChat (оставить пустым - fallback на YandexGPT)
GIGACHAT_API_KEY=""
GIGACHAT_AUTH_URL=""

# Frontend URL
FRONTEND_URL="http://localhost:3000"

# OAuth (mock for local)
YANDEX_OAUTH_CLIENT_ID=""
YANDEX_OAUTH_CLIENT_SECRET=""
VK_OAUTH_CLIENT_ID=""
VK_OAUTH_CLIENT_SECRET=""
```

**apps/web/.env.local:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3001/api"
```

### 1.2 Docker Services

```yaml
# docker-compose.yml - проверить что запущено
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: beautyscore
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### 1.3 Seed Database

```bash
cd apps/api
npx prisma migrate dev
npx prisma db seed
```

**Ожидаемый результат:**
- 2 продукта (LIBREDERM, Rimmel)
- 4 ингредиента (Hyaluronic Acid, Niacinamide, Retinol, Parfum)

---

## 🔧 ФАЗА 2: Backend Доработки (2-3 часа)

### 2.1 Logging Interceptor

**Создать:** `apps/api/src/common/interceptors/logging.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const userId = user?.id || 'anonymous';
    const startTime = Date.now();

    this.logger.log(`→ ${method} ${url} [User: ${userId}]`);
    
    if (body && Object.keys(body).length > 0) {
      // Не логировать пароли
      const safeBody = { ...body };
      if (safeBody.password) safeBody.password = '***';
      this.logger.debug(`  Body: ${JSON.stringify(safeBody)}`);
    }

    return next.handle().pipe(
      tap({
        next: (data) => {
          const duration = Date.now() - startTime;
          this.logger.log(`← ${method} ${url} [${duration}ms] ✓`);
        },
        error: (error) => {
          const duration = Date.now() - startTime;
          this.logger.error(`← ${method} ${url} [${duration}ms] ✗ ${error.message}`);
        },
      }),
    );
  }
}
```

**Подключить в `app.module.ts`:**
```typescript
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

providers: [
  {
    provide: APP_INTERCEPTOR,
    useClass: LoggingInterceptor,
  },
  // ... остальные providers
],
```

### 2.2 YandexGPT Provider Update

**Обновить:** `apps/api/src/llm/providers/yandexgpt.provider.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LlmMessage,
  LlmCompletionOptions,
  LlmResponse,
  LlmProvider,
} from '../llm.types';

@Injectable()
export class YandexGptProvider implements LlmProvider {
  private readonly logger = new Logger(YandexGptProvider.name);
  private readonly apiKey: string;
  private readonly folderId: string;
  private readonly apiUrl = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('YANDEX_GPT_API_KEY', '');
    this.folderId = this.configService.get<string>('YANDEX_GPT_FOLDER_ID', '');
    
    if (this.apiKey && this.folderId) {
      this.logger.log('YandexGPT provider initialized with API key');
    } else {
      this.logger.warn('YandexGPT provider: missing API key or folder ID');
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!(this.apiKey && this.folderId);
  }

  async complete(
    messages: LlmMessage[],
    options: LlmCompletionOptions = {},
  ): Promise<LlmResponse> {
    if (!await this.isAvailable()) {
      throw new Error('YandexGPT not configured');
    }

    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const userMessages = messages.filter(m => m.role !== 'system');

    const requestBody = {
      modelUri: `gpt://${this.folderId}/yandexgpt-lite`,
      completionOptions: {
        stream: false,
        temperature: options.temperature ?? 0.6,
        maxTokens: options.maxTokens ?? 2000,
      },
      messages: [
        ...(systemMessage ? [{ role: 'system', text: systemMessage }] : []),
        ...userMessages.map(m => ({ role: m.role, text: m.content })),
      ],
    };

    this.logger.debug(`YandexGPT request: ${JSON.stringify(requestBody).slice(0, 200)}...`);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Api-Key ${this.apiKey}`,
          'x-folder-id': this.folderId,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`YandexGPT error: ${response.status} - ${errorText}`);
        throw new Error(`YandexGPT API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.result?.alternatives?.[0]?.message?.text || '';
      
      this.logger.debug(`YandexGPT response: ${content.slice(0, 100)}...`);

      return {
        content,
        provider: 'yandexgpt',
        usage: {
          promptTokens: data.result?.usage?.inputTextTokens,
          completionTokens: data.result?.usage?.completionTokens,
          totalTokens: data.result?.usage?.totalTokens,
        },
      };
    } catch (error) {
      this.logger.error(`YandexGPT request failed: ${error.message}`);
      throw error;
    }
  }
}
```

### 2.3 Products Service - Personal Score

**Обновить:** `apps/api/src/products/products.service.ts`

Добавить метод для получения персональной оценки:

```typescript
async getProductWithScore(productId: string, userId: string) {
  const product = await this.prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new NotFoundException('Товар не найден');
  }

  // Получить профиль пользователя для персонализации
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    include: { surveys: true },
  });

  // Если нет опросов - вернуть без персональной оценки
  if (!user?.surveys?.length) {
    return {
      product,
      personalScore: null,
      personalComment: 'Пройдите опросы для получения персональной оценки',
    };
  }

  // Генерируем системный промпт из профиля
  const systemPrompt = user.systemPrompt || this.generateDefaultPrompt(user);

  // Получаем LLM оценку
  try {
    const analysis = await this.llmService.analyzeProduct(
      product.id,
      product.name,
      product.brand,
      product.ingredients || [],
      systemPrompt,
    );

    return {
      product,
      personalScore: analysis.score,
      personalComment: analysis.recommendation,
      pros: analysis.pros,
      cons: analysis.cons,
    };
  } catch (error) {
    this.logger.warn(`LLM analysis failed for product ${productId}: ${error.message}`);
    return {
      product,
      personalScore: null,
      personalComment: 'Персональная оценка временно недоступна',
    };
  }
}

private generateDefaultPrompt(user: any): string {
  const parts = [];
  
  if (user.skinType) {
    parts.push(`Тип кожи пользователя: ${user.skinType}`);
  }
  if (user.hairType) {
    parts.push(`Тип волос: ${user.hairType}`);
  }
  if (user.allergies?.length) {
    parts.push(`Аллергии: ${user.allergies.join(', ')}`);
  }
  if (user.skinProblems?.length) {
    parts.push(`Проблемы кожи: ${user.skinProblems.join(', ')}`);
  }

  return parts.length > 0 
    ? `Профиль пользователя:\n${parts.join('\n')}`
    : 'Пользователь не заполнил профиль. Дай общую оценку продукта.';
}
```

### 2.4 Shelf Service - History Logging

**Обновить:** `apps/api/src/shelf/shelf.service.ts`

Добавить логирование действий с полкой:

```typescript
private async logShelfAction(
  userId: string,
  action: 'ADD' | 'REMOVE' | 'UPDATE' | 'UNDO',
  productId: string,
  details?: Record<string, any>,
) {
  await this.prisma.auditLog.create({
    data: {
      userId,
      action: `SHELF_${action}`,
      resource: 'UserProduct',
      resourceId: productId,
      ip: 'internal',
      userAgent: 'shelf-service',
      metadata: details,
    },
  });
  
  this.logger.log(`Shelf ${action}: user=${userId}, product=${productId}`);
}
```

---

## 🔧 ФАЗА 3: Frontend Интеграция (4-5 часов)

### 3.1 API Hooks

**Создать:** `apps/web/lib/api/hooks.ts`

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { api } from './client'

interface UseApiOptions<T> {
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(options.initialData || null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await api.get<T>(endpoint)
      setData(result)
      options.onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      options.onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [endpoint])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

// Specific hooks for common operations
export function useShelf() {
  return useApi<{ items: any[] }>('/shelf')
}

export function useProduct(id: string) {
  return useApi<{ product: any; personalScore?: number }>(`/products/${id}/score`)
}

export function useTrends() {
  return useApi<{ featured: any; weekly: any[] }>('/trends')
}

export function useSearch(query: string, filters?: Record<string, string>) {
  const params = new URLSearchParams({ q: query, ...filters })
  return useApi<{ results: any[]; total: number }>(`/search?${params}`)
}
```

### 3.2 Shelf Page Integration

**Обновить:** `apps/web/app/(dashboard)/app/shelf/page.tsx`

Ключевые изменения:
1. Заменить `savedProducts` на `useShelf()` hook
2. Добавить `api.post('/shelf')` для добавления
3. Добавить `api.delete('/shelf/:id')` для удаления
4. Добавить loading и error states
5. Добавить toast для undo удаления

```typescript
// Заменить начало файла на:
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, ChevronRight, Search, Filter, Trash2, Undo2 } from 'lucide-react'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ErrorState } from '@/components/ui/error-state'

interface ShelfItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    brand: string | null
    imageUrl: string | null
    category: string
  }
  personalScore: number | null
  status: string
  createdAt: string
}

export default function ShelfPage() {
  const [items, setItems] = useState<ShelfItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [deletedItem, setDeletedItem] = useState<ShelfItem | null>(null)
  const { toast } = useToast()

  // Load shelf data from API
  const loadShelf = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await api.get<{ items: ShelfItem[] }>('/shelf')
      setItems(data.items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить полку')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadShelf()
  }, [])

  // Remove item from shelf
  const handleRemove = async (item: ShelfItem) => {
    try {
      await api.delete(`/shelf/${item.id}`)
      setItems(prev => prev.filter(i => i.id !== item.id))
      setDeletedItem(item)
      
      toast({
        title: 'Товар удалён',
        action: (
          <button onClick={() => handleUndo(item)}>
            <Undo2 size={16} /> Отменить
          </button>
        ),
        duration: 30000, // 30 секунд по PRD!
      })
    } catch (err) {
      toast({ title: 'Ошибка удаления', variant: 'destructive' })
    }
  }

  // Undo delete
  const handleUndo = async (item: ShelfItem) => {
    try {
      await api.post(`/shelf/${item.id}/undo-delete`)
      setItems(prev => [...prev, item])
      setDeletedItem(null)
      toast({ title: 'Товар восстановлен' })
    } catch (err) {
      toast({ title: 'Не удалось восстановить', variant: 'destructive' })
    }
  }

  // Filter items
  const filteredItems = items.filter(item =>
    item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return <ShelfSkeleton />
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadShelf} />
  }

  // ... rest of the component (UI rendering)
}
```

### 3.3 Product Page Integration

**Обновить:** `apps/web/app/(dashboard)/app/product/[id]/page.tsx`

Ключевые изменения:
1. Загрузка данных из API вместо mockProducts
2. Получение персональной оценки через `/products/:id/score`
3. Кнопка "Добавить на полку" вызывает API
4. Добавить loading state для LLM score (до 15 сек)

```typescript
// Заменить начало файла:
'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useToast } from '@/components/ui/toast'
import { Skeleton } from '@/components/ui/skeleton'

interface Product {
  id: string
  name: string
  brand: string | null
  // ... all fields from API
}

interface ProductScore {
  personalScore: number | null
  personalComment: string
  pros: string[]
  cons: string[]
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [score, setScore] = useState<ProductScore | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isScoreLoading, setIsScoreLoading] = useState(true)
  const [isAddingToShelf, setIsAddingToShelf] = useState(false)
  const { toast } = useToast()

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      setIsLoading(true)
      try {
        const data = await api.get<{ product: Product }>(`/products/${id}`)
        setProduct(data.product)
      } catch (err) {
        toast({ title: 'Товар не найден', variant: 'destructive' })
      } finally {
        setIsLoading(false)
      }
    }
    loadProduct()
  }, [id])

  // Load personal score (separate request - can take up to 15 sec)
  useEffect(() => {
    const loadScore = async () => {
      setIsScoreLoading(true)
      try {
        const data = await api.get<ProductScore>(`/products/${id}/score`)
        setScore(data)
      } catch (err) {
        // LLM may be unavailable - show fallback
        setScore({
          personalScore: null,
          personalComment: 'Персональная оценка недоступна',
          pros: [],
          cons: [],
        })
      } finally {
        setIsScoreLoading(false)
      }
    }
    loadScore()
  }, [id])

  // Add to shelf
  const handleAddToShelf = async () => {
    setIsAddingToShelf(true)
    try {
      await api.post('/shelf', { productId: id })
      toast({ title: 'Добавлено на полку! ✓' })
    } catch (err: any) {
      if (err.message?.includes('already')) {
        toast({ title: 'Уже на полке' })
      } else {
        toast({ title: 'Ошибка', variant: 'destructive' })
      }
    } finally {
      setIsAddingToShelf(false)
    }
  }

  // ... rest of component
}
```

### 3.4 Layout Navigation Fix

**Обновить:** `apps/web/app/(dashboard)/layout.tsx`

```typescript
// Изменить navItems:
const navItems: NavItem[] = [
  { icon: '🔍', label: 'Поиск', href: '/app' },
  { icon: '📦', label: 'Моя полка', href: '/app/shelf' },
  { icon: '📚', label: 'Энциклопедия', href: '/app/encyclopedia' },
  { icon: '📈', label: 'Тренды', href: '/app/trends' },  // Было /app/discover
  { icon: '👤', label: 'Профиль', href: '/app/profile' },
]
```

### 3.5 Create Trends Page

**Создать:** `apps/web/app/(dashboard)/app/trends/page.tsx`

(Скопировать содержимое из discover/page.tsx и интегрировать с API)

### 3.6 Profile Menu Fix

**Обновить:** `apps/web/app/(dashboard)/app/profile/page.tsx`

```typescript
// Исправить menuItems:
const menuItems = [
  { id: 'settings', icon: Settings, label: 'Настройки', href: '/app/settings' },
  { id: 'notifications', icon: Bell, label: 'Уведомления', href: '/app/notifications' },
  { id: 'privacy', icon: Shield, label: 'Конфиденциальность', href: '/app/settings/privacy' },
  { id: 'help', icon: HelpCircle, label: 'Помощь', href: '/help' },
]
```

---

## 🔧 ФАЗА 4: Создание Недостающих Страниц (2-3 часа)

### 4.1 Search Results Page

**Создать:** `apps/web/app/(dashboard)/app/search/page.tsx`

- Показывать результаты поиска
- Интеграция с `/api/search`
- Фильтры и сортировка
- Loading state

### 4.2 Notifications Page

**Создать:** `apps/web/app/(dashboard)/app/notifications/page.tsx`

- Список уведомлений
- Mark as read
- Группировка по дате

### 4.3 Settings Page

**Создать:** `apps/web/app/(dashboard)/app/settings/page.tsx`

- Настройки уведомлений
- Язык
- Ссылка на Privacy

### 4.4 LLM Chat Page

**Создать:** `apps/web/app/(dashboard)/app/product/[id]/chat/page.tsx`

- Чат интерфейс
- POST `/api/search/ask`
- Loading indicator (до 30 сек)
- История сообщений в session

---

## ~~🔧 ФАЗА 5: Гостевой режим~~ — ОТЛОЖЕНО

> **РЕШЕНИЕ для MVP:** Убираем гостевой режим.
> 
> **Причины:**
> - Добавляет сложность (проверки на каждой странице)
> - Легко добавить позже (просто убрать redirect)
> - MVP фокус = полный рабочий flow
>
> **Реализация:** Redirect на `/login` для неавторизованных пользователей в middleware.

---

## 🔧 ФАЗА 5: Compliance и Analytics (2 часа)

### 6.1 152-ФЗ Requirements

**Дисклеймер на экранах с рекомендациями:**

```typescript
const DISCLAIMER = `
BeautyScore НЕ является медицинским приложением.
Рекомендации носят информационный характер.
При серьёзных проблемах обратитесь к дерматологу.
`
```

**Экспорт данных (уже есть endpoint):**
- `GET /api/profile/export` → скачивание JSON со всеми данными

**Удаление аккаунта:**
- Soft delete с 30-дневным периодом восстановления
- Подтверждение паролем

### 6.2 Analytics Events

**Создать:** `apps/web/lib/analytics.ts`

```typescript
type EventName = 
  | 'auth.register_completed'
  | 'auth.login'
  | 'survey.started'
  | 'survey.completed'
  | 'search.query'
  | 'shelf.product_added'
  | 'shelf.product_removed'
  | 'product.viewed'
  | 'product.score_viewed'

export function trackEvent(name: EventName, data?: Record<string, any>) {
  // В MVP: console.log для отладки
  console.log(`[Analytics] ${name}`, data)
  
  // TODO: интеграция с Amplitude/Mixpanel
}
```

---

## 🧪 ФАЗА 6A: Unit Tests (2-3 часа)

### Backend Unit Tests (Jest)

| Файл | Что тестирует |
|------|---------------|
| `llm/llm.service.spec.ts` | Fallback, caching 24h, персонализация |
| `llm/prompts.spec.ts` | generateSystemPrompt для разных профилей |
| `products/products.service.spec.ts` | getProductWithScore с LLM |
| `shelf/shelf.service.spec.ts` | add, delete, **undo (30 сек!)** |
| `auth/auth.service.spec.ts` | JWT tokens, refresh, validation |
| `surveys/surveys.service.spec.ts` | submit, update, progress |

**Примеры тестов:**

```typescript
// shelf.service.spec.ts
describe('ShelfService', () => {
  it('should soft delete item', async () => {
    const result = await service.removeItem(userId, productId);
    expect(result.deletedAt).not.toBeNull();
  });
  
  it('should restore item within 30 seconds', async () => {
    // Delete, then undo immediately
    await service.removeItem(userId, productId);
    const restored = await service.undoDelete(userId, productId);
    expect(restored.deletedAt).toBeNull();
  });
  
  it('should reject restore after 30 seconds', async () => {
    // Mock time to be 31 seconds later
    jest.advanceTimersByTime(31000);
    await expect(service.undoDelete(userId, productId))
      .rejects.toThrow('Время для отмены истекло');
  });
});
```

### Frontend Unit Tests (Vitest)

| Файл | Что тестирует |
|------|---------------|
| `lib/api/hooks.test.ts` | useShelf, useProduct, useTrends |
| `lib/api/client.test.ts` | Refresh token, error handling |
| `components/ui/*.test.tsx` | Button, Toast, Skeleton |

---

## 🧪 ФАЗА 6B: Integration Tests (3-4 часа)

### API Tests (Supertest)

```typescript
// shelf.e2e-spec.ts
describe('ShelfController (e2e)', () => {
  it('POST /shelf - should add product', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/shelf')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 'product-1' });
    expect(res.status).toBe(201);
  });
  
  it('POST /shelf - should return 409 if already on shelf', async () => {
    await request(app.getHttpServer())
      .post('/api/shelf')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 'product-1' });
    
    const res = await request(app.getHttpServer())
      .post('/api/shelf')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: 'product-1' });
    expect(res.status).toBe(409);
  });
});
```

### Database Tests

```typescript
describe('Database Operations', () => {
  it('should create user with relations');
  it('should cascade delete user data');
  it('should log to audit_logs on every action');
});
```

### LLM Integration Tests

```typescript
describe('LLM Integration', () => {
  it('should call YandexGPT API successfully');
  it('should handle timeout (30 sec) gracefully');
  it('should return fallback on API error');
  it('should cache responses in Redis');
  it('should handle invalid JSON from LLM');
});
```

---

## 🧪 ФАЗА 7: E2E Tests (3-4 часа)

### User Flows (Playwright)

| # | Flow | Шаги | Ожидаемый результат |
|---|------|------|---------------------|
| 1 | Регистрация | Email → Пароль → Submit | Создан user, redirect to onboarding |
| 2 | Онбординг | Basic survey (5 вопросов) | Сохранено в БД, systemPrompt сгенерирован |
| 3 | Поиск товара | Ввести "крем" → Enter | Результаты из БД (2 товара) |
| 4 | Просмотр товара | Клик на товар | Страница с данными из API |
| 5 | Персональная оценка | Подождать до 15 сек | Score от YandexGPT |
| 6 | Добавление на полку | Клик "Добавить" | Toast "Добавлено", появился в /shelf |
| 7 | Моя полка | Перейти на /shelf | Список товаров из API |
| 8 | Удаление с полки | Клик удалить | Toast с undo (30 сек!), товар исчез |
| 9 | Undo удаления | Клик "Отменить" в течение 30 сек | Товар вернулся |
| 10 | Профиль → Выход | Перейти в профиль → Выйти | Redirect на login |

### Error States (E2E)

```typescript
describe('Error Handling', () => {
  it('should show error state on network failure', async ({ page }) => {
    await page.route('**/api/**', route => route.abort());
    await page.goto('/app/shelf');
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
  });
  
  it('should redirect to login on 401', async ({ page }) => {
    await page.evaluate(() => localStorage.clear());
    await page.goto('/app/shelf');
    await expect(page).toHaveURL('/login');
  });
  
  it('should handle LLM timeout gracefully', async ({ page }) => {
    await page.route('**/api/products/*/score', async route => {
      await new Promise(r => setTimeout(r, 20000));
      await route.fulfill({ status: 504 });
    });
    await page.goto('/app/product/1');
    await expect(page.locator('[data-testid="score-fallback"]')).toBeVisible();
  });
});
```

### Edge Cases (E2E)

```typescript
describe('Edge Cases', () => {
  it('should restore item within 30 seconds');
  it('should reject restore after 30 seconds');
  it('should show 409 toast on duplicate shelf add');
  it('should save survey progress on exit');
  it('should truncate search query > 500 chars');
});
```

---

## 📊 Покрытие тестами (цель)

| Тип теста | Количество | Покрытие кода |
|-----------|------------|---------------|
| Unit (Backend) | ~40-50 | 70% |
| Unit (Frontend) | ~20-30 | 60% |
| Integration | ~30-40 | 25% |
| E2E | ~15-20 | 100% flows |
| **ИТОГО** | **~100-140** | **~85%** |

---

## 📊 Метрики Успеха

### Функциональные
- [ ] 100% страниц используют реальный API (0 mock data)
- [ ] 100% кнопок имеют рабочие handlers
- [ ] 100% навигации работает корректно
- [ ] LLM scoring работает для 2 тестовых товаров (YandexGPT)
- [ ] Неавторизованные пользователи редиректятся на /login

### Технические
- [ ] Все запросы логируются
- [ ] Ошибки обрабатываются с user-friendly сообщениями
- [ ] Loading states на всех async операциях
- [ ] Данные корректно сохраняются в PostgreSQL
- [ ] Redis кеширование для LLM ответов

### UX
- [ ] Каждый flow завершается успешно
- [ ] Toast уведомления для всех действий
- [ ] Undo для деструктивных операций (30 сек для shelf!)
- [ ] Время загрузки LLM показывается пользователю

### Compliance
- [ ] Дисклеймеры на экранах с рекомендациями
- [ ] Экспорт данных пользователя работает
- [ ] Мягкое удаление аккаунта (30 дней)

---

## 🗓️ Timeline

| Фаза | Время | Описание |
|------|-------|----------|
| 1. Инфраструктура | 30 мин | Env, Docker, Seed |
| 2. Backend | 2-3 часа | Logging, LLM (YandexGPT), Services |
| 3. Frontend Integration | 4-5 часов | Hooks, Pages, API calls |
| 4. Новые страницы | 2-3 часа | Search, Notifications, Settings |
| 5. Compliance | 1 час | Disclaimers, Analytics |
| 6A. Unit Tests | 2-3 часа | Backend + Frontend |
| 6B. Integration Tests | 3-4 часа | API + DB + LLM |
| 7. E2E Tests | 3-4 часа | Playwright user flows |
| **ИТОГО** | **18-24 часа** | Full MVP с тестами |

---

## 🚀 Команды для запуска

```bash
# 1. Запустить Docker services
cd beautyscore
docker-compose up -d

# 2. Проверить PostgreSQL
docker-compose exec postgres psql -U postgres -d beautyscore -c "SELECT 1"

# 3. Применить миграции и seed
cd apps/api
npx prisma migrate dev
npx prisma db seed

# 4. Запустить backend
pnpm dev --filter=api

# 5. В другом терминале - frontend
pnpm dev --filter=web

# 6. Открыть в браузере
open http://localhost:3000
```

---

**Документ готов к реализации.**  
**Следующий шаг:** Начать с Фазы 1 (Инфраструктура)
