import { type Page } from '@playwright/test';

/**
 * Base Page Object: shared navigation helpers for every page object.
 * Specs talk to page objects, never to raw selectors.
 */
export abstract class BasePage {
  /** Path of the page relative to baseURL. */
  protected abstract readonly path: string;

  protected constructor(protected readonly page: Page) {}

  /** Navigates to the page and waits for the network to settle. */
  public async open(): Promise<void> {
    await this.page.goto(this.path);
    await this.page.waitForLoadState('networkidle');
  }
}
