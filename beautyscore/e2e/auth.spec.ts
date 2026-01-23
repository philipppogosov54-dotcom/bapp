import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.describe('Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register');
      await page.waitForTimeout(1000);
      
      // Check for registration page content
      const hasHeading = await page.getByText(/создайте аккаунт/i).isVisible().catch(() => false);
      const hasEmail = await page.getByText(/email/i).isVisible().catch(() => false);
      const hasOAuth = await page.getByRole('button', { name: /vk/i }).isVisible().catch(() => false);
      
      expect(hasHeading || hasEmail || hasOAuth).toBeTruthy();
    });

    test('should have email field', async ({ page }) => {
      await page.goto('/register');
      await page.waitForLoadState('networkidle');
      
      // Check for email field - case sensitive
      await expect(page.getByText('Email').first()).toBeVisible({ timeout: 5000 });
    });

    test('should have OAuth options', async ({ page }) => {
      await page.goto('/register');
      
      // Check OAuth buttons
      await expect(page.getByRole('button', { name: /vk id/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /яндекс/i })).toBeVisible();
    });
  });

  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login');
      
      // Check form elements - use exact match for main submit button
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/пароль/i)).toBeVisible();
      // Main submit button has exact text "Войти"
      await expect(page.getByRole('button', { name: 'Войти', exact: true })).toBeVisible();
    });

    test('should have link to registration', async ({ page }) => {
      await page.goto('/login');
      
      const registerLink = page.getByRole('link', { name: /зарегистрироваться|создать|register/i });
      await expect(registerLink).toBeVisible();
    });

    test('should have forgot password link', async ({ page }) => {
      await page.goto('/login');
      
      const forgotLink = page.getByRole('link', { name: /забыли|forgot/i });
      await expect(forgotLink).toBeVisible();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
      await page.goto('/login');
      
      await page.getByLabel(/email/i).fill('test@beautyscore.ru');
      await page.getByLabel(/пароль/i).fill('test123456');
      // Use exact match for submit button
      await page.getByRole('button', { name: 'Войти', exact: true }).click();
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/\/app/, { timeout: 15000 });
    });
  });

  test.describe('OAuth Buttons', () => {
    test('should display OAuth options on login', async ({ page }) => {
      await page.goto('/login');
      
      // Check VK and Yandex OAuth buttons
      const vkButton = page.getByRole('button', { name: /vk/i });
      const yandexButton = page.getByRole('button', { name: /яндекс/i });
      
      // At least one OAuth option should be visible
      const hasOAuth = await vkButton.isVisible() || await yandexButton.isVisible();
      expect(hasOAuth).toBeTruthy();
    });
  });
});
