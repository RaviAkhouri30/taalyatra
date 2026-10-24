import { expect, test } from '../fixtures/test';

test.describe('App shell', () => {
  test('should attach the main landmark', async ({ appShell }) => {
    await appShell.open();

    // The shell has no routed page yet, so <main> is empty (zero height). Switch to toBeVisible()
    // once the home feature is routed.
    await expect(appShell.main).toBeAttached();
  });

  test('should have no WCAG 2.2 AA accessibility violations', async ({ appShell, axe }) => {
    await appShell.open();
    const results = await axe().analyze();

    expect(results.violations).toEqual([]);
  });
});
