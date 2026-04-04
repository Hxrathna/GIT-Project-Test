import { test, expect } from '@playwright/test';

test('Check login URL', async ({ page }) => {
  await page.goto('https://the-internet.herokuapp.com/login');
  await page.fill('#username', 'tomsmith');
  await page.fill('#password', 'SuperSecretPassword!');
  await page.click('.radius');

  await page.waitForTimeout(2000);
  console.log('URL after login:', page.url());

  const flashMessage = await page.textContent('#flash');
  console.log('Flash message:', flashMessage);
});