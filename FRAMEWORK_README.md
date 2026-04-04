# 🎭 UNIVERSAL PLAYWRIGHT TEST FRAMEWORK

A comprehensive, production-ready testing framework for **all types of testing** (UI, API, Integration, Security, Performance) with complete coverage of **positive, negative, and edge cases**.

## 📋 Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Test Types](#test-types)
- [Framework Components](#framework-components)
- [Usage Examples](#usage-examples)
- [Best Practices](#best-practices)
- [Configuration](#configuration)
- [Running Tests](#running-tests)

## ✨ Features

### Complete Test Coverage
- ✅ **Positive Test Cases** - Happy path testing
- ✅ **Negative Test Cases** - Invalid input handling
- ✅ **Edge Case Testing** - Boundary conditions, special characters, etc.
- ✅ **Security Testing** - XSS, SQL Injection, CSRF prevention
- ✅ **Performance Testing** - Load times, response times
- ✅ **API Testing** - REST endpoint validation
- ✅ **Form Validation** - Input validation testing
- ✅ **Data Integrity** - Concurrent modifications, persistence

### Reusable Components
- 📦 **Page Object Model** - Maintainable UI automation
- 🧪 **Test Data Generators** - Automatic test data creation
- 🔧 **Custom Assertions** - Domain-specific validations
- 📊 **Data Validators** - Input validation utilities
- 🛠️ **Test Helpers** - Common test operations

### Advanced Features
- 🔄 **Retry Logic** - Automatic retry with exponential backoff
- 📸 **Screenshot Capture** - Visual regression testing
- 🎥 **Video Recording** - Test execution videos
- 📝 **Test Reporting** - Detailed test reports
- 🔐 **Security Testing** - Built-in security test cases
- 🚀 **Performance Monitoring** - Response time tracking

## 🚀 Installation

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Setup

```bash
# Clone repository
git clone https://github.com/Hxrathna/GIT-Project-Test.git
cd GIT-Project-Test

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Configure environment (optional)
cp .env.example .env
```

## 🎯 Quick Start

### 1. Run All Tests
```bash
# Run all tests
npx playwright test

# Run tests in specific environment
ENV=dev npx playwright test
ENV=staging npx playwright test
ENV=production npx playwright test
```

### 2. Run Specific Test Types
```bash
# Positive test cases only
npx playwright test -g "Positive Test Cases"

# Negative test cases only
npx playwright test -g "Negative Test Cases"

# Edge case tests only
npx playwright test -g "Edge Case Test Cases"

# API tests only
npx playwright test -g "API Testing"

# Security tests only
npx playwright test -g "Security Testing"
```

### 3. Run Tests in Different Modes
```bash
# Headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug

# Slow motion (slow down actions)
npx playwright test --slow-mo=1000
```

## 📚 Test Types

### 1. POSITIVE TEST CASES ✅
Tests the happy path and valid scenarios.

```typescript
test('POS-001: Login with valid credentials', async ({ page }) => {
  const basePage = new BasePage(page);
  
  await basePage.goto('/login');
  await basePage.fillField('[data-testid="email"]', 'user@example.com');
  await basePage.fillField('[data-testid="password"]', 'SecurePass123!');
  await basePage.click('[data-testid="submit"]');
  
  // Should see success message
  await CustomAssertions.assertSuccessMessage(page, 'Login successful');
});
```

### 2. NEGATIVE TEST CASES ❌
Tests invalid inputs and error handling.

```typescript
test('NEG-001: Login with invalid email', async ({ page }) => {
  const basePage = new BasePage(page);
  
  await basePage.goto('/login');
  await basePage.fillField('[data-testid="email"]', 'invalid-email');
  await basePage.fillField('[data-testid="password"]', 'password123');
  await basePage.click('[data-testid="submit"]');
  
  // Should see validation error
  const errors = await basePage.getFormErrors();
  expect(errors.length).toBeGreaterThan(0);
});
```

### 3. EDGE CASE TESTS 🔐
Tests boundary conditions, special characters, etc.

```typescript
test('EDGE-001: Login with XSS payload', async ({ page }) => {
  const basePage = new BasePage(page);
  
  const xssPayload = '<script>alert("xss")</script>';
  
  await basePage.goto('/login');
  await basePage.fillField('[data-testid="email"]', xssPayload);
  await basePage.click('[data-testid="submit"]');
  
  // Should handle safely without executing script
  const scriptExecuted = await page.evaluate(() => (window as any).xssExecuted);
  expect(scriptExecuted).toBe(false);
});
```

### 4. API TESTING 🌐
Tests REST endpoints with various scenarios.

```typescript
test('API-001: Create user with valid data', async ({ request }) => {
  const client = new ApiClient(request, config.apiUrl);
  
  const response = await client.post('/users', {
    email: 'user@example.com',
    name: 'John Doe',
    age: 25
  });
  
  expect(response.status()).toBe(201);
  const data = await response.json();
  expect(data).toHaveProperty('id');
});
```

## 🏗️ Framework Components

### TestDataGenerator
Generates positive, negative, and edge case test data automatically.

```typescript
// Generate positive test data
const positiveData = TestDataGenerator.generatePositiveData();

// Generate negative test data
const negativeMatrix = TestDataGenerator.generateTestMatrix(TestType.NEGATIVE);

// Generate random test data
const randomEmail = TestDataGenerator.generateRandomEmail();
const randomId = TestDataGenerator.generateRandomId();
```

### CustomAssertions
Domain-specific assertion helpers.

```typescript
// Assert element state
await CustomAssertions.assertElementState(page, '.button', 'enabled');

// Assert messages
await CustomAssertions.assertErrorMessage(page, 'Invalid email');
await CustomAssertions.assertSuccessMessage(page, 'Success');

// Assert form validation
await CustomAssertions.assertFormValidation(page, 'form', true);

// Assert API response
CustomAssertions.assertResponseStructure(data, ['id', 'email', 'name']);
```

### BasePage
Base class for Page Object Model pattern.

```typescript
class LoginPage extends BasePage {
  async login(email: string, password: string) {
    await this.fillField('[data-testid="email"]', email);
    await this.fillField('[data-testid="password"]', password);
    await this.click('[data-testid="submit"]');
  }
}

// Usage
const loginPage = new LoginPage(page);
await loginPage.goto('/login');
await loginPage.login('user@example.com', 'password123');
```

### ApiClient
Handles API requests with authentication and headers.

```typescript
const client = new ApiClient(request, config.apiUrl);

// Set authentication
client.setToken('your-auth-token');

// Make requests
const getResponse = await client.get('/users/1');
const postResponse = await client.post('/users', userData);
const putResponse = await client.put('/users/1', updatedData);
const deleteResponse = await client.delete('/users/1');

// Validate response
await client.validateResponse(getResponse, 200, ['id', 'email']);
```

### DataValidator
Validates various data formats.

```typescript
// Email validation
DataValidator.isValidEmail('user@example.com'); // true
DataValidator.isValidEmail('invalid-email'); // false

// Password strength
DataValidator.isValidPassword('SecurePass123!'); // true
DataValidator.isValidPassword('weak'); // false

// URL validation
DataValidator.isValidUrl('https://example.com'); // true

// Security checks
DataValidator.hasXSSVulnerability('<script>alert(1)</script>'); // true
DataValidator.hasSQLInjectionVulnerability("' OR '1'='1"); // true
```

### TestHelper
Common test execution helpers.

```typescript
// Execute step with error handling
await TestHelper.executeStep('Login', async () => {
  await basePage.login('user@example.com', 'password');
});

// Retry with automatic retry logic
await TestHelper.retryStep('Click button', async () => {
  await basePage.click('.button');
}, 3);

// Wait for condition
await TestHelper.waitForCondition(async () => {
  const text = await page.textContent('.message');
  return text?.includes('Success');
}, 5000);
```

## 💡 Usage Examples

### Example 1: Login Flow Testing

```typescript
test('Complete login flow', async ({ page }) => {
  const basePage = new BasePage(page);

  // Step 1: Navigate to login
  await TestHelper.executeStep('Navigate to login page', async () => {
    await basePage.goto('/login');
  });

  // Step 2: Fill form with positive data
  const testData = TestDataGenerator.generatePositiveData();

  await TestHelper.executeStep('Fill login form', async () => {
    await basePage.fillField('[data-testid="email"]', testData.email);
    await basePage.fillField('[data-testid="password"]', testData.password);
  });

  // Step 3: Submit form
  await TestHelper.executeStep('Submit form', async () => {
    await basePage.submitForm('form');
  });

  // Step 4: Verify success
  await TestHelper.executeStep('Verify login success', async () => {
    await CustomAssertions.assertSuccessMessage(page, 'Login successful');
  });
});
```

### Example 2: API Testing with Different Scenarios

```typescript
test('User creation - Complete coverage', async ({ request }) => {
  const client = new ApiClient(request, config.apiUrl);
  
  // Positive case
  const positiveResponse = await client.post('/users', {
    email: 'user@example.com',
    name: 'John Doe',
    age: 25
  });
  expect(positiveResponse.status()).toBe(201);

  // Negative case
  const negativeResponse = await client.post('/users', {
    email: 'invalid-email',
    name: 'John Doe',
    age: 25
  });
  expect([400, 422]).toContain(negativeResponse.status());

  // Edge case
  const edgeResponse = await client.post('/users', {
    email: '<script>alert(1)</script>',
    name: 'x'.repeat(1000),
    age: 999
  });
  expect([200, 400]).toContain(edgeResponse.status());
});
```

### Example 3: Form Validation Testing

```typescript
test('Form validation - All inputs', async ({ page }) => {
  const basePage = new BasePage(page);
  const negativeData = TestDataGenerator.generateNegativeData();

  await basePage.goto('/signup');

  // Test each invalid email
  for (const invalidEmail of negativeData.emails) {
    await basePage.fillField('[name="email"]', invalidEmail);
    await basePage.submitForm('form');

    const errors = await basePage.getFormErrors();
    expect(errors.length).toBeGreaterThan(0);
  }

  // Test boundary values
  const boundaryData = TestDataGenerator.generateEdgeCaseData().boundaryValues;
  await basePage.fillField('[name="amount"]', String(boundaryData.maxInt));
  await basePage.submitForm('form');
  
  const isValid = await page.evaluate(() => 
    document.querySelector('form')?.checkValidity?.() ?? false
  );
  expect(isValid).toBe(true);
});
```

## 🎓 Best Practices

### 1. Use Page Object Model
```typescript
// ❌ Don't do this in tests
await page.fill('[name="email"]', 'user@example.com');
await page.fill('[name="password"]', 'password');

// ✅ Do this instead
const loginPage = new LoginPage(page);
await loginPage.login('user@example.com', 'password');
```

### 2. Use Test Data Generators
```typescript
// ❌ Don't hardcode test data
const testUsers = [
  { email: 'user1@example.com', password: 'Pass123!' },
  { email: 'user2@example.com', password: 'Pass123!' }
];

// ✅ Generate test data automatically
const testMatrix = TestDataGenerator.generateTestMatrix(TestType.POSITIVE);
```

### 3. Use Proper Waits
```typescript
// ❌ Don't use fixed delays
await page.waitForTimeout(5000);

// ✅ Wait for specific conditions
await WaitHelper.waitForElement(page, '.success-message', 5000);
await WaitHelper.waitUntil(async () => {
  const text = await page.textContent('.message');
  return text?.includes('Success');
}, 5000);
```

### 4. Use Descriptive Test Names
```typescript
// ❌ Don't do this
test('test 1', async () => {
  // ...
});

// ✅ Do this instead
test('POS-001: Login with valid email and password should redirect to dashboard', async () => {
  // ...
});
```

### 5. Create Page Objects for Complex Pages
```typescript
class DashboardPage extends BasePage {
  async clickUserMenu() {
    await this.click('.user-menu');
  }

  async logout() {
    await this.click('[data-testid="logout"]');
  }

  async getUsername(): Promise<string> {
    return await this.getText('.username');
  }
}
```

## 🔧 Configuration

### Environment Variables
Create `.env` file:

```env
# Environment selection (dev, staging, production)
ENV=dev

# Browser configuration
HEADLESS=true
SLOW_MO=0
PARALLEL=4

# Timeout settings
TIMEOUT=30000
NAVIGATION_TIMEOUT=30000

# Server configuration
BASE_URL=http://localhost:3000
API_URL=http://localhost:3001/api
```

### playwright.config.ts
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
});
```

## ▶️ Running Tests

### Run All Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
npx playwright test universal-test-framework.spec.ts
```

### Run Tests Matching Pattern
```bash
npx playwright test -g "Positive Test Cases"
```

### Run Tests in Different Modes
```bash
# Debug mode
npx playwright test --debug

# Headed mode
npx playwright test --headed

# With specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Generate Reports
```bash
# HTML report
npx playwright test --reporter=html

# View report
npx playwright show-report
```

## 📊 Test Statistics

This framework covers:

- **50+** Test cases per test type (Positive, Negative, Edge)
- **100+** Reusable test utilities
- **25+** Custom assertions
- **10+** Page Object examples
- **15+** API test scenarios
- **20+** Security test cases
- **30+** Data validation scenarios

## 🤝 Contributing

To add new tests or utilities:

1. Create tests in appropriate test file
2. Follow naming convention: `{TYPE}-{NUMBER}: {Description}`
3. Use reusable utilities and helpers
4. Add documentation for new components

## 📝 License

MIT License - feel free to use in your projects!

## 🆘 Support

For issues or questions:
1. Check existing documentation
2. Review example tests
3. Check GitHub issues
4. Create a new issue with detailed information

---

**Happy Testing! 🎉**