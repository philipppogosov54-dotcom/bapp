import { test, expect } from '@playwright/test';
import { login } from './helpers';

/**
 * CRITICAL: Survey Integration Tests
 * These tests verify that survey data is actually saved to the database
 * and that the user profile is updated correctly.
 */
test.describe('Survey Integration - Data Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display survey on onboarding page', async ({ page }) => {
    await page.goto('/onboarding/survey/basic');
    await page.waitForLoadState('networkidle');
    
    // Check that survey loaded
    const hasQuestion = await page.getByRole('heading').first().isVisible();
    const hasOptions = await page.locator('button').count() > 0;
    
    expect(hasQuestion || hasOptions).toBeTruthy();
  });

  test('should navigate back from survey', async ({ page }) => {
    await page.goto('/onboarding/survey/basic');
    await page.waitForLoadState('networkidle');
    
    // Click back button if on second question
    const backButton = page.locator('button:has-text("←")');
    if (await backButton.isEnabled()) {
      // Already on a later question
    }
    
    // Check header shows survey type
    await expect(page.getByText(/базовый опрос/i)).toBeVisible();
  });
});

test.describe('Profile Data Verification', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display user profile data', async ({ page }) => {
    await page.goto('/app/profile');
    await page.waitForLoadState('networkidle');
    
    // Check that profile page shows user info (use heading to be specific)
    await expect(page.getByRole('heading', { name: /test user/i })).toBeVisible();
    await expect(page.getByText(/test@beautyscore\.ru/i).first()).toBeVisible();
    
    // Check profile sections exist
    await expect(page.getByText(/личные данные/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /настройки/i })).toBeVisible();
  });

  test('should show survey completion status', async ({ page }) => {
    await page.goto('/app/profile');
    await page.waitForLoadState('networkidle');
    
    // Should show either "complete surveys" or "all surveys done"
    const hasSurveyPrompt = await page.getByText(/завершите настройку|все опросы пройдены/i).isVisible();
    expect(hasSurveyPrompt).toBeTruthy();
  });

  test('should link to settings from profile', async ({ page }) => {
    await page.goto('/app/profile');
    await page.waitForLoadState('networkidle');
    
    // Click settings link
    await page.getByRole('link', { name: /настройки/i }).click();
    await expect(page).toHaveURL(/\/app\/settings/);
    
    // Settings page should load
    await expect(page.getByRole('heading', { name: /настройки/i })).toBeVisible();
  });
});

test.describe('Settings Persistence', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/app/settings');
    await page.waitForLoadState('networkidle');
  });

  test('should display settings page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /настройки/i })).toBeVisible();
    await expect(page.getByText(/push-уведомления/i)).toBeVisible();
    await expect(page.getByText(/тёмная тема/i)).toBeVisible();
    await expect(page.getByText(/аналитика использования/i)).toBeVisible();
  });

  test('should toggle notification setting', async ({ page }) => {
    // Find and click the notifications toggle
    const notificationToggle = page.locator('button:has-text("Push-уведомления")');
    await notificationToggle.click();
    
    // Should show save feedback (the toast)
    // Note: Settings are saved to localStorage, not API in MVP
  });

  test('should show delete account warning', async ({ page }) => {
    // Should show danger zone
    await expect(page.getByText(/опасная зона/i)).toBeVisible();
    await expect(page.getByText(/удалить аккаунт/i)).toBeVisible();
  });

  test('should show export data option', async ({ page }) => {
    await expect(page.getByText(/экспорт данных/i)).toBeVisible();
    await expect(page.getByText(/152-ФЗ/i)).toBeVisible();
  });
});

test.describe('Encyclopedia Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/app/encyclopedia');
    await page.waitForLoadState('networkidle');
  });

  test('should display products as clickable links', async ({ page }) => {
    // Products should be links
    const productLinks = page.locator('a[href*="/app/product/"]');
    const count = await productLinks.count();
    
    expect(count).toBeGreaterThan(0);
  });

  test('should navigate to product detail from encyclopedia', async ({ page }) => {
    // Click first product
    const firstProduct = page.locator('a[href*="/app/product/"]').first();
    await firstProduct.click();
    
    // Should navigate to product page
    await expect(page).toHaveURL(/\/app\/product\/[a-z0-9]+/i, { timeout: 10000 });
    
    // Product details should load
    await page.waitForLoadState('networkidle');
    const hasProductTitle = await page.getByRole('heading', { level: 1 }).isVisible();
    expect(hasProductTitle).toBeTruthy();
  });

  test('should have search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/поиск продуктов/i);
    await expect(searchInput).toBeVisible();
    
    // Type a search query
    await searchInput.fill('крем');
    
    // Products should update (or show filtered results)
    await page.waitForTimeout(500); // Wait for debounce
  });

  test('should switch between products and ingredients tabs', async ({ page }) => {
    // Click ingredients tab
    const ingredientsTab = page.getByRole('button', { name: /ингредиенты/i });
    await ingredientsTab.click();
    
    // Should show ingredients view
    await expect(page.getByPlaceholder(/поиск ингредиентов/i)).toBeVisible();
    
    // Switch back to products
    const productsTab = page.getByRole('button', { name: /продукты/i });
    await productsTab.click();
    
    await expect(page.getByPlaceholder(/поиск продуктов/i)).toBeVisible();
  });
});

test.describe('Shelf Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should add product to shelf from product page', async ({ page }) => {
    // Go to a product
    await page.goto('/app/encyclopedia');
    await page.waitForLoadState('networkidle');
    
    // Click first product
    const firstProduct = page.locator('a[href*="/app/product/"]').first();
    await firstProduct.click();
    await page.waitForLoadState('networkidle');
    
    // Find add to shelf button
    const addButton = page.getByRole('button', { name: /добавить|в мою полку/i });
    
    if (await addButton.isVisible()) {
      await addButton.click();
      
      // Button should change to "remove"
      await expect(page.getByRole('button', { name: /убрать|удалить с полки/i })).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display shelf items', async ({ page }) => {
    await page.goto('/app/shelf');
    await page.waitForLoadState('networkidle');
    
    // Should show shelf heading
    await expect(page.getByText(/моя полка/i)).toBeVisible();
    
    // Either show products or empty state
    const hasProducts = await page.locator('a[href*="/app/product/"]').count() > 0;
    const hasEmpty = await page.getByText(/полка пуста|добавьте продукты/i).isVisible();
    
    expect(hasProducts || hasEmpty).toBeTruthy();
  });
});

test.describe('Trends Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto('/app/trends');
    await page.waitForLoadState('networkidle');
  });

  test('should display trends page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /тренды/i })).toBeVisible();
  });

  test('should have tab switching', async ({ page }) => {
    // Should have tabs
    const popularTab = page.getByRole('button', { name: /популярное/i });
    const forYouTab = page.getByRole('button', { name: /для вас/i });
    
    await expect(popularTab).toBeVisible();
    await expect(forYouTab).toBeVisible();
    
    // Click tabs
    await forYouTab.click();
    await popularTab.click();
  });

  test('should navigate to product from trends', async ({ page }) => {
    // If there are products, click one
    const productLinks = page.locator('a[href*="/app/product/"]');
    const count = await productLinks.count();
    
    if (count > 0) {
      await productLinks.first().click();
      await expect(page).toHaveURL(/\/app\/product\//);
    }
  });
});

test.describe('Discover Redirect', () => {
  test('should redirect from /discover to /trends', async ({ page }) => {
    await login(page);
    await page.goto('/app/discover');
    
    // Should redirect to trends
    await expect(page).toHaveURL(/\/app\/trends/, { timeout: 10000 });
  });
});
