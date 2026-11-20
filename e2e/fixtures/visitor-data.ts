import { type Page } from '@playwright/test';

/** Where the offline database keeps written documents (FAKE_OVERLAY_STORAGE_KEY). */
const FAKE_OVERLAY_STORAGE_KEY = 'taal-yatra.fake-db.overlay';

/** Today in Pune, as the admin area counts days. */
function siteDay(offsetDays = 0): string {
  const day = new Date(Date.now() + offsetDays * 86_400_000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(day);
}

const seconds = (offsetDays: number): number =>
  Math.floor((Date.now() + offsetDays * 86_400_000) / 1000);

/** Leads and visits as Firestore would hold them; the seed file has none, so the live site never gets these. */
const SAMPLE = [
  [
    'proposals/e2e-asha',
    {
      name: 'Asha Rao',
      phone: '98200 12345',
      email: 'asha@example.com',
      eventType: 'Corporate',
      groupSize: '50–100',
      message: 'A drum circle for our offsite.',
      createdAt: { seconds: seconds(-1) },
    },
  ],
  [
    'proposals/e2e-ravi',
    {
      name: 'Ravi Kumar',
      phone: '91234 56789',
      email: 'ravi@example.com',
      eventType: 'Wedding',
      groupSize: '10–50',
      createdAt: { seconds: seconds(-3) },
    },
  ],
  [
    `visitDays/${siteDay(-1)}`,
    { total: 12, pages: { '/': 9, '/shows': 3 }, devices: { phone: 8, desktop: 4 } },
  ],
] as const;

/** Adds the sample to the offline database, then reloads so the editor reads it. */
export async function seedVisitorData(page: Page): Promise<void> {
  await page.evaluate(
    ({ key, entries }) => {
      const saved = JSON.parse(localStorage.getItem(key) ?? '[]') as unknown[];
      localStorage.setItem(key, JSON.stringify([...saved, ...entries]));
    },
    { key: FAKE_OVERLAY_STORAGE_KEY, entries: SAMPLE },
  );
  await page.goto('/admin');
  await page.getByRole('heading', { name: 'Welcome back' }).waitFor();
}
