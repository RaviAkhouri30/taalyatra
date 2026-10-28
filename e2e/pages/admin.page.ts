import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for the admin area (sign-in, reset password, admin home). */
export class AdminPage extends BasePage {
  public readonly heading: Locator;
  public readonly email: Locator;
  public readonly password: Locator;
  public readonly signInButton: Locator;
  public readonly alert: Locator;
  public readonly status: Locator;
  protected readonly path = '/admin';

  public constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.email = page.getByRole('textbox', { name: 'Email' });
    this.password = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.alert = page.getByRole('main').getByRole('alert');
    this.status = page.getByRole('main').getByRole('status');
  }

  /** Opens an admin path, e.g. `/admin/reset-password`, and waits for its heading. */
  public async openPath(path: string): Promise<void> {
    await this.page.goto(path);
    await this.heading.waitFor();
  }

  /** Fills in the sign-in form and submits it. */
  public async signIn(email: string, password: string): Promise<void> {
    await this.email.fill(email);
    await this.password.fill(password);
    await this.signInButton.click();
  }
}
