import { test, expect } from '@playwright/test';

test('Check logout behavior', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  await page.fill('#username', 'tomsmith');
  await page.fill('#password', 'SuperSecretPassword!');
  await page.click('.radius');

  await page.waitForURL('**/secure');
  console.log('After login URL:', page.url());

  // Check if logout link exists
  const logoutLink = page.locator('a[href="/logout"]');
  if (await logoutLink.isVisible()) {
    console.log('Logout link found');
    await logoutLink.click();
  } else {
    console.log('Logout link not found, trying text=Logout');
    await page.click('text=Logout');
  }

  await page.waitForTimeout(2000);
  console.log('After logout URL:', page.url());

  const flashMessage = await page.textContent('#flash');
  console.log('Flash message after logout:', flashMessage);
});