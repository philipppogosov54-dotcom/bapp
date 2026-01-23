# PRD Traceability Matrix

This document links PRD requirements to their implementation and tests.

## Legend
- ✅ Implemented & Tested
- 🔨 Implemented, needs testing
- ⏳ In Progress
- ❌ Not Started
- 🚫 Blocked

---

## 1. Authentication & Authorization

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Email/Password Registration | ✅ | `apps/api/src/auth/auth.service.ts` | `e2e/auth.spec.ts` |
| Email Verification | 🔨 | `apps/api/src/auth/email.service.ts` | - |
| Phone Login (SMS) | 🔨 | `apps/api/src/auth/sms.service.ts` | - |
| OAuth (Yandex) | 🔨 | `apps/api/src/auth/auth.controller.ts` | - |
| OAuth (VK) | 🔨 | `apps/api/src/auth/auth.controller.ts` | - |
| Password Reset | 🔨 | `apps/api/src/auth/auth.service.ts` | - |
| JWT Tokens | ✅ | `apps/api/src/auth/auth.service.ts` | `e2e/auth.spec.ts` |
| Rate Limiting | 🔨 | `apps/api/src/common/guards/throttle.guard.ts` | - |
| Legal Consent | ✅ | `apps/web/app/(auth)/register/page.tsx` | - |

## 2. User Profile

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Profile View | ✅ | `apps/web/app/(dashboard)/app/profile/page.tsx` | - |
| Profile Edit | 🔨 | `apps/api/src/profile/profile.service.ts` | - |
| Data Export (152-ФЗ) | ✅ | `apps/api/src/profile/profile.service.ts` | - |
| Account Deletion (152-ФЗ) | ✅ | `apps/api/src/profile/profile.service.ts` | - |
| Undo Deletion (30 days) | 🔨 | `apps/api/src/profile/profile.service.ts` | - |

## 3. Surveys

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Basic Survey | ✅ | `apps/api/src/surveys/surveys.service.ts` | `e2e/survey-integration.spec.ts` |
| Dermatology Survey | ✅ | `apps/api/src/surveys/surveys.service.ts` | `e2e/survey-integration.spec.ts` |
| Trichology Survey | ✅ | `apps/api/src/surveys/surveys.service.ts` | `e2e/survey-integration.spec.ts` |
| Progress Tracking | ✅ | `apps/web/app/(dashboard)/app/profile/page.tsx` | - |
| Real-time Updates | ✅ | `apps/web/app/(dashboard)/app/profile/page.tsx` | - |
| Skip Option | ✅ | `apps/web/app/onboarding/survey/[type]/page.tsx` | - |
| System Prompt Generation | 🔨 | `apps/api/src/surveys/surveys.service.ts` | - |

## 4. Product Analysis

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Product Search | ✅ | `apps/api/src/search/search.service.ts` | `e2e/product.spec.ts` |
| Product Details | ✅ | `apps/api/src/products/products.service.ts` | `e2e/product.spec.ts` |
| Personalized Score | ✅ | `apps/api/src/products/products.service.ts` | - |
| General Score | ✅ | `apps/api/src/products/products.service.ts` | - |
| Score Source Badge | ✅ | `apps/web/app/(dashboard)/app/product/[id]/page.tsx` | - |
| Ingredient Analysis | 🔨 | `apps/api/src/products/products.service.ts` | - |
| AI Chat | 🔨 | `apps/api/src/products/products.service.ts` | - |

## 5. Shelf Management

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Add to Shelf | ✅ | `apps/api/src/shelf/shelf.service.ts` | `e2e/dashboard.spec.ts` |
| Remove from Shelf | ✅ | `apps/api/src/shelf/shelf.service.ts` | - |
| Undo Remove (30s) | ✅ | `apps/api/src/shelf/shelf.service.ts` | - |
| Visual Countdown | ✅ | `apps/web/app/(dashboard)/app/shelf/page.tsx` | - |
| Shelf Analysis (LLM) | ⏳ | `apps/api/src/shelf/shelf.service.ts` | - |
| Product Status | 🔨 | `apps/api/src/shelf/shelf.service.ts` | - |
| Unavailable Products | ✅ | `apps/api/src/shelf/shelf.service.ts` | - |

## 6. Trends & Recommendations

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Popular Products | ✅ | `apps/api/src/trends/trends.service.ts` | - |
| Personalized Recommendations | 🔨 | `apps/api/src/trends/trends.service.ts` | - |
| Trends Page | ✅ | `apps/web/app/(dashboard)/app/trends/page.tsx` | - |

## 7. Encyclopedia

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Product Catalog | ✅ | `apps/api/src/encyclopedia/encyclopedia.service.ts` | - |
| Ingredient Database | ✅ | `apps/api/src/encyclopedia/encyclopedia.service.ts` | - |
| Filters | 🔨 | `apps/web/app/(dashboard)/app/encyclopedia/page.tsx` | - |

## 8. Notifications

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Notification List | ✅ | `apps/api/src/notifications/notifications.service.ts` | - |
| Mark as Read | ✅ | `apps/api/src/notifications/notifications.service.ts` | - |
| Notification Settings | 🔨 | `apps/api/src/notifications/notifications.service.ts` | - |

## 9. Legal & Compliance (152-ФЗ)

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Privacy Policy | ✅ | `apps/web/app/privacy/page.tsx` | - |
| Terms of Use | ✅ | `apps/web/app/terms/page.tsx` | - |
| Cookie Policy | ✅ | `apps/web/app/cookies/page.tsx` | - |
| AI Disclaimers | ✅ | `apps/web/components/ui/disclaimer.tsx` | - |
| Consent Checkbox | ✅ | `apps/web/app/(auth)/register/page.tsx` | - |

## 10. UI/UX

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Error Boundaries | ✅ | `apps/web/app/error.tsx`, `apps/web/app/(dashboard)/error.tsx` | - |
| Loading States | ✅ | All pages | - |
| Skeleton Loaders | ✅ | `apps/web/components/ui/skeleton.tsx` | - |
| Mobile Bottom Nav | ✅ | `apps/web/components/ui/bottom-navigation.tsx` | - |
| Product Placeholders | ✅ | `apps/web/components/ui/product-placeholder.tsx` | - |

## 11. Performance & Optimization

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Request Deduplication | ✅ | `apps/web/lib/api/client.ts` | - |
| Optimistic Updates | ✅ | `apps/web/lib/api/hooks.ts` | - |
| Image Optimization | ✅ | `apps/web/components/ui/product-placeholder.tsx` | - |
| Query Truncation (500 chars) | ✅ | `apps/web/lib/api/hooks.ts` | - |

## 12. LLM Integration

| PRD Requirement | Status | Code Location | Test File |
|----------------|--------|---------------|-----------|
| Multi-provider Fallback | 🔨 | `apps/api/src/llm/llm.service.ts` | - |
| Response Caching | 🔨 | `apps/api/src/llm/llm.service.ts` | - |
| Timeout Handling | ⏳ | `apps/api/src/llm/llm.service.ts` | - |
| Context-aware Fallbacks | ⏳ | - | - |

---

## Summary

| Category | Total | ✅ Done | 🔨 Needs Test | ⏳ In Progress | ❌ Not Started |
|----------|-------|---------|---------------|----------------|----------------|
| Auth | 9 | 3 | 5 | 0 | 1 |
| Profile | 5 | 3 | 2 | 0 | 0 |
| Surveys | 7 | 5 | 1 | 0 | 1 |
| Products | 7 | 4 | 3 | 0 | 0 |
| Shelf | 7 | 5 | 1 | 1 | 0 |
| Trends | 3 | 2 | 1 | 0 | 0 |
| Encyclopedia | 3 | 2 | 1 | 0 | 0 |
| Notifications | 3 | 2 | 1 | 0 | 0 |
| Legal | 5 | 5 | 0 | 0 | 0 |
| UI/UX | 5 | 5 | 0 | 0 | 0 |
| Performance | 4 | 4 | 0 | 0 | 0 |
| LLM | 4 | 0 | 2 | 2 | 0 |
| **TOTAL** | **62** | **40 (65%)** | **17 (27%)** | **3 (5%)** | **2 (3%)** |

---

## Next Steps

1. **Priority 1**: Complete LLM timeout wrapper and fallback chain
2. **Priority 2**: Add E2E tests for auth flow
3. **Priority 3**: Implement filters modal for Search & Shelf
4. **Priority 4**: Add notification badge to navigation
5. **Priority 5**: Set up CI/CD pipeline

---

*Last updated: 2026-01-21*
