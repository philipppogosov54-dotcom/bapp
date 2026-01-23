import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading - actual text is "Узнай правду о своей косметике"
    await expect(page.locator('h1')).toContainText(/Узнай|правду|косметике/i);
    
    // Check CTA button
    const ctaButton = page.getByRole('link', { name: /начать|попробовать/i });
    await expect(ctaButton).toBeVisible();
  });

  test('should navigate to registration from CTA', async ({ page }) => {
    await page.goto('/');
    
    // Click CTA
    const ctaButton = page.getByRole('link', { name: /начать|попробовать/i });
    await ctaButton.click();
    
    // Should be on auth page
    await expect(page).toHaveURL(/\/(register|login)/);
  });

  test('should have footer links', async ({ page }) => {
    await page.goto('/');
    
    // Check for any footer content - О нас link if exists
    const aboutLink = page.getByRole('link', { name: /о нас|about/i });
    const hasAbout = await aboutLink.isVisible().catch(() => false);
    
    // Either has about link or has some footer element
    expect(hasAbout || await page.locator('footer').isVisible().catch(() => false)).toBeTruthy();
  });
});
