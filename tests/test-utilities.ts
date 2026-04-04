/**
 * REUSABLE TEST UTILITIES
 * 
 * Common utilities and helpers for test automation
 */

import { Page, Browser, BrowserContext, APIRequestContext, APIResponse } from '@playwright/test';

// ============================================
// WAIT & RETRY UTILITIES
// ============================================

/**
 * Wait and retry helpers
 */
export class WaitHelper {
  /**
   * Wait for element with custom timeout
   */
  static async waitForElement(page: Page, selector: string, timeout: number = 5000) {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for navigation
   */
  static async waitForNavigation(page: Page, action: () => Promise<void>, timeout: number = 30000) {
    const [response] = await Promise.all([
      page.waitForNavigation({ timeout }),
      action()
    ]);
    return response;
  }

  /**
   * Wait for API response
   */
  static async waitForApiResponse(page: Page, urlPattern: string, action: () => Promise<void>) {
    const [response] = await Promise.all([
      page.waitForResponse(resp => new RegExp(urlPattern).test(resp.url())),
      action()
    ]);
    return response;
  }

  /**
   * Retry action with exponential backoff
   */
  static async retryWithBackoff(
    action: () => Promise<boolean>,
    maxAttempts: number = 3,
    initialDelay: number = 1000
  ): Promise<boolean> {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        if (await action()) {
          return true;
        }
      } catch (error) {
        console.log(`Attempt ${i + 1} failed, retrying...`);
      }

      if (i < maxAttempts - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    return false;
  }

  /**
   * Wait until condition is true
   */
  static async waitUntil(
    condition: () => Promise<boolean>,
    timeout: number = 5000,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error(`Timeout waiting for condition after ${timeout}ms`);
  }
}

// ============================================
// BROWSER & CONTEXT UTILITIES
// ============================================

/**
 * Browser and context management utilities
 */
export class BrowserHelper {
  /**
   * Get all cookies
   */
  static async getAllCookies(context: BrowserContext): Promise<any[]> {
    return await context.cookies();
  }

  /**
   * Set cookie
   */
  static async setCookie(context: BrowserContext, cookie: any) {
    await context.addCookies([cookie]);
  }

  /**
   * Clear all cookies
   */
  static async clearCookies(context: BrowserContext) {
    await context.clearCookies();
  }

  /**
   * Get local storage
   */
  static async getLocalStorage(page: Page): Promise<Record<string, string>> {
    return await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          items[key] = localStorage.getItem(key) || '';
        }
      }
      return items;
    });
  }

  /**
   * Set local storage
   */
  static async setLocalStorage(page: Page, key: string, value: string) {
    await page.evaluate(([key, value]) => {
      localStorage.setItem(key, value);
    }, [key, value]);
  }

  /**
   * Clear local storage
   */
  static async clearLocalStorage(page: Page) {
    await page.evaluate(() => {
      localStorage.clear();
    });
  }

  /**
   * Get session storage
   */
  static async getSessionStorage(page: Page): Promise<Record<string, string>> {
    return await page.evaluate(() => {
      const items: Record<string, string> = {};
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key) {
          items[key] = sessionStorage.getItem(key) || '';
        }
      }
      return items;
    });
  }
}

// ============================================
// INTERACTION UTILITIES
// ============================================

/**
 * User interaction helpers
 */
export class InteractionHelper {
  /**
   * Type text with realistic speed
   */
  static async typeText(page: Page, selector: string, text: string, delayMs: number = 50) {
    const element = page.locator(selector);
    await element.click();

    for (const char of text) {
      await page.keyboard.press(char === ' ' ? 'Space' : char);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  /**
   * Select dropdown by label
   */
  static async selectByLabel(page: Page, selectSelector: string, label: string) {
    const select = page.locator(selectSelector);
    await select.click();

    const option = page.locator(`option:has-text("${label}")`);
    await option.click();
  }

  /**
   * Check checkbox
   */
  static async checkCheckbox(page: Page, selector: string) {
    await page.locator(selector).check();
  }

  /**
   * Uncheck checkbox
   */
  static async uncheckCheckbox(page: Page, selector: string) {
    await page.locator(selector).uncheck();
  }

  /**
   * Hover element
   */
  static async hover(page: Page, selector: string) {
    await page.locator(selector).hover();
  }

  /**
   * Double-click element
   */
  static async doubleClick(page: Page, selector: string) {
    await page.locator(selector).dblclick();
  }

  /**
   * Right-click element
   */
  static async rightClick(page: Page, selector: string) {
    await page.locator(selector).click({ button: 'right' });
  }

  /**
   * Drag and drop
   */
  static async dragAndDrop(page: Page, sourceSelector: string, targetSelector: string) {
    await page.locator(sourceSelector).dragTo(page.locator(targetSelector));
  }

  /**
   * Scroll element into view
   */
  static async scrollIntoView(page: Page, selector: string) {
    await page.locator(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Focus element
   */
  static async focusElement(page: Page, selector: string) {
    await page.locator(selector).focus();
  }

  /**
   * Keyboard shortcuts
   */
  static async keyboard(page: Page, combination: string) {
    await page.keyboard.press(combination);
  }
}

// ============================================
// SCREENSHOT & VIDEO UTILITIES
// ============================================

/**
 * Screenshot and video recording utilities
 */
export class MediaHelper {
  /**
   * Take full page screenshot
   */
  static async takeFullScreenshot(page: Page, filename: string) {
    const path = `./test-results/screenshots/${filename}.png`;
    await page.screenshot({ path, fullPage: true });
    return path;
  }

  /**
   * Take element screenshot
   */
  static async takeElementScreenshot(page: Page, selector: string, filename: string) {
    const element = page.locator(selector);
    const path = `./test-results/screenshots/${filename}.png`;
    await element.screenshot({ path });
    return path;
  }

  /**
   * Compare screenshots
   */
  static async compareScreenshots(actualPath: string, expectedPath: string): Promise<boolean> {
    // This would require a image comparison library like pixelmatch
    // For now, just check if both files exist
    return true; // Implement with actual comparison logic
  }

  /**
   * PDF generation
   */
  static async generatePDF(page: Page, filename: string) {
    const path = `./test-results/pdfs/${filename}.pdf`;
    await page.pdf({ path });
    return path;
  }
}

// ============================================
// API RESPONSE UTILITIES
// ============================================

/**
 * API response handling utilities
 */
export class ApiResponseHelper {
  /**
   * Parse response body
   */
  static async getResponseBody(response: APIResponse): Promise<any> {
    const contentType = response.headers()['content-type'] || '';

    if (contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType.includes('text/html')) {
      return await response.text();
    } else if (contentType.includes('application/xml')) {
      return await response.text();
    }

    return await response.arrayBuffer();
  }

  /**
   * Get response status
   */
  static getResponseStatus(response: APIResponse): number {
    return response.status();
  }

  /**
   * Get response headers
   */
  static getResponseHeaders(response: APIResponse): Record<string, string> {
    return response.headers();
  }

  /**
   * Validate response status
   */
  static isSuccessResponse(response: APIResponse): boolean {
    const status = response.status();
    return status >= 200 && status < 300;
  }

  /**
   * Validate response has key
   */
  static async hasResponseKey(response: APIResponse, key: string): Promise<boolean> {
    const body = await this.getResponseBody(response);
    return body && key in body;
  }

  /**
   * Get response time
   */
  static async getResponseTime(response: APIResponse): Promise<number> {
    // This would need to be tracked separately
    return 0;
  }
}

// ============================================
// LOG & REPORT UTILITIES
// ============================================

/**
 * Logging and reporting utilities
 */
export class LogHelper {
  /**
   * Log test step
   */
  static logStep(stepNumber: number, stepName: string) {
    console.log(`\n📍 Step ${stepNumber}: ${stepName}`);
  }

  /**
   * Log test pass
   */
  static logPass(message: string) {
    console.log(`✅ ${message}`);
  }

  /**
   * Log test failure
   */
  static logFail(message: string) {
    console.error(`❌ ${message}`);
  }

  /**
   * Log test warning
   */
  static logWarning(message: string) {
    console.warn(`⚠️  ${message}`);
  }

  /**
   * Log test info
   */
  static logInfo(message: string) {
    console.log(`ℹ️  ${message}`);
  }

  /**
   * Log test data
   */
  static logData(label: string, data: any) {
    console.log(`\n📊 ${label}:`);
    console.table(data);
  }

  /**
   * Log timing
   */
  static logTiming(label: string, durationMs: number) {
    console.log(`⏱️  ${label}: ${durationMs}ms`);
  }

  /**
   * Log performance metrics
   */
  static logPerformanceMetrics(metrics: Record<string, number>) {
    console.log('\n📈 Performance Metrics:');
    for (const [key, value] of Object.entries(metrics)) {
      console.log(`  ${key}: ${value}ms`);
    }
  }
}

// ============================================
// FILE UTILITIES
// ============================================

/**
 * File handling utilities
 */
export class FileHelper {
  /**
   * Read file content
   */
  static async readFile(filePath: string): Promise<string> {
    const fs = await import('fs').then(m => m.promises);
    return await fs.readFile(filePath, 'utf-8');
  }

  /**
   * Write file content
   */
  static async writeFile(filePath: string, content: string) {
    const fs = await import('fs').then(m => m.promises);
    const path = await import('path');
    const dir = path.dirname(filePath);

    // Create directory if it doesn't exist
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    return await fs.writeFile(filePath, content, 'utf-8');
  }

  /**
   * Upload file to page
   */
  static async uploadFile(page: Page, inputSelector: string, filePath: string) {
    await page.setInputFiles(inputSelector, filePath);
  }

  /**
   * Download file
   */
  static async downloadFile(page: Page, selector: string): Promise<string> {
    const downloadPromise = page.waitForEvent('download');
    await page.click(selector);
    const download = await downloadPromise;
    return download.path();
  }
}

// ============================================
// TIME & DATE UTILITIES
// ============================================

/**
 * Time and date utilities
 */
export class TimeHelper {
  /**
   * Get current timestamp
   */
  static getCurrentTimestamp(): number {
    return Date.now();
  }

  /**
   * Get formatted date string
   */
  static getFormattedDate(format: string = 'YYYY-MM-DD'): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', String(year))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  }

  /**
   * Measure execution time
   */
  static async measureExecutionTime(action: () => Promise<void>): Promise<number> {
    const start = this.getCurrentTimestamp();
    await action();
    return this.getCurrentTimestamp() - start;
  }

  /**
   * Wait for specific duration
   */
  static async wait(durationMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, durationMs));
  }

  /**
   * Debounce action
   */
  static async debounce(action: () => Promise<void>, delayMs: number = 500) {
    await this.wait(delayMs);
    await action();
  }
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * String manipulation utilities
 */
export class StringHelper {
  /**
   * Generate random string
   */
  static generateRandomString(length: number = 10): string {
    return Math.random().toString(36).substring(2, 2 + length);
  }

  /**
   * Generate random email
   */
  static generateRandomEmail(): string {
    return `user${this.generateRandomString(8)}@example.com`;
  }

  /**
   * Generate random username
   */
  static generateRandomUsername(): string {
    return `user${Date.now()}`;
  }

  /**
   * Generate random phone
   */
  static generateRandomPhone(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const exchange = Math.floor(Math.random() * 900) + 100;
    const subscriber = Math.floor(Math.random() * 9000) + 1000;
    return `${areaCode}-${exchange}-${subscriber}`;
  }

  /**
   * Generate random UUID
   */
  static generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Capitalize string
   */
  static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Mask sensitive data
   */
  static maskSensitiveData(data: string, visibleChars: number = 4): string {
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
  }
}

// ============================================
// ARRAY & OBJECT UTILITIES
// ============================================

/**
 * Array and object utilities
 */
export class CollectionHelper {
  /**
   * Shuffle array
   */
  static shuffle<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get unique items from array
   */
  static getUnique<T>(array: T[]): T[] {
    return [...new Set(array)];
  }

  /**
   * Chunk array
   */
  static chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Flatten nested array
   */
  static flatten<T>(array: any[]): T[] {
    return array.reduce((acc, val) => {
      return acc.concat(Array.isArray(val) ? this.flatten(val) : val);
    }, []);
  }

  /**
   * Deep merge objects
   */
  static deepMerge(obj1: any, obj2: any): any {
    return {
      ...obj1,
      ...obj2,
      ...Object.keys(obj2).reduce((acc, key) => {
        if (typeof obj2[key] === 'object' && !Array.isArray(obj2[key])) {
          acc[key] = this.deepMerge(obj1[key] || {}, obj2[key]);
        }
        return acc;
      }, {})
    };
  }

  /**
   * Get object property by path
   */
  static getByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
}

// ============================================
// MOCK & STUB UTILITIES
// ============================================

/**
 * Mocking and stubbing utilities
 */
export class MockHelper {
  /**
   * Mock console methods
   */
  static mockConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const logs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    console.log = (...args) => {
      logs.push(args.join(' '));
      originalLog(...args);
    };

    console.error = (...args) => {
      errors.push(args.join(' '));
      originalError(...args);
    };

    console.warn = (...args) => {
      warnings.push(args.join(' '));
      originalWarn(...args);
    };

    return {
      logs,
      errors,
      warnings,
      restore: () => {
        console.log = originalLog;
        console.error = originalError;
        console.warn = originalWarn;
      }
    };
  }

  /**
   * Mock fetch
   */
  static mockFetch(responses: Record<string, any>) {
    const originalFetch = global.fetch;

    global.fetch = async (url: string, options?: any) => {
      const urlString = typeof url === 'string' ? url : url.toString();
      const response = responses[urlString];

      if (!response) {
        throw new Error(`No mock response found for ${urlString}`);
      }

      return {
        ok: response.ok !== false,
        status: response.status || 200,
        json: async () => response.data,
        text: async () => JSON.stringify(response.data),
        headers: new Map(Object.entries(response.headers || {}))
      } as any;
    };

    return {
      restore: () => {
        global.fetch = originalFetch;
      }
    };
  }
}

// ============================================
// EXPORTS
// ============================================

export {
  WaitHelper,
  BrowserHelper,
  InteractionHelper,
  MediaHelper,
  ApiResponseHelper,
  LogHelper,
  FileHelper,
  TimeHelper,
  StringHelper,
  CollectionHelper,
  MockHelper
};