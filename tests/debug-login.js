const { chromium } = require('playwright');

async function debugLogin() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    console.log('Going to login page...');
    await page.goto('https://practicetestautomation.com/practice-test-login/');

    // Get the HTML structure around the form area
    const formArea = await page.$('.login-form, form, #login-form');
    if (formArea) {
      const html = await formArea.innerHTML();
      console.log('Form area HTML:', html.substring(0, 500));
    } else {
      console.log('No form area found, checking entire body...');
      const bodyHtml = await page.innerHTML('body');
      console.log('Body HTML (first 1000 chars):', bodyHtml.substring(0, 1000));
    }

    // Check for input fields
    const inputs = await page.$$('input');
    console.log('Found', inputs.length, 'input elements:');
    for (let input of inputs) {
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const type = await input.getAttribute('type');
      console.log(`Input: id=${id}, name=${name}, type=${type}`);
    }

    // Check for buttons
    const buttons = await page.$$('button, input[type="submit"]');
    console.log('Found', buttons.length, 'button elements:');
    for (let button of buttons) {
      const id = await button.getAttribute('id');
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      console.log(`Button: id=${id}, text=${text}, type=${type}`);
    }

    console.log('Testing valid credentials...');
    await page.fill('#username', 'tomsmith');
    await page.fill('#password', 'SuperSecretPassword!');

    // Try different ways to submit
    console.log('Trying to click submit button...');
    await page.click('#submit');

    // Wait and check what happens
    await page.waitForTimeout(2000);

    console.log('URL after submit:', page.url());

    // Check if any new elements appeared
    const flashAfter = await page.$('#flash, .flash, .alert, .error, .success');
    if (flashAfter) {
      const text = await flashAfter.textContent();
      console.log('Message element found after submit:', text);
    } else {
      console.log('No message element found after submit');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

debugLogin();