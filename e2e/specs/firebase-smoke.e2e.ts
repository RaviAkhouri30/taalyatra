import { expect, test } from '../fixtures/test';

/** Emulator REST endpoint for the proposals collection; "owner" bypasses the rules. */
const PROPOSALS_URL =
  'http://127.0.0.1:8080/v1/projects/demo-taal-yatra/databases/(default)/documents/proposals';

/** Shape of the emulator's REST answer, as far as this spec reads it. */
interface IProposalsListing {
  readonly documents?: readonly { readonly fields: { readonly name: { stringValue: string } } }[];
}

test.describe('Firebase smoke (emulator)', () => {
  test('should render documents, list sections and collections from Firestore', async ({
    home,
  }) => {
    await home.open();

    await expect(home.heroHeading).toContainText('Find your rhythm.');
    // home/trust is a list section stored as { _items: [...] }.
    await expect(home.page.getByText('Facilitator-led', { exact: true })).toBeVisible();

    await home.open('watch');
    // videos is a collection read in `order`: the first card is video 001.
    const videos = home.section('watch').getByRole('link', { name: /^Watch / });
    await expect(videos).toHaveCount(4);
    await expect(videos.first()).toHaveAccessibleName('Watch [Video title 1] on YouTube');

    await home.open('gallery');
    await expect(
      home.section('gallery').getByRole('button', { name: /^Open photo:/ }),
    ).not.toHaveCount(0);

    await home.open('team');
    await expect(home.section('team').getByRole('figure')).toHaveCount(4);
  });

  test('should store a proposal in Firestore when it is submitted', async ({ home, request }) => {
    const name = `Smoke ${String(Date.now())}`;
    await home.open('contact');
    const form = home.contactSection;

    await form.getByRole('textbox', { name: 'Your name' }).fill(name);
    await form.getByRole('textbox', { name: 'Phone' }).fill('98765 43210');
    await form.getByRole('button', { name: 'Request proposal' }).click();
    await expect(form.getByRole('status')).toContainText('on its way');

    // The emulator build's email adapter is the fake one, so only the stored record proves the
    // Firestore write worked.
    const response = await request.get(PROPOSALS_URL, {
      headers: { Authorization: 'Bearer owner' },
    });
    const listing = (await response.json()) as IProposalsListing;
    const names = (listing.documents ?? []).map((document) => document.fields.name.stringValue);
    expect(names).toContain(name);
  });

  test('should pass an axe WCAG 2.2 AA scan with live data', async ({ home, axe }) => {
    await home.open();
    await expect(home.heroHeading).toBeVisible();

    const results = await axe().analyze();

    expect(results.violations).toEqual([]);
  });
});
