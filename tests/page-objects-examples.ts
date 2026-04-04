/**
 * CUSTOM PAGE OBJECTS & TEST EXAMPLES
 * 
 * Examples of how to create custom Page Objects and use the framework
 * for specific products/features
 */

import { Page } from '@playwright/test';
import { BasePage } from './universal-test-framework.spec';

// ============================================
// EXAMPLE 1: LOGIN PAGE OBJECT
// ============================================

export class LoginPage extends BasePage {
  // Selectors
  private emailInput = '[data-testid="email"]';
  private passwordInput = '[data-testid="password"]';
  private submitButton = '[data-testid="submit"]';
  private rememberMeCheckbox = '[data-testid="remember-me"]';
  private forgotPasswordLink = 'a[href="/forgot-password"]';
  private signupLink = 'a[href="/signup"]';
  private errorMessage = '[data-testid="login-error"]';
  private successMessage = '[data-testid="login-success"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.goto('/login');
  }

  /**
   * Login with credentials
   */
  async login(email: string, password: string, rememberMe: boolean = false) {
    await this.fillField(this.emailInput, email);
    await this.fillField(this.passwordInput, password);

    if (rememberMe) {
      await this.click(this.rememberMeCheckbox);
    }

    await this.click(this.submitButton);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.click(this.forgotPasswordLink);
  }

  /**
   * Click signup link
   */
  async clickSignup() {
    await this.click(this.signupLink);
  }

  /**
   * Get login error message
   */
  async getLoginError(): Promise<string> {
    return await this.getText(this.errorMessage);
  }

  /**
   * Check if login was successful
   */
  async isLoginSuccessful(): Promise<boolean> {
    return await this.isVisible(this.successMessage);
  }

  /**
   * Check remember me checkbox
   */
  async setRememberMe(checked: boolean) {
    const checkbox = this.page.locator(this.rememberMeCheckbox);
    if (checked) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }
}

// ============================================
// EXAMPLE 2: SIGNUP PAGE OBJECT
// ============================================

export class SignupPage extends BasePage {
  // Selectors
  private nameInput = '[data-testid="name"]';
  private emailInput = '[data-testid="email"]';
  private passwordInput = '[data-testid="password"]';
  private confirmPasswordInput = '[data-testid="confirm-password"]';
  private agreeCheckbox = '[data-testid="agree-terms"]';
  private submitButton = '[data-testid="signup-submit"]';
  private backLink = 'a[href="/login"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to signup page
   */
  async goToSignup() {
    await this.goto('/signup');
  }

  /**
   * Fill signup form
   */
  async signup(name: string, email: string, password: string, confirmPassword: string) {
    await this.fillField(this.nameInput, name);
    await this.fillField(this.emailInput, email);
    await this.fillField(this.passwordInput, password);
    await this.fillField(this.confirmPasswordInput, confirmPassword);
  }

  /**
   * Agree to terms
   */
  async agreeToTerms() {
    await this.click(this.agreeCheckbox);
  }

  /**
   * Submit signup form
   */
  async submitSignup() {
    await this.click(this.submitButton);
  }

  /**
   * Go back to login
   */
  async goBackToLogin() {
    await this.click(this.backLink);
  }

  /**
   * Complete signup flow
   */
  async completeSignup(name: string, email: string, password: string) {
    await this.signup(name, email, password, password);
    await this.agreeToTerms();
    await this.submitSignup();
  }
}

// ============================================
// EXAMPLE 3: DASHBOARD PAGE OBJECT
// ============================================

export class DashboardPage extends BasePage {
  // Selectors
  private userMenu = '[data-testid="user-menu"]';
  private profileLink = '[data-testid="profile-link"]';
  private settingsLink = '[data-testid="settings-link"]';
  private logoutButton = '[data-testid="logout"]';
  private welcomeMessage = '[data-testid="welcome"]';
  private sidebarMenu = '[data-testid="sidebar"]';
  private mainContent = '[data-testid="main-content"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to dashboard
   */
  async goToDashboard() {
    await this.goto('/dashboard');
  }

  /**
   * Get welcome message
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.getText(this.welcomeMessage);
  }

  /**
   * Open user menu
   */
  async openUserMenu() {
    await this.click(this.userMenu);
  }

  /**
   * Navigate to profile
   */
  async goToProfile() {
    await this.openUserMenu();
    await this.click(this.profileLink);
  }

  /**
   * Navigate to settings
   */
  async goToSettings() {
    await this.openUserMenu();
    await this.click(this.settingsLink);
  }

  /**
   * Logout
   */
  async logout() {
    await this.openUserMenu();
    await this.click(this.logoutButton);
  }

  /**
   * Check if dashboard loaded
   */
  async isDashboardLoaded(): Promise<boolean> {
    return await this.isVisible(this.mainContent);
  }
}

// ============================================
// EXAMPLE 4: FORM PAGE OBJECT (Generic)
// ============================================

export class FormPage extends BasePage {
  private formSelector: string;

  constructor(page: Page, formSelector: string = 'form') {
    super(page);
    this.formSelector = formSelector;
  }

  /**
   * Fill form field
   */
  async fillFormField(fieldName: string, value: string) {
    const selector = this.getFieldSelector(fieldName);
    await this.fillField(selector, value);
  }

  /**
   * Get field selector based on name
   */
  private getFieldSelector(fieldName: string): string {
    return `${this.formSelector} [name="${fieldName}"], ${this.formSelector} #${fieldName}, ${this.formSelector} [data-testid="${fieldName}"]`;
  }

  /**
   * Fill entire form
   */
  async fillForm(data: Record<string, string>) {
    for (const [field, value] of Object.entries(data)) {
      await this.fillFormField(field, value);
    }
  }

  /**
   * Submit form
   */
  async submitForm() {
    await this.click(`${this.formSelector} [type="submit"]`);
  }

  /**
   * Get all form field labels
   */
  async getFormFieldLabels(): Promise<string[]> {
    return await this.page.$$eval(
      `${this.formSelector} label`,
      (labels: any[]) => labels.map(l => l.textContent?.trim())
    );
  }

  /**
   * Check if form is valid
   */
  async isFormValid(): Promise<boolean> {
    return await this.page.evaluate((selector) => {
      const form = document.querySelector(selector) as any;
      return form?.checkValidity?.() ?? true;
    }, this.formSelector);
  }

  /**
   * Get form errors
   */
  async getFormFieldErrors(): Promise<Record<string, string[]>> {
    return await this.page.evaluate((selector) => {
      const form = document.querySelector(selector);
      const errors: Record<string, string[]> = {};

      form?.querySelectorAll('[data-testid$="-error"], .field-error').forEach((error: any) => {
        const fieldName = error.getAttribute('data-field') || error.getAttribute('for');
        if (fieldName) {
          if (!errors[fieldName]) {
            errors[fieldName] = [];
          }
          errors[fieldName].push(error.textContent?.trim());
        }
      });

      return errors;
    }, this.formSelector);
  }
}

// ============================================
// EXAMPLE 5: TABLE/DATA LIST PAGE OBJECT
// ============================================

export class DataTablePage extends BasePage {
  private tableSelector: string;

  constructor(page: Page, tableSelector: string = '[data-testid="data-table"]') {
    super(page);
    this.tableSelector = tableSelector;
  }

  /**
   * Get all table rows
   */
  async getTableRows(): Promise<string[][]> {
    return await this.page.$$eval(
      `${this.tableSelector} tbody tr`,
      (rows: any[]) =>
        rows.map(row =>
          Array.from(row.querySelectorAll('td')).map(cell => cell.textContent?.trim())
        )
    );
  }

  /**
   * Get row count
   */
  async getRowCount(): Promise<number> {
    const rows = await this.page.$$(`${this.tableSelector} tbody tr`);
    return rows.length;
  }

  /**
   * Search/filter table
   */
  async searchTable(searchTerm: string) {
    const searchInput = `${this.tableSelector} [data-testid="search"]`;
    await this.fillField(searchInput, searchTerm);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Sort table by column
   */
  async sortByColumn(columnName: string) {
    const columnHeader = `${this.tableSelector} th:has-text("${columnName}")`;
    await this.click(columnHeader);
  }

  /**
   * Paginate table
   */
  async goToPage(pageNumber: number) {
    const pageButton = `${this.tableSelector} [data-testid="page-${pageNumber}"]`;
    await this.click(pageButton);
  }

  /**
   * Check if row contains text
   */
  async rowContainsText(rowIndex: number, searchText: string): Promise<boolean> {
    const rows = await this.getTableRows();
    if (rowIndex >= rows.length) return false;

    return rows[rowIndex].some(cell => cell?.includes(searchText));
  }

  /**
   * Get cell value
   */
  async getCellValue(rowIndex: number, columnIndex: number): Promise<string | null> {
    const rows = await this.getTableRows();
    if (rowIndex >= rows.length || columnIndex >= rows[rowIndex].length) {
      return null;
    }
    return rows[rowIndex][columnIndex];
  }
}

// ============================================
// EXAMPLE 6: SETTINGS PAGE OBJECT
// ============================================

export class SettingsPage extends BasePage {
  // Tab selectors
  private profileTab = '[data-testid="tab-profile"]';
  private securityTab = '[data-testid="tab-security"]';
  private notificationsTab = '[data-testid="tab-notifications"]';
  private privacyTab = '[data-testid="tab-privacy"]';

  // Form selectors
  private profileForm = '[data-testid="profile-form"]';
  private passwordForm = '[data-testid="password-form"]';

  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to settings
   */
  async goToSettings() {
    await this.goto('/settings');
  }

  /**
   * Click tab
   */
  private async clickTab(tabSelector: string) {
    await this.click(tabSelector);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to profile settings
   */
  async goToProfileSettings() {
    await this.clickTab(this.profileTab);
  }

  /**
   * Navigate to security settings
   */
  async goToSecuritySettings() {
    await this.clickTab(this.securityTab);
  }

  /**
   * Navigate to notification settings
   */
  async goToNotificationSettings() {
    await this.clickTab(this.notificationsTab);
  }

  /**
   * Navigate to privacy settings
   */
  async goToPrivacySettings() {
    await this.clickTab(this.privacyTab);
  }

  /**
   * Update profile
   */
  async updateProfile(profileData: Record<string, string>) {
    const form = new FormPage(this.page, this.profileForm);
    await form.fillForm(profileData);
    await form.submitForm();
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    await this.goToSecuritySettings();

    const currentPwdField = '[data-testid="current-password"]';
    const newPwdField = '[data-testid="new-password"]';
    const confirmPwdField = '[data-testid="confirm-password"]';

    await this.fillField(currentPwdField, currentPassword);
    await this.fillField(newPwdField, newPassword);
    await this.fillField(confirmPwdField, confirmPassword);

    await this.submitForm(this.passwordForm);
  }
}

// ============================================
// EXAMPLE USAGE IN TESTS
// ============================================

/*
import { test, expect } from '@playwright/test';

test.describe('Login Flow - Complete Testing', () => {
  
  test('Positive: Valid credentials should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goToLogin();
    await loginPage.login('user@example.com', 'SecurePass123!');
    
    expect(await loginPage.isLoginSuccessful()).toBe(true);
  });

  test('Negative: Invalid email should show error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    await loginPage.goToLogin();
    await loginPage.login('invalid-email', 'password123');
    
    const error = await loginPage.getLoginError();
    expect(error).toBeTruthy();
  });

  test('Edge: Very long email should be handled', async ({ page }) => {
    const loginPage = new LoginPage(page);
    
    const longEmail = 'a'.repeat(255) + '@example.com';
    await loginPage.goToLogin();
    await loginPage.login(longEmail, 'password123');
    
    // Should either show error or handle gracefully
    const isExpectedState = 
      (await loginPage.isLoginSuccessful()) || 
      (await loginPage.getLoginError()).length > 0;
    expect(isExpectedState).toBe(true);
  });
});

test.describe('Signup Flow - Complete Testing', () => {
  
  test('Positive: Valid signup data should create account', async ({ page }) => {
    const signupPage = new SignupPage(page);
    
    await signupPage.goToSignup();
    await signupPage.completeSignup(
      'John Doe',
      'john@example.com',
      'SecurePass123!'
    );
    
    // Should redirect to dashboard or success page
    expect(page.url()).toContain('/dashboard');
  });

  test('Negative: Password mismatch should show error', async ({ page }) => {
    const signupPage = new SignupPage(page);
    
    await signupPage.goToSignup();
    await signupPage.signup(
      'John Doe',
      'john@example.com',
      'SecurePass123!',
      'DifferentPass123!'
    );
    await signupPage.agreeToTerms();
    await signupPage.submitSignup();
    
    const errors = await signupPage.getFormErrors();
    expect(errors.length).toBeGreaterThan(0);
  });
});

test.describe('Dashboard - Complete Testing', () => {
  
  test('Positive: Dashboard should load with user info', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    
    await dashboardPage.goToDashboard();
    
    expect(await dashboardPage.isDashboardLoaded()).toBe(true);
    const welcome = await dashboardPage.getWelcomeMessage();
    expect(welcome).toBeTruthy();
  });

  test('Positive: User should be able to logout', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    
    await dashboardPage.goToDashboard();
    await dashboardPage.logout();
    
    // Should redirect to login
    expect(page.url()).toContain('/login');
  });
});

test.describe('Settings - Complete Testing', () => {
  
  test('Positive: Profile update should save changes', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    
    await settingsPage.goToSettings();
    await settingsPage.updateProfile({
      firstName: 'Jane',
      lastName: 'Doe',
      phone: '+1234567890'
    });
    
    // Verify success message
    expect(page.url()).toContain('/settings');
  });

  test('Positive: Password change should work', async ({ page }) => {
    const settingsPage = new SettingsPage(page);
    
    await settingsPage.goToSettings();
    await settingsPage.changePassword(
      'OldPassword123!',
      'NewPassword123!',
      'NewPassword123!'
    );
    
    // Should show success message
    // and user should be able to login with new password
  });
});
*/

// ============================================
// EXPORTS
// ============================================

export {
  LoginPage,
  SignupPage,
  DashboardPage,
  FormPage,
  DataTablePage,
  SettingsPage
};