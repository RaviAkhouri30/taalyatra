import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { AppShellPage } from '../pages/app-shell.page';
import { HomePage } from '../pages/home.page';
import { InnerPage } from '../pages/inner-page.page';

/** Names of the inner pages, each a key of the `innerPages` fixture. */
export type InnerPageName = 'videos' | 'team' | 'shows' | 'achievements';

/** Custom fixtures: page objects plus an accessibility scanner, injected into every spec. */
interface Fixtures {
  appShell: AppShellPage;
  home: HomePage;
  /** Inner pages by name. */
  innerPages: Readonly<Record<InnerPageName, InnerPage>>;
  axe: () => AxeBuilder;
}

export const test = base.extend<Fixtures>({
  appShell: async ({ page }, use) => {
    await use(new AppShellPage(page));
  },
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  innerPages: async ({ page }, use) => {
    await use({
      videos: new InnerPage(page, '/videos'),
      team: new InnerPage(page, '/team'),
      shows: new InnerPage(page, '/shows'),
      achievements: new InnerPage(page, '/achievements'),
    });
  },
  axe: async ({ page }, use) => {
    await use(() =>
      new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']),
    );
  },
});

export { expect };
