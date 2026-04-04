const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

const testData = [
  {
    username: 'tomsmith',
    password: 'SuperSecretPassword!',
    expectedMessage: 'You logged into a secure area!'
  },
  {
    username: 'invalidUser',
    password: 'invalidPass',
    expectedMessage: 'Your username is invalid!'
  }
];

testData.forEach(({ username, password, expectedMessage }) => {

  test(`Login test for user: ${username}`, async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(username, password);

    await expect(page.locator('#flash')).toContainText(expectedMessage);
  });

});
