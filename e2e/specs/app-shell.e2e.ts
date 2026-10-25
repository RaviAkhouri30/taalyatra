import { expect, test } from '../fixtures/test';

test.describe('App shell', () => {
  test('should show the main landmark', async ({ appShell }) => {
    await appShell.open();

    await expect(appShell.main).toBeVisible();
  });

  test('should have no WCAG 2.2 AA accessibility violations', async ({ appShell, axe }) => {
    await appShell.open();
    const results = await axe().analyze();
    // One readable line per violation: rule id and the offending elements.
    const summary = results.violations.map(
      (violation) =>
        `${violation.id}: ${violation.nodes.map((node) => node.target.join(' ')).join(', ')}`,
    );

    expect(summary).toEqual([]);
  });
});
