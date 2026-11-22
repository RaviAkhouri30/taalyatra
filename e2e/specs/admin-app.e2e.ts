import { type Page } from '@playwright/test';
import { expect, test } from '../fixtures/test';

/** The admin's app tags, as the page has them now (0026): the head isn't reachable by role. */
function appTags(page: Page) {
  return page.evaluate(() => ({
    manifest: document.querySelector('link[rel="manifest"]')?.getAttribute('href') ?? null,
    capable:
      document
        .querySelector('meta[name="apple-mobile-web-app-capable"]')
        ?.getAttribute('content') ?? null,
    viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content') ?? '',
  }));
}

/** Opens Help → Install on your phone. */
async function openInstallPage(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Help' }).click();
  await page.getByRole('link', { name: 'Install on your phone' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Install on your phone');
}

/** The admin on your phone (0026, 2.8.0). */
test.describe('Admin app', () => {
  test('should be installable from the admin, and not from the public site', async ({
    editor,
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(appTags(page)).resolves.toMatchObject({ manifest: null, capable: null });

    await editor.signIn();

    const tags = await appTags(page);
    expect(tags).toMatchObject({ manifest: '/admin.webmanifest', capable: 'yes' });
    expect(tags.viewport).toContain('viewport-fit=cover');
  });

  test('should serve a manifest that opens the admin full screen, with its icons', async ({
    request,
  }) => {
    const response = await request.get('/admin.webmanifest');
    expect(response.ok()).toBe(true);
    // Loosely typed: the manifest's own field names are snake_case.
    const manifest = (await response.json()) as Record<string, unknown> & {
      icons: { src: string; sizes: string; purpose?: string }[];
    };

    expect(manifest).toMatchObject({
      name: 'Taal Yatra admin',
      short_name: 'TY Admin',
      start_url: '/admin',
      scope: '/admin',
      display: 'standalone',
    });
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(['192x192', '512x512', '512x512']);
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
    for (const icon of manifest.icons) {
      expect((await request.get(icon.src)).ok()).toBe(true);
    }
  });

  test('should show how to install on each phone, from Help', async ({ editor, page }) => {
    await editor.signIn();

    await openInstallPage(page);

    await expect(page.getByRole('heading', { name: 'On Android' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'On iPhone' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Install', exact: true })).toHaveCount(0);
  });

  test('should offer Install when the browser does, and say when it’s done', async ({
    editor,
    page,
  }) => {
    await editor.signIn();
    // Chrome's offer, as Android makes it once the manifest is in place.
    await page.evaluate(() => {
      const offer = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
        prompt: () => Promise.resolve(),
        userChoice: Promise.resolve({ outcome: 'accepted' }),
      });
      window.dispatchEvent(offer);
    });

    await openInstallPage(page);
    await page.getByRole('button', { name: 'Install', exact: true }).click();

    await expect(page.getByRole('status').filter({ hasText: 'Installed.' })).toBeVisible();
  });

  test('should have no WCAG 2.2 AA violations on Install on your phone', async ({
    editor,
    page,
    axe,
  }) => {
    await editor.signIn();
    await openInstallPage(page);
    await page.mouse.move(0, 0);

    expect((await axe().analyze()).violations).toEqual([]);
  });
});
