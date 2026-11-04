import { Buffer } from 'node:buffer';
import { expect, test } from '../fixtures/test';

/** The smallest valid JPEG start; the fake adapter stores the name and size only. */
const photo = (name: string) => ({
  name,
  mimeType: 'image/jpeg',
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
});

test.describe('Admin media library', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
    await editor.openTab('Media library');
  });

  test('should upload photos, keep them after a reload and store a description', async ({
    editor,
    page,
  }) => {
    await expect(page.getByText('No photos yet.')).toBeVisible();

    await editor.uploadPhotos(photo('circle.jpg'), photo('stage.jpg'));

    await expect(page.getByRole('status').filter({ hasText: '2 of 2 uploaded.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '2 photos' })).toBeVisible();
    const field = page
      .getByRole('listitem')
      .filter({ hasText: 'circle.jpg' })
      .getByLabel('Description');
    await field.fill('A drum circle at sunset');
    await field.blur();
    await page.waitForFunction(() =>
      localStorage.getItem('taal-yatra.fake-db.overlay')?.includes('sunset'),
    );

    await page.reload();

    await expect(page.getByRole('heading', { name: '2 photos' })).toBeVisible();
    await expect(field).toHaveValue('A drum circle at sunset');
  });

  test('should refuse a file that is not a photo and carry on with the rest', async ({
    editor,
    page,
  }) => {
    await editor.uploadPhotos(
      { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('notes') },
      photo('circle.jpg'),
    );

    await expect(page.getByText('This isn’t a photo the site can use.')).toBeVisible();
    await expect(page.getByRole('heading', { name: '1 photo', exact: true })).toBeVisible();
  });

  test('should reach the file input by keyboard', async ({ page }) => {
    await page.getByLabel('Choose photos').focus();

    await expect(page.getByLabel('Choose photos')).toBeFocused();
  });
});
