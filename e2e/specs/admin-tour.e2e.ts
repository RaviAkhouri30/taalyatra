import { type Page } from '@playwright/test';
import { expect, test } from '../fixtures/test';

/** The owner's tour, in order, and whether each step points at an area. */
const OWNER_STEPS = [
  ['Welcome to the admin', false],
  ['Every page, in one menu', true],
  ['Find anything', true],
  ['Cards change the site', true],
  ['See it before anyone else', true],
  ['Publish or undo', true],
  ['Review & publish', true],
  ['Only yours', true],
  ['Help is always here', true],
] as const;

/** Phones and tablets show the form or the preview, so the preview has no box to frame. */
const isNarrow = (page: Page): boolean => (page.viewportSize()?.width ?? 0) <= 1000;

/** The guided tour and the Features page (0020). */
test.describe('Admin tour', () => {
  test.describe('on a first sign-in', () => {
    test.use({ tourOffered: true });

    test('should offer the tour once, and walk the owner through it by keyboard', async ({
      editor,
      page,
    }) => {
      await editor.signIn();
      const offer = page.getByRole('region', { name: 'Take a one-minute tour?' });
      await offer.getByRole('button', { name: 'Start the tour' }).click();
      const card = page.getByRole('dialog');

      for (const [index, [title, framed]] of OWNER_STEPS.entries()) {
        await expect(card.getByRole('heading', { name: title })).toBeVisible();
        await expect(card).toContainText(
          `Step ${String(index + 1)} of ${String(OWNER_STEPS.length)}`,
        );
        const shown = framed && !(title === 'See it before anyone else' && isNarrow(page));
        await expect(page.getByTestId('tour-frame')).toHaveCount(shown ? 1 : 0);
        const move = card.getByRole('button', {
          name: index === OWNER_STEPS.length - 1 ? 'Done' : 'Next',
        });
        await move.focus();
        await page.keyboard.press('Enter');
      }

      await expect(card).toHaveCount(0);
      await page.reload();
      await editor.heading.waitFor();
      await expect(offer).toHaveCount(0);
    });

    test('should stop asking after Not now', async ({ editor, page }) => {
      await editor.signIn();
      await page.getByRole('button', { name: 'Not now' }).click();

      await page.reload();
      await editor.heading.waitFor();

      await expect(page.getByRole('region', { name: 'Take a one-minute tour?' })).toHaveCount(0);
    });
  });

  test('should replay from Help, close with Escape and give focus back', async ({
    editor,
    page,
  }) => {
    await editor.signIn();
    const help = page.getByRole('button', { name: 'Help' });
    await help.click();
    await page.getByRole('button', { name: 'Take the tour' }).click();
    await expect(page.getByRole('dialog')).toContainText('Step 1 of 9');

    await page.keyboard.press('Escape');

    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(help).toBeFocused();
  });

  test('should have no WCAG 2.2 AA violations in the offer, the tour or Help', async ({
    editor,
    axe,
    page,
  }) => {
    await editor.signIn();
    await page.getByRole('button', { name: 'Help' }).click();
    expect((await axe().exclude('iframe').analyze()).violations).toEqual([]);
    await page.getByRole('button', { name: 'Take the tour' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Next' }).click();
    await expect(page.getByRole('dialog')).toContainText('Step 2 of 9');

    const results = await axe().include('[role="dialog"]').analyze();

    expect(results.violations).toEqual([]);
  });
});

test.describe('Admin features page', () => {
  test('should list every feature with links to see and change it', async ({ editor, page }) => {
    await editor.signIn();
    await page.getByRole('button', { name: 'Help' }).click();
    await page.getByRole('link', { name: 'Features' }).click();
    await expect(editor.heading).toHaveText('Features');

    for (const group of ['Home page', 'Every page', 'Admin']) {
      await expect(page.getByRole('heading', { name: group, level: 2 })).toBeVisible();
    }
    const offer = page.getByRole('article', { name: 'Festival offer' });
    await expect(
      offer.getByRole('link', { name: /^See Festival offer on the site/ }),
    ).toHaveAttribute('href', '/#diwali');
    await offer.getByRole('link', { name: 'Change Festival offer' }).click();
    await expect(editor.heading).toHaveText('Offer');
  });

  test('should have no WCAG 2.2 AA violations', async ({ editor, axe, page }) => {
    await editor.signIn();
    await page.goto('/admin/features');
    await expect(editor.heading).toHaveText('Features');

    const results = await axe().exclude('iframe').analyze();

    expect(results.violations).toEqual([]);
  });
});
