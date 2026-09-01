import { test, expect } from '@playwright/test';

test.describe('Practice Loop', () => {
  test('Dashboard loads successfully', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check that we see the welcome text or dashboard indicators
    await expect(page.locator('text=Welcome')).toBeVisible();
    await expect(page.locator('text=Start Practice')).toBeVisible();
  });

  test('Full practice flow', async ({ page }) => {
    // 1. Start Session
    await page.goto('/dashboard');
    await page.click('button:has-text("Start Practice")');
    
    // Ensure we reached the practice page
    await expect(page).toHaveURL(/\/practice/);

    // 2. Read the Marathi prompt and fill in translation
    // Wait for the prompt bubble to appear
    await expect(page.locator('text=Translate this sentence:')).toBeVisible({ timeout: 10000 });
    
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    
    await textarea.fill('I am a test student translating a sentence.');

    // 3. Submit
    await page.click('button[aria-label="Submit answer"]');

    // 4. Verify evaluation (Mock Gemini returns Grade A)
    // Wait for evaluation card to render
    await expect(page.locator('text=अगदी बरोबर!')).toBeVisible({ timeout: 10000 });

    // 5. Click Next and verify transition
    await page.click('button:has-text("Next")');
    
    // We expect the textarea to be cleared and ready for the next exercise
    // or if the session is done, it transitions to summary.
    // For this test, we just check that the textarea is empty (ready for next) or we've been redirected to summary.
    const url = page.url();
    if (url.includes('/summary')) {
      await expect(page.locator('text=Session Complete')).toBeVisible();
    } else {
      await expect(textarea).toHaveValue('');
    }
  });
});
