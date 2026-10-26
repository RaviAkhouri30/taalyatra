import { type Page } from '@playwright/test';

/**
 * Base Page Object: shared navigation helpers for every page object.
 * Specs talk to page objects, never to raw selectors.
 */
export abstract class BasePage {
  /** Path of the page relative to baseURL. */
  protected abstract readonly path: string;

  protected constructor(public readonly page: Page) {}

  /**
   * Navigates to the page and waits until it is visually settled: network idle, web fonts loaded,
   * and the site chrome styled. The dev server loads component styles separately, so checks that
   * run earlier would measure unstyled elements.
   */
  public async open(fragment = ''): Promise<void> {
    await this.page.goto(fragment ? `${this.path}#${fragment}` : this.path);
    await this.page.waitForLoadState('networkidle');
    await this.page.evaluate(async () => document.fonts.ready);
    await this.page.waitForFunction(() => {
      const header = document.querySelector('app-header');
      return header !== null && getComputedStyle(header).position === 'sticky';
    });
  }
}
