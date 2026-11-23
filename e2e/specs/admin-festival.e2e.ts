import { expect, test } from '../fixtures/test';

/** Holi's colour 1, as the browser reports it. */
const HOLI_BASE = 'rgb(228, 66, 143)';

/** The festival looks (0028 D5, 2.16.0): chosen in the editor, with the Fake backend. */
test.describe('Admin festival looks', () => {
  test('should give the badge and the offer a festival’s look, seen first in the preview', async ({
    editor,
    home,
    page,
  }) => {
    await editor.signIn();
    await editor.openTab('Offer');
    const festival = editor.card('Offer switch and dates').getByLabel('Festival');
    await expect(festival).toHaveValue('diwali');

    await festival.selectOption({ label: 'Holi · March' });
    await editor.waitForSave();

    await expect(editor.preview.locator('#diwali')).toHaveClass(/festival-look/);
    await editor.publish();
    await home.open();
    await expect(home.offerSection).toHaveCSS('background-color', HOLI_BASE);
    await expect(page.locator('app-promo-pill .promo')).toHaveClass(/festival-look/);
    await expect(page.locator('app-promo-pill app-icon')).toHaveCount(1);
  });
});
