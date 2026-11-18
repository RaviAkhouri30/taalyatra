import { expect, test } from '../fixtures/test';

/** Finding things in the editor (0017 U1–U3). */
test.describe('Admin find', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should find a field by an everyday word and put the cursor in it', async ({ page }) => {
    // Phones keep the side panel behind Menu.
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    if (await menu.isVisible()) {
      await menu.click();
    }
    const find = page.getByRole('searchbox', { name: 'Find anything in the editor' });

    await find.fill('phone');
    await page.getByRole('button', { name: /^Phone, as shown/ }).click();

    await expect(page).toHaveURL(/\/admin\/contact#field-contactDetails-contact-phone-display$/);
    await expect(page.getByLabel('Phone, as shown')).toBeFocused();
  });

  test('should say so when nothing matches', async ({ page }) => {
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    if (await menu.isVisible()) {
      await menu.click();
    }

    await page.getByRole('searchbox', { name: 'Find anything in the editor' }).fill('xyzzy');

    await expect(page.getByText('Nothing matches “xyzzy”. Try another word.')).toBeVisible();
  });

  test('should take a to-do item on the dashboard straight to its card', async ({ page }) => {
    // The list is grouped by section; open Offer's group first.
    await page
      .getByRole('region', { name: /^Still to fill in/ })
      .getByText('Offer', { exact: true })
      .click();
    await page.getByRole('link', { name: /^Fix Offer → Offer card 1/ }).click();

    await expect(page).toHaveURL(/\/admin\/offer#card-offer$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Offer');
  });

  test('should send an old Page content link to the Hero tab', async ({ page }) => {
    await page.goto('/admin/content');

    await expect(page).toHaveURL(/\/admin\/hero$/);
  });
});
