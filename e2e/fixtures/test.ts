import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { AppShellPage } from '../pages/app-shell.page';
import { HomePage } from '../pages/home.page';

/** Custom fixtures: page objects plus an accessibility scanner, injected into every spec. */
interface Fixtures {
  appShell: AppShellPage;
  home: HomePage;
  axe: () => AxeBuilder;
}

export const test = base.extend<Fixtures>({
  appShell: async ({ page }, use) => {
    await use(new AppShellPage(page));
  },
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  axe: async ({ page }, use) => {
    await use(() =>
      new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']),
    );
  },
});

export { expect };
