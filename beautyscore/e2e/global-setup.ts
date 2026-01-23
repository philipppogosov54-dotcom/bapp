import { chromium, FullConfig } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '.auth/user.json');

async function globalSetup(config: FullConfig) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Navigate to login page
  await page.goto('http://localhost:3000/login');
  
  // Fill in credentials
  await page.getByLabel(/email/i).fill('test@beautyscore.ru');
  await page.getByLabel(/пароль/i).fill('test123456');
  
  // Click login button (exact match)
  await page.getByRole('button', { name: 'Войти', exact: true }).click();
  
  // Wait for redirect to dashboard
  await page.waitForURL(/\/app/, { timeout: 10000 });
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
  
  await browser.close();
}

export default globalSetup;
