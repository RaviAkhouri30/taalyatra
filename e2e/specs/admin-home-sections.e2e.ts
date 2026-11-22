import { Buffer } from 'node:buffer';
import { expect, test } from '../fixtures/test';

const photo = {
  name: 'insta-post.jpg',
  mimeType: 'image/jpeg',
  buffer: Buffer.from([0xff, 0xd8, 0xff, 0xd9]),
};

/** The editor pages new in 2.10.0, each with a card to wait for (0028). */
const NEW_PAGES: readonly (readonly [page: string, card: string])[] = [
  ['Our philosophy', 'Section heading and pillars'],
  ['Where we play', 'Where we play'],
  ['How it works', 'How it works'],
  ['Instagram', 'Instagram'],
  ['Testimonials', 'Section heading and numbers'],
  ['FAQ', 'Questions and answers'],
];

/** The home sections made editable in 2.10.0 (0028), with the Fake backend. */
test.describe('Admin home sections', () => {
  test.beforeEach(async ({ editor }) => {
    await editor.signIn();
  });

  test('should publish a changed FAQ question to the site', async ({ editor, home }) => {
    await editor.openTab('FAQ');
    const first = editor.card('Questions and answers').getByRole('group', { name: 'Question 1' });
    await first.getByLabel('Question', { exact: true }).fill('Do we need any musical experience?');
    await editor.waitForSave();

    await editor.publish();
    await home.open('faq');

    await expect(home.section('faq')).toContainText('Do we need any musical experience?');
  });

  test('should add a highlighted city', async ({ editor, home }) => {
    await editor.openTab('Where we play');
    const card = editor.card('Where we play');
    const count = await card.getByRole('group', { name: /^City \d+$/ }).count();
    await card.getByRole('button', { name: 'Add city' }).click();
    const city = card.getByRole('group', { name: `City ${String(count + 1)}` });
    await city.getByLabel('Name', { exact: true }).fill('Mumbai');
    await city.getByRole('switch', { name: 'Highlighted' }).check();
    await editor.waitForSave();

    await editor.publish();
    await home.open('cities');

    await expect(home.section('cities')).toContainText('Mumbai');
  });

  test('should change a reason in the trust strip under the hero', async ({
    editor,
    home,
    page,
  }) => {
    await editor.openTab('Hero');
    const reason = editor.card('Trust strip').getByRole('group', { name: 'Reason 1' });
    await reason.getByLabel('Title', { exact: true }).fill('Led by a trained facilitator');
    await editor.waitForSave();

    await editor.publish();
    await home.open();

    await expect(page.getByText('Led by a trained facilitator')).toBeVisible();
  });

  test('should give an Instagram post a photo from the library', async ({ editor, page }) => {
    await editor.openTab('Instagram');
    const post = editor.card('Instagram').getByRole('group', { name: 'Post 1' });
    await post.getByRole('button', { name: 'Choose or upload' }).click();
    await post.getByLabel('Choose photos').setInputFiles([photo]);
    await post.getByRole('button', { name: `Choose ${photo.name}` }).click();

    await editor.waitForSave();
    await expect(page.getByText('Saved in your draft')).toBeVisible();
  });

  for (const [name, card] of NEW_PAGES) {
    test(`should have no WCAG 2.2 AA violations on ${name}`, async ({ editor, page, axe }) => {
      await editor.openTab(name);
      await editor.card(card, { exact: true }).waitFor();
      await page.mouse.move(0, 0);

      expect((await axe().exclude('iframe').analyze()).violations).toEqual([]);
    });
  }
});
