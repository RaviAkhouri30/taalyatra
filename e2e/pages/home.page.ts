import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

/** Window with the rhythm-game pads recorded by `HomePage.recordLitPads()`. */
type LitPadWindow = Window & { litPads?: string[] };

/** Page Object for the home page. */
export class HomePage extends BasePage {
  public readonly heroHeading: Locator;
  public readonly proposalButton: Locator;
  public readonly gameLink: Locator;
  public readonly stage: Locator;
  public readonly offerSection: Locator;
  public readonly promoBadgeLink: Locator;
  public readonly audiencesSection: Locator;
  public readonly experiencesSection: Locator;
  public readonly drumCircleSection: Locator;
  public readonly gameSection: Locator;
  public readonly contactSection: Locator;
  public readonly chatToggle: Locator;
  public readonly chatPanel: Locator;
  protected readonly path = '/';

  public constructor(page: Page) {
    super(page);
    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.proposalButton = page.locator('#top').getByRole('link', { name: 'Request proposal' });
    this.gameLink = page.getByRole('link', { name: 'Play the rhythm game' });
    this.stage = page.getByRole('img', { name: /two hands playing a djembe/ });
    this.offerSection = page.locator('#diwali');
    this.promoBadgeLink = page
      .locator('app-promo-badge')
      .getByRole('link', { name: 'Diwali offers' });
    this.audiencesSection = page.locator('#for-everyone');
    this.experiencesSection = page.locator('#experiences');
    this.drumCircleSection = page.locator('#drum-circle-details');
    this.gameSection = page.locator('#play');
    this.contactSection = page.locator('#contact');
    this.chatToggle = page.getByRole('button', { name: 'Open or close the chat assistant' });
    this.chatPanel = page.getByRole('dialog', { name: 'Taal Yatra assistant' });
  }

  /** @returns The home section with the given anchor id, e.g. `gallery`. */
  public section(anchor: string): Locator {
    return this.page.locator(`#${anchor}`);
  }

  /**
   * Records, inside the page, the accessible name of every rhythm-game pad that lights up.
   * Flashes last ~320 ms, too short to sample reliably from the test runner.
   */
  public async recordLitPads(): Promise<void> {
    await this.page.evaluate(() => {
      const store = window as LitPadWindow;
      store.litPads = [];
      const board = document.querySelector('#play');
      if (!board) return;
      new MutationObserver((records) => {
        for (const record of records) {
          const pad = record.target as HTMLElement;
          if (pad.classList.contains('lit'))
            store.litPads?.push(pad.getAttribute('aria-label') ?? '');
        }
      }).observe(board, { attributes: true, attributeFilter: ['class'], subtree: true });
    });
  }

  /** @returns The pads recorded by `recordLitPads()`, in the order they lit up. */
  public async litPads(): Promise<string[]> {
    return this.page.evaluate(() => (window as LitPadWindow).litPads ?? []);
  }
}
