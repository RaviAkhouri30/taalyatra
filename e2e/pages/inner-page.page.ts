import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for an inner page (Videos, Team, Shows, Achievements). */
export class InnerPage extends BasePage {
  public readonly heading: Locator;
  /** The page's sections in order, the hero first. */
  public readonly sections: Locator;
  /** The closing call to action's buttons. */
  public readonly ctaLinks: Locator;

  public constructor(
    page: Page,
    protected readonly path: string,
  ) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    this.sections = page.getByRole('main').locator('section');
    this.ctaLinks = page.getByRole('main').locator('app-page-cta').last().getByRole('link');
  }
}
