import { expect, test } from '../fixtures/test';
import { type HomePage } from '../pages/home.page';

/** Interactive states that add content the closed page does not have. */
const STATES: readonly { name: string; enter: (home: HomePage) => Promise<void> }[] = [
  {
    name: 'chat assistant open',
    enter: async (home) => {
      await home.chatToggle.click();
      // The panel's parts fade in one after another; scan colours once the last one is opaque.
      await expect(
        home.chatPanel.getByRole('link', { name: 'Prefer WhatsApp? Message us' }),
      ).toHaveCSS('opacity', '1');
    },
  },
  {
    name: 'proposal form showing errors',
    enter: async (home) => {
      await home.contactSection.getByRole('button', { name: 'Request proposal' }).click();
      await expect(home.contactSection.getByText('Please tell us your name.')).toBeVisible();
    },
  },
  {
    name: 'photo viewer open',
    enter: async (home) => {
      await home
        .section('gallery')
        .getByRole('button', { name: /^Open photo:/ })
        .first()
        .click();
      await expect(home.page.getByRole('dialog', { name: 'Photo viewer' })).toBeVisible();
    },
  },
];

test.describe('Home accessibility', () => {
  for (const state of STATES) {
    test(`should have no WCAG 2.2 AA violations with the ${state.name}`, async ({ home, axe }) => {
      await home.open();
      await state.enter(home);

      const results = await axe().analyze();
      const summary = results.violations.map(
        (violation) =>
          `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
      );

      expect(summary).toEqual([]);
    });
  }
});
