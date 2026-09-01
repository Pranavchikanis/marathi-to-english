import { test as setup, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const authFile = 'tests/e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // We use Supabase Auth for the Next.js app.
  // Playwright needs to either perform a UI login or inject the storage state.
  // Since we rely on a seeded test user, we will perform a UI login.

  // Note: For the MVP we assume there's a test user seeded.
  // If the user doesn't exist, this step will fail, and we'd need to mock/seed it.
  
  await page.goto('/login');
  
  // Fill out the login form
  await page.fill('input[type="email"]', 'test_student@example.com');
  await page.fill('input[type="password"]', 'password123'); // Assume this is seeded
  await page.click('button[type="submit"]');

  // If there's an error, try to sign up
  const errorText = page.locator('.text-red-500');
  try {
    await errorText.waitFor({ timeout: 2000 });
    // User doesn't exist, sign up
    await page.fill('input[type="email"]', 'test_student@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign up")');
  } catch (e) {
    // No error, proceeded to dashboard
  }

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard');
  
  // Ensure the auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});
