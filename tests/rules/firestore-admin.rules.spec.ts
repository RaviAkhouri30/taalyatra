import { readFileSync } from 'node:fs';
import { type RulesTestEnvironment, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { type Firestore, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { HomeSection } from '../../src/app/shared/enums/home-section.enum';
import { SitePage } from '../../src/app/shared/enums/site-page.enum';
import { SiteWidget } from '../../src/app/shared/enums/site-widget.enum';
import {
  CONTENT_MAX_LENGTH,
  EDITABLE_HOME_SECTIONS,
} from '../../src/app/shared/constants/content-limits.constants';
import fakeDb from '../../src/app/core/backends/fake/fake-db.json';

/** What the emulator rejects a write or read with when the rules don't allow it. */
const DENIED = { code: 'permission-denied' };

/** The production admin UID; `firestore.rules` checks it and the emulator build uses it too. */
const ADMIN_UID = '5zsz2DlUaja2Ss7wbFTrpiMMROk2';

type Fields = Record<string, unknown>;

const home = fakeDb.home as unknown as Record<string, Fields>;
const siteConfig = fakeDb.site.config as unknown as Fields;
const promotion = siteConfig['promotion'] as Fields;

/** Every switch from the enums, so the rules' key lists can't fall behind them. */
const fullVisibility = (value: boolean) => ({
  sections: Object.fromEntries(Object.values(HomeSection).map((key) => [key, value])),
  pages: Object.fromEntries(Object.values(SitePage).map((key) => [key, value])),
  widgets: Object.fromEntries(Object.values(SiteWidget).map((key) => [key, value])),
});

/** Runs against the emulator started by `npm run test:rules` (project `demo-taal-yatra`). */
describe('firestore.rules · admin editor', () => {
  let env: RulesTestEnvironment;
  let admin: Firestore;
  let member: Firestore;
  let visitor: Firestore;

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: 'demo-taal-yatra',
      firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    });
  });

  beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await Promise.all(
        // List sections are stored in the `_items` envelope, as the seed script stores them.
        Object.entries(home).map(([section, body]) =>
          setDoc(doc(db, `home/${section}`), Array.isArray(body) ? { _items: body } : body),
        ),
      );
      await setDoc(doc(db, 'site/config'), siteConfig);
    });
    admin = env.authenticatedContext(ADMIN_UID).firestore() as unknown as Firestore;
    member = env.authenticatedContext('someone-else').firestore() as unknown as Firestore;
    visitor = env.unauthenticatedContext().firestore() as unknown as Firestore;
  });

  afterAll(async () => {
    await env.cleanup();
  });

  describe('home sections', () => {
    it.each(EDITABLE_HOME_SECTIONS)('should let the admin change the title of %s', async (id) => {
      const changed = { ...home[id], title: 'A new title' };

      await expect(setDoc(doc(admin, `home/${id}`), changed)).resolves.toBeUndefined();
    });

    it('should accept headings at their maximum length', async () => {
      const longest = {
        eyebrow: 'x'.repeat(CONTENT_MAX_LENGTH.eyebrow),
        title: 'x'.repeat(CONTENT_MAX_LENGTH.title),
        highlight: 'x'.repeat(CONTENT_MAX_LENGTH.highlight),
        lead: 'x'.repeat(CONTENT_MAX_LENGTH.lead),
      };

      await expect(
        setDoc(doc(admin, 'home/hero'), { ...home['hero'], ...longest }),
      ).resolves.toBeUndefined();
    });

    it.each(['eyebrow', 'title', 'highlight', 'lead'] as const)(
      'should reject %s when it is one character over its limit',
      async (field) => {
        const tooLong = { ...home['hero'], [field]: 'x'.repeat(CONTENT_MAX_LENGTH[field] + 1) };

        await expect(setDoc(doc(admin, 'home/hero'), tooLong)).rejects.toMatchObject(DENIED);
      },
    );

    it('should reject an added field', async () => {
      await expect(
        setDoc(doc(admin, 'home/hero'), { ...home['hero'], extra: 'x' }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should reject a removed field', async () => {
      const withoutLead = Object.fromEntries(
        Object.entries(home['hero'] ?? {}).filter(([field]) => field !== 'lead'),
      );

      await expect(setDoc(doc(admin, 'home/hero'), withoutLead)).rejects.toMatchObject(DENIED);
    });

    it('should stop the admin changing a section the editor does not cover yet', async () => {
      await expect(
        setDoc(doc(admin, 'home/faq'), { ...home['faq'], title: 'Changed' }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should stop the admin deleting a section', async () => {
      await expect(deleteDoc(doc(admin, 'home/hero'))).rejects.toMatchObject(DENIED);
    });

    it('should stop another signed-in account changing a section', async () => {
      await expect(
        setDoc(doc(member, 'home/hero'), { ...home['hero'], title: 'Hacked' }),
      ).rejects.toMatchObject(DENIED);
    });
  });

  describe('site config', () => {
    const withPromotion = (change: Fields) => ({
      ...siteConfig,
      promotion: { ...promotion, ...change },
    });

    it('should let the admin schedule the promotion', async () => {
      const scheduled = withPromotion({ live: true, startsOn: '2026-11-01', endsOn: null });

      await expect(setDoc(doc(admin, 'site/config'), scheduled)).resolves.toBeUndefined();
    });

    it.each([
      ['a date in another format', { startsOn: '01/11/2026' }],
      ['a non-boolean switch', { live: 'yes' }],
      ['an unknown promotion field', { price: 100 }],
    ])('should reject a promotion with %s', async (_case, change) => {
      await expect(setDoc(doc(admin, 'site/config'), withPromotion(change))).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should reject an unknown top-level field', async () => {
      await expect(
        setDoc(doc(admin, 'site/config'), { ...siteConfig, admin: true }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should reject an empty brand name', async () => {
      const brand = { ...(siteConfig['brand'] as Fields), name: '' };

      await expect(
        setDoc(doc(admin, 'site/config'), { ...siteConfig, brand }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should stop another signed-in account changing it', async () => {
      await expect(setDoc(doc(member, 'site/config'), siteConfig)).rejects.toMatchObject(DENIED);
    });
  });

  describe('site visibility', () => {
    it('should let the admin switch every section, page and widget off', async () => {
      await expect(
        setDoc(doc(admin, 'site/visibility'), fullVisibility(false)),
      ).resolves.toBeUndefined();
    });

    it('should reject an unknown section key', async () => {
      const visibility = { ...fullVisibility(true), sections: { hero: false } };

      await expect(setDoc(doc(admin, 'site/visibility'), visibility)).rejects.toMatchObject(DENIED);
    });

    it('should stop a visitor changing it', async () => {
      await expect(
        setDoc(doc(visitor, 'site/visibility'), fullVisibility(false)),
      ).rejects.toMatchObject(DENIED);
    });
  });

  describe('drafts and publish history', () => {
    it.each(['drafts/home__hero', 'publishes/2026-10-31T10-00-00Z'])(
      'should let the admin write and read %s',
      async (path) => {
        await setDoc(doc(admin, path), { path: 'home/hero', content: {} });

        await expect(getDoc(doc(admin, path))).resolves.toBeDefined();
      },
    );

    it.each(['drafts/home__hero', 'publishes/2026-10-31T10-00-00Z'])(
      'should stop anyone else reading or writing %s',
      async (path) => {
        await expect(setDoc(doc(member, path), { content: {} })).rejects.toMatchObject(DENIED);
        await expect(getDoc(doc(visitor, path))).rejects.toMatchObject(DENIED);
      },
    );
  });
});
