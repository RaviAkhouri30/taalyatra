import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from '../fixtures/test';

/** Emulator REST endpoint for the proposals collection; "owner" bypasses the rules. */
const PROPOSALS_URL =
  'http://127.0.0.1:8080/v1/projects/demo-taal-yatra/databases/(default)/documents/proposals';

/** Emulator REST root; "owner" bypasses the rules, standing in for data already stored. */
const DOCUMENTS_URL =
  'http://127.0.0.1:8080/v1/projects/demo-taal-yatra/databases/(default)/documents';
const OWNER = { Authorization: 'Bearer owner' };

/** A day in Pune, `offsetDays` from today, as the admin area counts days. */
function siteDay(offsetDays: number): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(
    new Date(Date.now() + offsetDays * 86_400_000),
  );
}

/** Shape of the emulator's REST answer, as far as this spec reads it. */
interface IProposalsListing {
  readonly documents?: readonly { readonly fields: { readonly name: { stringValue: string } } }[];
}

/** A real JPEG, so the browser's decoder and canvas really run. */
const SAMPLE_PHOTO = 'public/images/og/taal-yatra.jpg';

test.describe('Firebase smoke (emulator)', () => {
  test('should render documents, list sections and collections from Firestore', async ({
    home,
  }) => {
    await home.open();

    await expect(home.heroHeading).toContainText('Find your rhythm.');
    // site/config feeds the chrome: the footer's email link comes from it.
    await expect(
      home.page.locator('app-footer').getByRole('link', { name: /contact@taalyatra\.in/ }),
    ).toBeVisible();
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
    await form.getByRole('textbox', { name: 'Email' }).fill('asha@example.com');
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

  test('should sign the emulator admin in with Firebase Auth', async ({ admin }) => {
    await admin.openPath('/admin/sign-in');

    // Created by `seed-firestore.mjs --emulator` (EMULATOR_USERS); not a real account.
    await admin.signIn('admin@taalyatra.test', 'emulator-admin-password');

    await expect(admin.heading).toHaveText('Welcome back');
    // Shown in the top bar, or in the Menu drawer on phones (0017 U6).
    await expect(admin.page.getByText('admin@taalyatra.test')).not.toHaveCount(0);
  });

  test('should let the admin edit, preview and publish through the Firestore rules', async ({
    editor,
    page,
  }, info) => {
    // Unique per viewport: the projects share one emulator database, one after another.
    const title = `Watch us play (${info.project.name})`;
    await editor.signIn({ email: 'admin@taalyatra.test', password: 'emulator-admin-password' });
    await editor.openTab('Videos');

    await editor.card('Section heading').getByLabel('Title', { exact: true }).fill(title);
    await editor.waitForSave();
    await expect(editor.preview.locator('#watch h2')).toHaveText(title, { timeout: 15_000 });
    await editor.publish();
    await page.goto('/');

    await expect(page.locator('#watch h2')).toHaveText(title);
  });

  test('should publish a collection through the Firestore rules', async ({ editor, page }) => {
    await editor.signIn({ email: 'admin@taalyatra.test', password: 'emulator-admin-password' });
    await editor.openTab('Gallery');
    const photos = editor.card('Photos');
    const second = await photos.getByLabel('Description').nth(1).inputValue();

    await photos.getByRole('button', { name: 'Move Photo 2 up' }).click();
    await editor.waitForSave();
    await editor.publish();
    await page.reload();
    await editor.openTab('Gallery');

    await expect(editor.card('Photos').getByLabel('Description').first()).toHaveValue(second);
  });

  test('should publish a hidden video through the Firestore rules, then show it again', async ({
    editor,
    page,
  }) => {
    // The viewports share one database: the video is shown again at the end, as it was.
    const toggle = async (on: boolean): Promise<void> => {
      await editor.openTab('Videos');
      const videos = editor.card('Videos');
      await videos.getByRole('button', { name: /^\[Video title 1\]/ }).click();
      const hidden = videos
        .getByRole('group', { name: 'Video 1', exact: true })
        .getByRole('switch', { name: 'Hidden' });
      await (on ? hidden.check() : hidden.uncheck());
      await editor.waitForSave();
      await editor.publish();
    };
    await editor.signIn({ email: 'admin@taalyatra.test', password: 'emulator-admin-password' });

    await toggle(true);
    await page.goto('/videos');
    await expect(page.getByRole('main')).not.toContainText('[Video title 1]');
    await page.goto('/admin');
    await toggle(false);
    await page.goto('/videos');

    await expect(page.getByRole('main')).toContainText('[Video title 1]');
  });

  test('should publish a change to the experiences through the Firestore rules', async ({
    editor,
    page,
  }, info) => {
    const name = `Drum Circle (${info.project.name})`;
    await editor.signIn({ email: 'admin@taalyatra.test', password: 'emulator-admin-password' });
    await editor.openTab('Experiences');
    const cards = editor.card('Experiences', { exact: true });

    await cards.getByLabel('Name', { exact: true }).first().fill(name);
    await editor.waitForSave();
    await editor.publish();
    await page.goto('/');

    await expect(page.locator('#experiences').getByRole('heading', { name })).toBeAttached();
  });

  test('should store a real visit’s speed report through the rules, and show it', async ({
    editor,
    page,
  }) => {
    // Playwright's browser says it's driven by a script, and the site rightly doesn't report
    // those. This test stands in for a person's visit, so it hides that one signal.
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
    });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // The visit is counted too (0018): wait for the speed report itself.
    const stored = page.waitForResponse(
      (response) =>
        response.url().includes(':commit') &&
        response.status() === 200 &&
        (response.request().postData() ?? '').includes('/documents/vitals/'),
      { timeout: 20_000 },
    );
    // Hiding the page sends it at once, as when a visitor switches away.
    await page.evaluate(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await stored;

    await editor.signIn({ email: 'admin@taalyatra.test', password: 'emulator-admin-password' });
    await page.getByRole('button', { name: 'Show the speed report' }).click();

    await expect(page.getByRole('caption')).toContainText('3 in 4 visits');
  });

  test('should upload through the real adapter and store it through the Firestore rules', async ({
    editor,
    page,
  }, info) => {
    // The function and Cloudinary are stand-ins; the browser, adapter, Auth and rules are real.
    const name = `smoke-${info.project.name}.jpg`;
    const id = randomUUID();
    const publicId = `taal-yatra/media/${id}`;
    const uploadUrl = 'https://api.cloudinary.com/v1_1/emulator-demo/image/upload';
    let signToken: string | undefined;
    let sent: { readonly token: string | undefined; readonly body: string } | undefined;
    await page.route('**/api/media/sign', async (route) => {
      signToken = route.request().headers()['x-firebase-token'];
      await route.fulfill({
        json: { uploadUrl, fields: { api_key: 'key', signature: 'sig', public_id: publicId } },
      });
    });
    await page.route(uploadUrl, async (route) => {
      sent = {
        token: route.request().headers()['x-firebase-token'],
        body: route.request().postDataBuffer()?.toString('latin1') ?? '',
      };
      await route.fulfill({
        json: {
          public_id: publicId,
          version: 1,
          width: 1200,
          height: 630,
          bytes: 1000,
          format: 'jpg',
        },
      });
    });
    await page.route('https://res.cloudinary.com/**', (route) =>
      route.fulfill({ path: SAMPLE_PHOTO }),
    );
    await editor.signIn({ email: 'admin@taalyatra.test', password: 'emulator-admin-password' });
    await editor.openTab('Photo library');

    await editor.uploadPhotos({
      name,
      mimeType: 'image/jpeg',
      buffer: readFileSync(SAMPLE_PHOTO),
    });

    await expect(page.getByRole('status').filter({ hasText: '1 of 1 uploaded.' })).toBeVisible();
    expect(signToken).toBeTruthy();
    expect(sent?.token).toBeUndefined();
    expect(sent?.body).toContain(publicId);
    // The browser redrew the photo, so the bytes sent are a JPEG it encoded, not the file itself.
    expect(sent?.body).toContain('name="file"');
    await page.reload();

    await expect(page.getByText(name, { exact: true })).toBeVisible();
  });

  test('should count a person’s visit through the rules, and add finished days up', async ({
    editor,
    page,
    request,
  }) => {
    // Yesterday's visit, already stored: opening Visits adds it up into one document per day.
    const yesterday = siteDay(-1);
    await request.post(`${DOCUMENTS_URL}/visits`, {
      headers: OWNER,
      data: {
        fields: {
          page: { stringValue: '/shows' },
          device: { stringValue: 'phone' },
          createdAt: { timestampValue: `${yesterday}T06:30:00Z` },
        },
      },
    });
    // Today's, from a "person" (see the speed report test for why webdriver is hidden).
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false });
    });
    const counted = page.waitForResponse(
      (response) =>
        response.url().includes(':commit') &&
        response.status() === 200 &&
        (response.request().postData() ?? '').includes('/documents/visits/'),
      { timeout: 20_000 },
    );
    await page.goto('/');
    await counted;

    await editor.signIn({ email: 'admin@taalyatra.test', password: 'emulator-admin-password' });
    await editor.openTab('Visits');

    await expect(page.getByRole('figure', { name: 'Visits' })).toContainText('in the last 30 days');
    await expect(page.getByRole('region', { name: 'Where visitors arrive' })).toContainText(
      'Shows',
    );
    const day = await request.get(`${DOCUMENTS_URL}/visitDays/${yesterday}`, { headers: OWNER });
    expect(day.status()).toBe(200);
  });

  test('should let the admin read a lead and change its status through the rules', async ({
    editor,
    page,
    request,
  }) => {
    const name = `Lead ${String(Date.now())}`;
    await request.post(`${PROPOSALS_URL}?documentId=smoke-${randomUUID().slice(0, 8)}`, {
      headers: OWNER,
      data: {
        fields: {
          name: { stringValue: name },
          phone: { stringValue: '98765 43210' },
          email: { stringValue: 'lead@example.com' },
          createdAt: { timestampValue: new Date().toISOString() },
        },
      },
    });

    await editor.signIn({ email: 'admin@taalyatra.test', password: 'emulator-admin-password' });
    await editor.openTab('Leads');
    const lead = page.getByRole('article', { name });
    await lead.getByLabel('Status').selectOption('won');

    // Read back as stored: the whole document was written back, and the rules let only the
    // status change.
    await expect(async () => {
      const response = await request.get(PROPOSALS_URL, { headers: OWNER });
      const listing = (await response.json()) as {
        documents?: { fields: Record<string, { stringValue?: string }> }[];
      };
      const stored = listing.documents?.find((entry) => entry.fields['name']?.stringValue === name);
      expect(stored?.fields['status']?.stringValue).toBe('won');
    }).toPass({ timeout: 10_000 });
  });
});
