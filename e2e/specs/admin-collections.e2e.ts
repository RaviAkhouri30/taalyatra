import { Buffer } from 'node:buffer';
import { expect, test } from '../fixtures/test';

const photo = {
  name: 'new-photo.jpg',
  mimeType: 'image/jpeg',
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
};

test.describe('Admin collections', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should reorder the gallery, publish it, and put it back with undo', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Gallery');
    const photos = editor.card('Photos');
    const second = await photos.getByLabel('Description').nth(1).inputValue();
    const first = await photos.getByLabel('Description').first().inputValue();

    await photos.getByRole('button', { name: 'Move Photo 2 up' }).click();
    await editor.waitForSave();
    await editor.publish();
    await page.goto('/');

    const gallery = page.locator('#gallery');
    await gallery.scrollIntoViewIfNeeded();
    await expect(gallery.getByRole('button', { name: 'Open photo:' }).first()).toHaveAccessibleName(
      `Open photo: ${second}`,
    );

    await page.goto('/admin');
    await editor.openTab('Review & publish');
    await page.getByRole('button', { name: /^Undo the publish of/ }).click();
    await page.getByRole('button', { name: 'Restore' }).click();
    await expect(page.getByText('That version is back in your draft.')).toBeVisible();
    await editor.openTab('Gallery');

    await expect(editor.card('Photos').getByLabel('Description').first()).toHaveValue(first);
  });

  test('should block publishing a new photo with no description until it has one', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Gallery');
    const photos = editor.card('Photos');
    const count = await photos.getByLabel('Description').count();
    await photos.getByRole('button', { name: 'Add photo' }).click();
    const added = photos.getByRole('group', { name: `Photo ${String(count + 1)}` });
    await added.getByRole('button', { name: 'Choose or upload' }).click();
    await added.getByLabel('Choose photos').setInputFiles([photo]);
    await added.getByRole('button', { name: 'Choose new-photo.jpg' }).click();
    await editor.waitForSave();
    await editor.openTab('Review & publish');

    await expect(page.getByText('Describe this photo for people who can’t see it.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish changes' })).toBeDisabled();

    await editor.openTab('Gallery');
    await editor
      .card('Photos')
      .getByRole('group', { name: `Photo ${String(count + 1)}` })
      .getByLabel('Description')
      .fill('The whole circle mid-beat');
    await editor.waitForSave();
    await editor.openTab('Review & publish');

    await expect(page.getByRole('button', { name: 'Publish changes' })).toBeEnabled();
  });

  test('should add a team member with a cropped photo and show them on the site', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Team');
    const team = editor.card('Team members');
    const count = await team.getByLabel('Name', { exact: true }).count();
    await team.getByRole('button', { name: 'Add team member' }).click();
    const member = team.getByRole('group', { name: `Team member ${String(count + 1)}` });
    await member.getByLabel('Name', { exact: true }).fill('Asha Rao');
    await member.getByRole('button', { name: 'Choose or upload' }).click();
    await member.getByLabel('Choose photos').setInputFiles([photo]);
    await member.getByRole('button', { name: 'Choose new-photo.jpg' }).click();
    await member.getByLabel('Description').fill('Asha playing a djembe');
    await member.getByRole('button', { name: 'Crop' }).click();
    await member.getByRole('button', { name: 'Move the frame right' }).click();
    await member.getByRole('button', { name: 'Use this crop' }).click();
    await editor.waitForSave();
    await editor.publish();
    await page.goto('/team');

    await expect(page.getByRole('heading', { name: 'Asha Rao' })).toBeVisible();
  });

  test('should add a video with its YouTube thumbnail', async ({ editor, page }) => {
    await editor.openTab('Videos');
    const videos = editor.card('Videos');
    const count = await videos.getByLabel('Title').count();
    await videos.getByRole('button', { name: 'Add video' }).click();
    const video = videos.getByRole('group', { name: `Video ${String(count + 1)}` });
    await video.getByRole('button', { name: 'Use the YouTube thumbnail' }).click();
    await expect(video.getByText('Paste a YouTube video link first')).toBeVisible();

    await video.getByLabel('YouTube link').fill('https://youtu.be/dQw4w9WgXcQ');
    await video.getByLabel('Title').fill('A new circle');
    await video.getByRole('button', { name: 'Use the YouTube thumbnail' }).click();
    await editor.waitForSave();
    await editor.publish();
    await page.goto('/videos');

    await expect(page.getByRole('link', { name: /A new circle/ })).toBeVisible();
  });

  test('should show spotlight fields only for a featured show, and allow one', async ({
    editor,
    page,
  }) => {
    await editor.openTab('Shows');
    const shows = editor.card('Show formats');
    const first = shows.getByRole('group', { name: 'Show 1', exact: true });
    const second = shows.getByRole('group', { name: 'Show 2', exact: true });
    await expect(first.getByRole('group', { name: 'Spotlight text' })).toBeVisible();
    await expect(second.getByRole('group', { name: 'Spotlight text' })).toHaveCount(0);

    await second.getByRole('switch', { name: 'Featured' }).check();
    await expect(second.getByRole('group', { name: 'Spotlight text' })).toBeVisible();
    await second.getByLabel('Title', { exact: true }).last().fill('A second spotlight');
    await second.getByLabel('Button to the proposal form').fill('Book');
    await second.getByLabel('Button to the Videos page').fill('Watch');
    await editor.waitForSave();
    await editor.openTab('Review & publish');

    await expect(page.getByText('Only one show can be featured.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish changes' })).toBeDisabled();
  });
});
