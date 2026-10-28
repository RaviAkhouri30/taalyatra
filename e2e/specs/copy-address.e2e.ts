import { expect, test } from '../fixtures/test';

test.describe('Copy the address', () => {
  test('should show the full address on hover and copy it with a toast on click', async ({
    home,
    browserName,
    context,
  }) => {
    // Only Chromium knows the clipboard permissions; WebKit allows writing on a click, without
    // a permission, but can't read the clipboard back in a test.
    const canReadClipboard = browserName === 'chromium';
    if (canReadClipboard) {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    }
    await home.open();
    const footer = home.page.getByRole('contentinfo');
    const address = footer.getByRole('button', { name: /^Copy address: / });
    const fullAddress = (await address.getAttribute('aria-label'))?.replace('Copy address: ', '');

    await address.scrollIntoViewIfNeeded();
    await address.hover();
    await expect(footer.getByRole('tooltip', { includeHidden: true })).toBeVisible();

    await address.click();

    await expect(home.page.getByRole('status').filter({ hasText: 'Address copied' })).toBeVisible();
    const copied = canReadClipboard
      ? await home.page.evaluate(() => navigator.clipboard.readText())
      : fullAddress;
    expect(copied).toBe(fullAddress);
    await expect(footer.getByRole('link', { name: /^Call us, / })).toHaveText('Call us');
  });
});
