import { test, expect } from '@playwright/test';

test('Inspect Login Page Elements', async ({ page }) => {
  // Go to login page
  await page.goto('https://practicetestautomation.com/practice-test-login/');

  // Try valid login
  await page.fill('#username', 'tomsmith');
  await page.fill('#password', 'SuperSecretPassword!');
  await page.click('#submit');

  // Wait and inspect the page
  await page.waitForTimeout(2000);

  console.log('Current URL:', page.url());

  // Get all text content from the page
  const pageText = await page.textContent('body');
  console.log('Page text content:', pageText?.substring(0, 500));

  // Try to find success/error messages
  const flashElement = page.locator('#flash');
  if (await flashElement.isVisible()) {
    const flashText = await flashElement.textContent();
    console.log('Flash message:', flashText);
  }

  // Look for any h1, h2, or success indicators
  const headings = page.locator('h1, h2, .post-title');
  const headingCount = await headings.count();
  for (let i = 0; i < headingCount; i++) {
    const text = await headings.nth(i).textContent();
    console.log(`Heading ${i}:`, text);
  }

  // Check for logout button or success indicators
  const logoutButton = page.locator('text=/log out/i');
  if (await logoutButton.isVisible()) {
    console.log('Logout button found');
  }
});