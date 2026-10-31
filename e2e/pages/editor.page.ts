import { type FrameLocator, type Locator, type Page } from '@playwright/test';
import { FAKE_ADMIN_ACCOUNT } from '../../src/app/core/backends/fake/fake-auth.constants';
import { BasePage } from './base.page';

/** Page Object for the content editor behind `/admin` (0008). */
export class EditorPage extends BasePage {
  public readonly heading: Locator;
  public readonly status: Locator;
  public readonly tabs: Locator;
  public readonly preview: FrameLocator;
  protected readonly path = '/admin';

  public constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
    // The editor's status line (the site's toasts are a separate status region).
    this.status = page.getByRole('status').filter({ hasText: /draft|Saving|save/ });
    this.tabs = page.getByRole('navigation', { name: 'Editor' });
    this.preview = page.frameLocator('iframe[title="Preview of the site with your draft"]');
  }

  /** Signs the admin in (the fake one by default) and waits for the dashboard. */
  public async signIn(account = FAKE_ADMIN_ACCOUNT): Promise<void> {
    await this.page.goto('/admin/sign-in');
    await this.page.getByRole('textbox', { name: 'Email' }).fill(account.email);
    await this.page.getByLabel('Password').fill(account.password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
    await this.heading.filter({ hasText: 'Welcome back' }).waitFor();
  }

  /** Opens a tab from the tab bar and waits until it is the current page with its content. */
  public async openTab(name: string): Promise<void> {
    await this.tabs.getByRole('link', { name }).first().click();
    await this.tabs.locator('[aria-current="page"]', { hasText: name }).waitFor();
    await this.heading.waitFor();
  }

  /** The editor card with this heading. */
  public card(name: string): Locator {
    return this.page.getByRole('region', { name });
  }

  /** Waits until the last change is saved in the draft. */
  public async waitForSave(): Promise<void> {
    await this.status.filter({ hasText: 'Saved in your draft' }).waitFor();
  }

  /** Publishes every draft from the review page and waits for the confirmation. */
  public async publish(): Promise<void> {
    await this.openTab('Review & publish');
    await this.page.getByRole('button', { name: 'Publish changes' }).click();
    await this.page.getByRole('button', { name: 'Yes, publish' }).click();
    await this.page.getByText('Published. Visitors see the changes').waitFor();
  }
}
