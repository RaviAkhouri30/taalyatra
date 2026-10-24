import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for the application shell (root route). */
export class AppShellPage extends BasePage {
  public readonly main: Locator;
  protected readonly path = '/';

  public constructor(page: Page) {
    super(page);
    this.main = page.getByRole('main');
  }
}
