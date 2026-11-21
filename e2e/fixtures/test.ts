import { test as base, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { AdminPage } from '../pages/admin.page';
import { AppShellPage } from '../pages/app-shell.page';
import { EditorPage } from '../pages/editor.page';
import { HomePage } from '../pages/home.page';
import { InnerPage } from '../pages/inner-page.page';
import {
  TOUR_SEEN_KEY_PREFIX,
  TOUR_VERSION,
} from '../../src/app/features/admin/models/tour.constants';
import {
  FAKE_MANAGER_ACCOUNT,
  FAKE_SUPER_MANAGER_ACCOUNT,
} from '../../src/app/core/backends/fake/fake-auth.constants';

/**
 * The test accounts whose tour offer is answered before each test, so it never covers the page:
 * the fake owner and managers, and the emulator's owner and managers.
 */
const TEST_ACCOUNT_UIDS = [
  'fake-admin-uid',
  FAKE_MANAGER_ACCOUNT.uid,
  FAKE_SUPER_MANAGER_ACCOUNT.uid,
  '5zsz2DlUaja2Ss7wbFTrpiMMROk2',
  'emulator-manager-uid',
  'emulator-manager-two-uid',
];

/** Options a spec can set with `test.use()`. */
interface Options {
  /** The guided tour offers itself on sign-in (0020), as for a real first visit. Off by default. */
  tourOffered: boolean;
}

/** Names of the inner pages, each a key of the `innerPages` fixture. */
export type InnerPageName = 'videos' | 'team' | 'shows' | 'achievements';

/** Custom fixtures: page objects plus an accessibility scanner, injected into every spec. */
interface Fixtures {
  appShell: AppShellPage;
  home: HomePage;
  admin: AdminPage;
  editor: EditorPage;
  /** Inner pages by name. */
  innerPages: Readonly<Record<InnerPageName, InnerPage>>;
  axe: () => AxeBuilder;
}

export const test = base.extend<Fixtures & Options>({
  tourOffered: [false, { option: true }],
  page: async ({ page, tourOffered }, use) => {
    if (!tourOffered) {
      await page.addInitScript(
        ({ prefix, version, uids }) => {
          for (const uid of uids) {
            localStorage.setItem(prefix + uid, version);
          }
        },
        { prefix: TOUR_SEEN_KEY_PREFIX, version: TOUR_VERSION, uids: TEST_ACCOUNT_UIDS },
      );
    }
    await use(page);
  },
  appShell: async ({ page }, use) => {
    await use(new AppShellPage(page));
  },
  home: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  admin: async ({ page }, use) => {
    await use(new AdminPage(page));
  },
  editor: async ({ page }, use) => {
    await use(new EditorPage(page));
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
