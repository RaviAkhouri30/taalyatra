import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Page Object for the home page. */
export class HomePage extends BasePage {
  public readonly heroHeading: Locator;
  public readonly proposalButton: Locator;
  public readonly gameLink: Locator;
  public readonly stage: Locator;
  protected readonly path = '/';

  public constructor(page: Page) {
    super(page);
    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.proposalButton = page.locator('#top').getByRole('link', { name: 'Request proposal' });
    this.gameLink = page.getByRole('link', { name: 'Play the rhythm game' });
    this.stage = page.getByRole('img', { name: /two hands playing a djembe/ });
  }
}
