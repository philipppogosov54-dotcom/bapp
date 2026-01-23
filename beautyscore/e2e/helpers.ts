import { Page, expect } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('/login');
  
  // Fill credentials
  await page.getByLabel(/email/i).fill('test@beautyscore.ru');
  await page.getByLabel(/пароль/i).fill('test123456');
  
  // Click login button (exact match to avoid OAuth buttons)
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/app/, { timeout: 15000 });
}

export async function ensureLoggedIn(page: Page) {
  // Check if already on dashboard
  if (page.url().includes('/app') && !page.url().includes('/login')) {
    // Check if we have the sidebar (means we're logged in)
    const nav = page.locator('navigation, nav, [role="navigation"]');
    if (await nav.isVisible().catch(() => false)) {
      return;
    }
  }
  
  // Not logged in, perform login
  await login(page);
}
