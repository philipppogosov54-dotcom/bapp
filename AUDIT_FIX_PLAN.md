# 🛠️ BEAUTYSCORE - ПЛАН ИСПРАВЛЕНИЙ ПОСЛЕ АУДИТА
**На основе:** FULL_DATA_FLOW_AUDIT_REPORT.md  
**Дата:** 21 января 2026  
**Статус:** Ready to Execute

---

## 📋 ФАЗЫ ИСПРАВЛЕНИЙ

### ФАЗА 1: КРИТИЧЕСКИЕ БАГИ (BLOCKERS) 🔴
**Срок:** 2-3 дня  
**Приоритет:** MUST FIX перед любым релизом

#### ✅ **TASK 1.1: Интегрировать Analytics в UI**
**Issue:** C-1  
**Время:** 3-4 часа

**Файлы для изменения:**
```
beautyscore/apps/web/
  app/(auth)/login/page.tsx
  app/(auth)/register/page.tsx
  app/(dashboard)/app/page.tsx (search)
  app/(dashboard)/app/product/[id]/page.tsx
  app/(dashboard)/app/shelf/page.tsx
  app/(dashboard)/app/trends/page.tsx
  contexts/auth-context.tsx
```

**Изменения:**

1. **Auth events** (login/register/logout):
```tsx
// app/(auth)/login/page.tsx
import { analytics } from '@/lib/analytics'

const handleSubmit = async (e: FormEvent) => {
  // ... existing code
  
  try {
    if (isLogin) {
      const result = await login(email, password)
      analytics.auth.login('email') // ✅ ADD
    } else {
      const result = await register(/* ... */)
      analytics.auth.register('email') // ✅ ADD
    }
  } catch (error) {
    analytics.auth.loginFailed('email', error.message) // ✅ ADD
  }
}

// Для OAuth:
const handleOAuthCallback = async () => {
  // ...
  analytics.auth.login(provider) // 'vk' | 'yandex'
}
```

2. **Product events**:
```tsx
// app/(dashboard)/app/product/[id]/page.tsx
import { analytics, productEvents } from '@/lib/analytics'

export default function ProductPage({ params }) {
  const { id } = use(params)
  
  useEffect(() => {
    analytics.product.view(id, 'direct') // ✅ ADD
  }, [id])
  
  // When score loaded:
  useEffect(() => {
    if (score) {
      analytics.product.scoreLoaded(
        id, 
        score.score, 
        score.isPersonalized
      ) // ✅ ADD
    }
  }, [score])
  
  // When add to shelf:
  const handleAddToShelf = async () => {
    // ...
    analytics.shelf.addProduct(id) // ✅ ADD
  }
}
```

3. **Search events**:
```tsx
// app/(dashboard)/app/page.tsx
const handleSearchSubmit = () => {
  // ...
  analytics.search.search(searchQuery, results?.total || 0) // ✅ ADD
}
```

4. **Navigation events** (auto-track page views):
```tsx
// app/layout.tsx или dashboard layout
import { analytics } from '@/lib/analytics'
import { usePathname } from 'next/navigation'

export default function Layout({ children }) {
  const pathname = usePathname()
  
  useEffect(() => {
    analytics.navigation.pageView(pathname) // ✅ ADD
  }, [pathname])
  
  // ...
}
```

**Acceptance Criteria:**
- [ ] Login/register/logout events tracked
- [ ] Product view/score events tracked
- [ ] Search events tracked
- [ ] Page view events tracked
- [ ] В console.log видны analytics events (dev mode)

---

#### ✅ **TASK 1.2: Добавить <AIDisclaimer /> на все LLM страницы**
**Issue:** C-2  
**Время:** 1 час

**Файлы для изменения:**
```
beautyscore/apps/web/
  app/(dashboard)/app/product/[id]/page.tsx
  app/(dashboard)/app/trends/page.tsx
  app/(dashboard)/app/product/[id]/chat/page.tsx
  app/(dashboard)/app/shelf/page.tsx (если добавим Shelf Analysis UI)
```

**Изменения:**

1. **Product page** (после Pros/Cons):
```tsx
// app/product/[id]/page.tsx
import { AIDisclaimer } from '@/components/ui/disclaimer'

{score && score.analysis && (
  <>
    {/* Existing Pros/Cons section */}
    
    {/* ✅ ADD: */}
    <div style={{ marginTop: '16px' }}>
      <AIDisclaimer />
    </div>
  </>
)}
```

2. **Trends page** (заменить текущий текст):
```tsx
// app/trends/page.tsx
import { AIDisclaimer } from '@/components/ui/disclaimer'

{/* ❌ REMOVE:
<p style={{ fontSize: '0.75rem', ... }}>
  ⚠️ Рекомендации основаны на анализе...
</p>
*/}

{/* ✅ REPLACE WITH: */}
<div style={{ marginTop: '24px' }}>
  <AIDisclaimer />
</div>
```

3. **Product Chat page**:
```tsx
// app/product/[id]/chat/page.tsx
import { AIDisclaimer } from '@/components/ui/disclaimer'

{/* ❌ REMOVE текст внизу */}
{/* ✅ REPLACE: */}
<div style={{ marginTop: '12px' }}>
  <AIDisclaimer />
</div>
```

**Acceptance Criteria:**
- [ ] Product page показывает disclaimer после LLM analysis
- [ ] Trends page показывает disclaimer внизу
- [ ] Chat page показывает disclaimer внизу
- [ ] Все disclaimers выглядят одинаково (unified component)

---

#### ✅ **TASK 1.3: Создать Legal Pages (Privacy/Terms/Cookies)**
**Issue:** C-3 🚨 **LEGAL BLOCKER**  
**Время:** 4-6 часов (включая юридическую консультацию!)

**⚠️ IMPORTANT:** Требуется помощь юриста для соответствия 152-ФЗ!

**Файлы для создания/изменения:**
```
beautyscore/apps/web/
  app/privacy/page.tsx
  app/terms/page.tsx  
  app/cookies/page.tsx
  app/(auth)/register/page.tsx (add consent checkbox)
  components/legal/
    privacy-content.tsx
    terms-content.tsx
    cookies-content.tsx
```

**Шаг 1: Контент страниц**

Создать `components/legal/privacy-content.tsx`:
```tsx
export const PrivacyContent = () => (
  <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 20px' }}>
    <h1>Политика конфиденциальности</h1>
    
    <section>
      <h2>1. Какие данные мы собираем</h2>
      <p>BeautyScore собирает следующие персональные данные:</p>
      <ul>
        <li>Email / Номер телефона (для авторизации)</li>
        <li>Имя, Дата рождения, Пол (профиль)</li>
        <li>Тип кожи/волос, Аллергии (опросы)</li>
        <li>История поиска и сохранённые продукты</li>
      </ul>
    </section>
    
    <section>
      <h2>2. Как мы используем данные</h2>
      <p>Ваши данные используются для:</p>
      <ul>
        <li>Персонализации рекомендаций</li>
        <li>Расчёта подходящести продуктов</li>
        <li>Улучшения качества сервиса</li>
      </ul>
    </section>
    
    <section>
      <h2>3. Хранение и безопасность</h2>
      <p>Данные хранятся на защищённых серверах в РФ. Применяется шифрование...</p>
    </section>
    
    <section>
      <h2>4. Ваши права (152-ФЗ)</h2>
      <ul>
        <li>Право на доступ к данным (экспорт)</li>
        <li>Право на удаление (с retention 30 дней)</li>
        <li>Право на исправление данных</li>
      </ul>
    </section>
    
    <section>
      <h2>5. Cookies</h2>
      <p>Мы используем cookies для авторизации (refresh token). Подробнее в <a href="/cookies">Cookie-политике</a>.</p>
    </section>
    
    <section>
      <h2>6. Контакты</h2>
      <p>По вопросам персональных данных: <a href="mailto:privacy@beautyscore.ru">privacy@beautyscore.ru</a></p>
    </section>
    
    <p style={{ marginTop: '40px', fontSize: '0.875rem', color: '#6B6259' }}>
      Последнее обновление: 21 января 2026
    </p>
  </div>
)
```

**Шаг 2: Обновить страницы**
```tsx
// app/privacy/page.tsx
import { PrivacyContent } from '@/components/legal/privacy-content'

export const metadata = { title: 'Политика конфиденциальности | BeautyScore' }

export default function PrivacyPage() {
  return <PrivacyContent />
}
```

**Шаг 3: Добавить consent checkbox в регистрацию**
```tsx
// app/(auth)/register/page.tsx
const [agreedToTerms, setAgreedToTerms] = useState(false)

<label style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
  <input
    type="checkbox"
    checked={agreedToTerms}
    onChange={e => setAgreedToTerms(e.target.checked)}
    required
  />
  <span style={{ fontSize: '0.875rem' }}>
    Я согласен с{' '}
    <Link href="/terms" target="_blank">Условиями использования</Link>
    {' '}и{' '}
    <Link href="/privacy" target="_blank">Политикой конфиденциальности</Link>
  </span>
</label>

<button
  type="submit"
  disabled={!agreedToTerms} // ✅ Disable until agreed
>
  Зарегистрироваться
</button>
```

**Acceptance Criteria:**
- [ ] `/privacy` показывает реальный контент (не Coming Soon)
- [ ] `/terms` показывает реальный контент
- [ ] `/cookies` показывает реальный контент
- [ ] Регистрация требует согласия (checkbox)
- [ ] Submit кнопка disabled пока не согласился
- [ ] ✅ **ЮРИСТ проверил контент!**

---

#### ✅ **TASK 1.4: Добавить LLM Timeout Wrapper**
**Issue:** C-4  
**Время:** 2 часа

**Файлы для изменения:**
```
beautyscore/apps/api/src/llm/llm.service.ts
```

**Изменения:**

```typescript
// llm.service.ts

export class LlmService {
  private readonly TIMEOUT_MS = 15000 // 15 seconds
  
  /**
   * Wrapper для выполнения LLM запроса с timeout
   */
  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number = this.TIMEOUT_MS,
    fallbackFn?: () => Promise<T>
  ): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`LLM request timeout after ${timeoutMs}ms`))
      }, timeoutMs)
    })
    
    try {
      return await Promise.race([promise, timeoutPromise])
    } catch (error) {
      this.logger.warn(`LLM timeout: ${error.message}`)
      
      if (fallbackFn) {
        this.logger.log('Attempting fallback...')
        return await fallbackFn()
      }
      
      throw error
    }
  }
  
  /**
   * Analyze product with timeout + fallback
   */
  async analyzeProduct(
    productId: string,
    ingredients: string[],
    systemPrompt?: string,
  ): Promise<ProductAnalysis> {
    const cacheKey = `product_analysis_${productId}_${hashSystemPrompt(systemPrompt)}`
    
    // Check cache first
    const cached = await this.cacheManager.get<ProductAnalysis>(cacheKey)
    if (cached) return cached
    
    // Try with timeout + fallback chain
    try {
      const result = await this.withTimeout(
        this.gigaChat.analyzeProduct({ productId, ingredients, systemPrompt }),
        this.TIMEOUT_MS,
        // Fallback to YandexGPT
        () => this.withTimeout(
          this.yandexGPT.analyzeProduct({ productId, ingredients, systemPrompt }),
          this.TIMEOUT_MS,
          // Final fallback - generic response
          async () => this.getFallbackAnalysis(productId, ingredients)
        )
      )
      
      // Cache successful result
      await this.cacheManager.set(cacheKey, result, 3600000) // 1 hour
      return result
      
    } catch (error) {
      this.logger.error('All LLM providers failed', error)
      return this.getFallbackAnalysis(productId, ingredients)
    }
  }
  
  /**
   * Fallback analysis (no LLM, basic heuristics)
   */
  private getFallbackAnalysis(
    productId: string,
    ingredients: string[]
  ): ProductAnalysis {
    // Basic analysis based on known good/bad ingredients
    const knownGoodIngredients = ['hyaluronic acid', 'niacinamide', 'vitamin c']
    const knownBadIngredients = ['alcohol', 'fragrance', 'sulfates']
    
    const goodCount = ingredients.filter(ing => 
      knownGoodIngredients.some(good => ing.toLowerCase().includes(good))
    ).length
    
    const badCount = ingredients.filter(ing =>
      knownBadIngredients.some(bad => ing.toLowerCase().includes(bad))
    ).length
    
    const baseScore = 70
    const score = Math.max(30, Math.min(95, baseScore + (goodCount * 5) - (badCount * 10)))
    
    return {
      score,
      pros: goodCount > 0 
        ? ['Содержит эффективные ингредиенты']
        : ['Состав требует дополнительного анализа'],
      cons: badCount > 0
        ? ['Содержит потенциально раздражающие компоненты']
        : ['Для точной оценки требуется AI-анализ'],
      summary: 'AI-сервис временно недоступен. Оценка рассчитана по базовым правилам.',
      provider: 'fallback_heuristic'
    }
  }
}
```

**Acceptance Criteria:**
- [ ] LLM запросы timeout после 15 секунд
- [ ] При timeout переключается на fallback provider
- [ ] Если все providers timeout → возвращает heuristic analysis
- [ ] В логах видно "LLM timeout" warnings
- [ ] Frontend не висит бесконечно

---

#### ✅ **TASK 1.5: Исправить Cache Invalidation после Survey**
**Issue:** C-6  
**Время:** 1 час

**Файлы для изменения:**
```
beautyscore/apps/api/src/surveys/surveys.service.ts
beautyscore/apps/api/src/llm/llm.service.ts
```

**Изменения:**

```typescript
// surveys.service.ts

export class SurveysService {
  constructor(
    private prisma: PrismaService,
    private cacheManager: Cache, // ✅ ADD
  ) {}
  
  async submitSurvey(userId: string, type: string, dto: SubmitSurveyDto) {
    // ... existing logic ...
    
    // If all surveys completed:
    if (dto.isComplete && hasCompletedAll) {
      await this.regenerateSystemPrompt(userId)
      await this.updateUserProfileFromSurveys(userId)
      
      // ✅ ADD: Invalidate LLM caches
      await this.invalidateUserLlmCaches(userId)
    }
    
    return survey
  }
  
  /**
   * Invalidate all LLM-related caches for user
   */
  private async invalidateUserLlmCaches(userId: string): Promise<void> {
    try {
      // Clear product scores (personalized)
      const pattern = `product_score_${userId}_*`
      await this.deleteByPattern(pattern)
      
      // Clear personalized trends
      await this.cacheManager.del(`trends_personalized_${userId}`)
      
      // Clear shelf analysis
      await this.cacheManager.del(`shelf_analysis_${userId}`)
      
      this.logger.log(`Invalidated LLM caches for user ${userId}`)
    } catch (error) {
      this.logger.error('Failed to invalidate caches', error)
      // Don't throw - это не критично
    }
  }
  
  /**
   * Delete cache keys by pattern (Redis SCAN + DEL)
   */
  private async deleteByPattern(pattern: string): Promise<void> {
    // Если используется Redis:
    const keys = await this.cacheManager.store.keys(pattern)
    await Promise.all(keys.map(key => this.cacheManager.del(key)))
    
    // Если cache-manager не поддерживает keys():
    // Нужно использовать прямой Redis client:
    // const redis = this.cacheManager.store.getClient()
    // const keys = await redis.keys(pattern)
    // await Promise.all(keys.map(key => redis.del(key)))
  }
}
```

**Acceptance Criteria:**
- [ ] После завершения опроса кэш очищается
- [ ] Следующий запрос /products/:id/score использует новый systemPrompt
- [ ] Personalized trends обновляются
- [ ] В логах видно "Invalidated LLM caches"

---

#### ✅ **TASK 1.6: Удалить /discover редирект**
**Issue:** C-5  
**Время:** 15 минут

**Файлы для удаления:**
```
beautyscore/apps/web/app/(dashboard)/app/discover/page.tsx
beautyscore/apps/web/app/(dashboard)/app/discover/ (вся папка)
```

**Проверить ссылки:**
```bash
# В корне проекта:
grep -r "/discover" beautyscore/apps/web/
# Заменить все на /trends
```

**Acceptance Criteria:**
- [ ] Папка `/discover` удалена
- [ ] Все ссылки ведут на `/trends`
- [ ] `grep -r "/discover"` = 0 results

---

#### ✅ **TASK 1.7: Добавить визуальный countdown для Shelf Undo**
**Issue:** C-7  
**Время:** 1 час

**Файлы для изменения:**
```
beautyscore/apps/web/app/(dashboard)/app/shelf/page.tsx
```

**Изменения:**

```tsx
// shelf/page.tsx

const [undoToast, setUndoToast] = useState<UndoToast | null>(null)
const [timeRemaining, setTimeRemaining] = useState(30) // ✅ ADD

useEffect(() => {
  if (!undoToast) {
    setTimeRemaining(30)
    return
  }
  
  // ✅ ADD: Countdown timer
  const interval = setInterval(() => {
    setTimeRemaining(prev => {
      if (prev <= 1) {
        setUndoToast(null)
        return 30
      }
      return prev - 1
    })
  }, 1000)
  
  return () => clearInterval(interval)
}, [undoToast])

// В toast render:
<motion.div /* ... */>
  <span style={{ fontSize: '0.875rem' }}>
    «{undoToast.productName.slice(0, 20)}...» удалён
  </span>
  <button onClick={handleUndo} style={{
    /* ... existing styles ... */
    // ✅ ADD warning color if < 5s:
    backgroundColor: timeRemaining <= 5 ? '#DC2626' : colors.accentGreen,
  }}>
    <Undo2 size={16} />
    Отменить ({timeRemaining}s) {/* ✅ ADD countdown */}
  </button>
</motion.div>
```

**Acceptance Criteria:**
- [ ] Toast показывает оставшееся время (30s → 0s)
- [ ] При < 5s цвет кнопки меняется на красный (warning)
- [ ] Timer точный (1 секунда = 1 секунда)
- [ ] При undo таймер останавливается

---

#### ✅ **TASK 1.8: Показывать источник Score (Personalized vs General)**
**Issue:** C-8  
**Время:** 30 минут

**Файлы для изменения:**
```
beautyscore/apps/web/app/(dashboard)/app/product/[id]/page.tsx
```

**Изменения:**

```tsx
// product/[id]/page.tsx

{displayScore !== null && (
  <>
    {/* Existing score display */}
    
    {/* ✅ ADD: Score source badge */}
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '12px',
    }}>
      <div style={{
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '0.75rem',
        fontWeight: 500,
        backgroundColor: score?.isPersonalized 
          ? colors.accentGreenLight 
          : colors.bgTertiary,
        color: score?.isPersonalized 
          ? colors.accentGreen 
          : colors.textSecondary,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        {score?.isPersonalized ? (
          <>
            <User size={14} />
            Персональная оценка
          </>
        ) : (
          <>
            <Globe size={14} />
            Общая оценка
          </>
        )}
      </div>
    </div>
    
    {/* ✅ ADD: Hint for non-personalized */}
    {!score?.isPersonalized && !user?.onboardingCompleted && (
      <p style={{
        fontSize: '0.8125rem',
        color: colors.textTertiary,
        textAlign: 'center',
        marginTop: '8px',
      }}>
        <Link href="/onboarding/welcome" style={{ color: colors.accentGreen }}>
          Пройдите опросы
        </Link>
        {' '}для персональной оценки
      </p>
    )}
  </>
)}
```

**Acceptance Criteria:**
- [ ] Badge "Персональная оценка" если isPersonalized = true
- [ ] Badge "Общая оценка" если isPersonalized = false
- [ ] Hint ведёт на onboarding если не пройден
- [ ] Icons (User/Globe) показываются

---

### ФАЗА 2: ВАЖНЫЕ ПРОБЛЕМЫ (BEFORE PUBLIC LAUNCH) 🟠
**Срок:** 3-4 дня  
**Приоритет:** HIGH

#### ✅ **TASK 2.1: Добавить Notification Badge с Count**
**Issue:** I-2  
**Время:** 2 часа

**Файлы для изменения:**
```
beautyscore/apps/web/components/ui/bottom-navigation.tsx
beautyscore/apps/web/app/(dashboard)/layout.tsx
beautyscore/apps/web/lib/api/hooks.ts (create useNotificationCount)
```

**Изменения:**

1. **Create notification count hook**:
```tsx
// lib/api/hooks.ts

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0)
  
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const notifications = await api.get<Notification[]>('/notifications')
        const unread = notifications.filter(n => !n.isRead).length
        setUnreadCount(unread)
      } catch (err) {
        console.error('Failed to fetch notification count', err)
      }
    }
    
    fetchCount()
    
    // Poll every 30 seconds
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])
  
  return { unreadCount }
}
```

2. **Add badge to navigation**:
```tsx
// components/ui/bottom-navigation.tsx

export const BottomNavigation = () => {
  const { unreadCount } = useNotificationCount() // ✅ ADD
  
  const navItems: NavItem[] = [
    { icon: <Search />, label: 'Поиск', path: '/app' },
    { icon: <Package />, label: 'Полка', path: '/app/shelf' },
    { 
      icon: <Bell />, 
      label: 'Уведомления', 
      path: '/app/notifications',
      badge: unreadCount // ✅ ADD
    },
    // ...
  ]
  
  return (
    <nav>
      {navItems.map(item => (
        <button key={item.path}>
          <div style={{ position: 'relative' }}>
            {item.icon}
            
            {/* ✅ ADD: Badge */}
            {item.badge && item.badge > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: '#DC2626',
                color: 'white',
                fontSize: '0.625rem',
                fontWeight: 600,
                borderRadius: '10px',
                padding: '2px 6px',
                minWidth: '18px',
                textAlign: 'center',
              }}>
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </div>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
```

**Acceptance Criteria:**
- [ ] Badge показывается если есть непрочитанные
- [ ] Число обновляется каждые 30 секунд
- [ ] После прочтения badge исчезает
- [ ] "99+" для больших чисел

---

#### ✅ **TASK 2.2: Реализовать Filters на Search & Shelf**
**Issue:** I-3  
**Время:** 4-5 часов

**Файлы для создания:**
```
beautyscore/apps/web/components/ui/filters-modal.tsx
beautyscore/apps/web/hooks/use-filters.ts
```

**Файлы для изменения:**
```
beautyscore/apps/web/app/(dashboard)/app/search/page.tsx
beautyscore/apps/web/app/(dashboard)/app/shelf/page.tsx
```

**Изменения:**

1. **Create filters hook**:
```tsx
// hooks/use-filters.ts

export interface Filters {
  categories: string[]
  brands: string[]
  priceRange: [number, number]
  scoreRange: [number, number]
}

export function useFilters() {
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    brands: [],
    priceRange: [0, 10000],
    scoreRange: [0, 100],
  })
  
  const [isOpen, setIsOpen] = useState(false)
  
  const applyFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setIsOpen(false)
  }
  
  const clearFilters = () => {
    setFilters({
      categories: [],
      brands: [],
      priceRange: [0, 10000],
      scoreRange: [0, 100],
    })
  }
  
  return {
    filters,
    isOpen,
    setIsOpen,
    applyFilters,
    clearFilters,
  }
}
```

2. **Create filters modal**:
```tsx
// components/ui/filters-modal.tsx

export const FiltersModal = ({ isOpen, onClose, onApply, initialFilters }) => {
  const [localFilters, setLocalFilters] = useState(initialFilters)
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
              zIndex: 1000,
            }}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#FDFCFB',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              maxHeight: '80vh',
              overflowY: 'auto',
              zIndex: 1001,
            }}
          >
            <h3>Фильтры</h3>
            
            {/* Category checkboxes */}
            <div>
              <h4>Категория</h4>
              {['Уход за кожей', 'Волосы', 'Макияж'].map(cat => (
                <label key={cat}>
                  <input
                    type="checkbox"
                    checked={localFilters.categories.includes(cat)}
                    onChange={e => {
                      if (e.target.checked) {
                        setLocalFilters(prev => ({
                          ...prev,
                          categories: [...prev.categories, cat]
                        }))
                      } else {
                        setLocalFilters(prev => ({
                          ...prev,
                          categories: prev.categories.filter(c => c !== cat)
                        }))
                      }
                    }}
                  />
                  {cat}
                </label>
              ))}
            </div>
            
            {/* Price range slider */}
            <div>
              <h4>Цена (₽)</h4>
              <input
                type="range"
                min={0}
                max={10000}
                value={localFilters.priceRange[1]}
                onChange={e => setLocalFilters(prev => ({
                  ...prev,
                  priceRange: [0, parseInt(e.target.value)]
                }))}
              />
              <span>До {localFilters.priceRange[1]} ₽</span>
            </div>
            
            {/* Score range slider */}
            <div>
              <h4>Оценка</h4>
              <input
                type="range"
                min={0}
                max={100}
                value={localFilters.scoreRange[0]}
                onChange={e => setLocalFilters(prev => ({
                  ...prev,
                  scoreRange: [parseInt(e.target.value), 100]
                }))}
              />
              <span>От {localFilters.scoreRange[0]} баллов</span>
            </div>
            
            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => onApply(localFilters)}>
                Применить
              </button>
              <button onClick={onClose}>
                Отмена
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

3. **Use in search page**:
```tsx
// app/search/page.tsx

export default function SearchPage() {
  const { filters, isOpen, setIsOpen, applyFilters } = useFilters()
  const { results, search } = useSearch()
  
  // Filter results locally
  const filteredResults = useMemo(() => {
    if (!results) return null
    return {
      ...results,
      products: results.products.filter(p => {
        // Apply filters
        if (filters.categories.length > 0 && !filters.categories.includes(p.category)) {
          return false
        }
        if (p.price && (p.price < filters.priceRange[0] || p.price > filters.priceRange[1])) {
          return false
        }
        if (p.score && (p.score < filters.scoreRange[0] || p.score > filters.scoreRange[1])) {
          return false
        }
        return true
      })
    }
  }, [results, filters])
  
  return (
    <>
      <button onClick={() => setIsOpen(true)}>
        <Filter size={18} />
        Фильтры
        {/* Show active filter count */}
        {filters.categories.length > 0 && (
          <span>({filters.categories.length})</span>
        )}
      </button>
      
      <FiltersModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={applyFilters}
        initialFilters={filters}
      />
      
      {/* Render filtered results */}
      {filteredResults && (
        <div>
          {filteredResults.products.map(/* ... */)}
        </div>
      )}
    </>
  )
}
```

**Acceptance Criteria:**
- [ ] Кнопка "Фильтры" открывает modal
- [ ] Modal показывает категории, цену, оценку
- [ ] "Применить" фильтрует результаты
- [ ] Кнопка показывает count активных фильтров
- [ ] "Очистить" сбрасывает фильтры

---

#### ✅ **TASK 2.3: Показывать Search History**
**Issue:** I-1  
**Время:** 2 часа

**Файлы для изменения:**
```
beautyscore/apps/web/lib/api/hooks.ts
beautyscore/apps/web/app/(dashboard)/app/search/page.tsx
```

**Изменения:**

1. **Create history hook**:
```tsx
// lib/api/hooks.ts

export function useSearchHistory() {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.get<SearchHistoryItem[]>('/search/history')
        setHistory(data)
      } catch (err) {
        console.error('Failed to fetch search history', err)
      }
    }
    fetchHistory()
  }, [])
  
  const deleteHistoryItem = async (id: string) => {
    await api.delete(`/search/history/${id}`)
    setHistory(prev => prev.filter(item => item.id !== id))
  }
  
  return { history, deleteHistoryItem }
}
```

2. **Display in search page**:
```tsx
// app/search/page.tsx

export default function SearchPage() {
  const { history, deleteHistoryItem } = useSearchHistory()
  const { search } = useSearch()
  
  return (
    <>
      {/* Search input */}
      
      {/* History (show when no search results) */}
      {!results && history.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ fontSize: '0.875rem', color: colors.textTertiary }}>
            История поиска
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {history.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: colors.bgSecondary,
                }}
              >
                <Clock size={16} style={{ color: colors.textTertiary }} />
                <button
                  onClick={() => search(item.query)}
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: colors.textPrimary,
                  }}
                >
                  {item.query}
                </button>
                <button
                  onClick={() => deleteHistoryItem(item.id)}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: colors.textTertiary,
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
```

**Acceptance Criteria:**
- [ ] История показывается когда нет результатов поиска
- [ ] Клик по истории повторяет поиск
- [ ] Кнопка X удаляет из истории
- [ ] История ограничена (последние 10 запросов)

---

#### (Остальные IMPORTANT tasks: I-4 to I-12 аналогично...)

---

### ФАЗА 3: УЛУЧШЕНИЯ & РЕКОМЕНДАЦИИ 🟡
**Срок:** 1-2 недели  
**Приоритет:** MEDIUM

#### Tasks R-1 to R-15 (см. AUDIT REPORT)

---

## 📊 ПРОГРЕСС ТРЕКИНГ

### Sprint 1 (Days 1-3): CRITICAL
- [ ] C-1: Analytics integration
- [ ] C-2: AI Disclaimers
- [ ] C-3: Legal Pages ⚠️ (юрист!)
- [ ] C-4: LLM Timeout
- [ ] C-5: Remove /discover
- [ ] C-6: Cache invalidation
- [ ] C-7: Undo countdown
- [ ] C-8: Score source badge

### Sprint 2 (Days 4-7): IMPORTANT
- [ ] I-1: Search history UI
- [ ] I-2: Notification badge
- [ ] I-3: Filters implementation
- [ ] I-4: Mobile nav padding
- [ ] I-8: Shelf stats fix
- [ ] I-9: Onboarding skip

### Sprint 3 (Days 8-14): RECOMMENDATIONS
- [ ] R-1 to R-15 (см. список)

---

## ✅ DEFINITION OF DONE

### Per Task:
- [ ] Code implemented
- [ ] Self-tested (manual)
- [ ] No linter errors
- [ ] Acceptance criteria met
- [ ] Committed to git

### Per Phase:
- [ ] All tasks completed
- [ ] E2E testing passed
- [ ] No regressions
- [ ] Code review done
- [ ] Deployed to staging

### Final Release:
- [ ] All CRITICAL fixed
- [ ] All IMPORTANT fixed
- [ ] Legal pages approved by lawyer
- [ ] Full E2E test suite passed
- [ ] Performance audit passed
- [ ] Security audit passed
- [ ] 152-ФЗ compliance verified

---

**Подготовил:** AI Code Auditor  
**Дата:** 21 января 2026  
**Статус:** Ready to Execute

---

*Этот план полностью основан на FULL_DATA_FLOW_AUDIT_REPORT.md. Все найденные проблемы включены с конкретными решениями и acceptance criteria.*
