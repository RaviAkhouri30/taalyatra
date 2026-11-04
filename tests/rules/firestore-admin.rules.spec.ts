import { readFileSync } from 'node:fs';
import { type RulesTestEnvironment, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { type Firestore, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { HomeSection } from '../../src/app/shared/enums/home-section.enum';
import { SitePage } from '../../src/app/shared/enums/site-page.enum';
import { SiteWidget } from '../../src/app/shared/enums/site-widget.enum';
import {
  COLLECTION_MAX_ITEMS,
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

  describe('collections', () => {
    const lists = fakeDb as unknown as Record<keyof typeof COLLECTION_MAX_ITEMS, Fields[]>;
    const names = Object.keys(COLLECTION_MAX_ITEMS) as (keyof typeof COLLECTION_MAX_ITEMS)[];
    const item = (name: keyof typeof COLLECTION_MAX_ITEMS, index = 0): Fields => ({
      ...lists[name][index],
      order: index,
    });
    const itemId = (number: number) => String(number).padStart(3, '0');

    it.each(names)('should accept every %s item the site has', async (name) => {
      const writes = lists[name].map((_, index) =>
        setDoc(doc(admin, `${name}/${itemId(index + 1)}`), item(name, index)),
      );

      await expect(Promise.all(writes)).resolves.toBeDefined();
    });

    it.each(names)('should accept %s up to its item limit', async (name) => {
      const last = `${name}/${itemId(COLLECTION_MAX_ITEMS[name])}`;

      await expect(setDoc(doc(admin, last), item(name))).resolves.toBeUndefined();
    });

    it.each(names)('should refuse %s past its item limit', async (name) => {
      const tooMany = `${name}/${itemId(COLLECTION_MAX_ITEMS[name] + 1)}`;

      await expect(setDoc(doc(admin, tooMany), item(name))).rejects.toMatchObject(DENIED);
    });

    it.each(['000', '1', 'abc'])('should refuse the document id %s', async (id) => {
      await expect(setDoc(doc(admin, `gallery/${id}`), item('gallery'))).rejects.toMatchObject(
        DENIED,
      );
    });

    it.each(names)('should refuse %s with an unknown field', async (name) => {
      await expect(
        setDoc(doc(admin, `${name}/001`), { ...item(name), extra: 'x' }),
      ).rejects.toMatchObject(DENIED);
    });

    it.each(names)('should refuse %s without its order', async (name) => {
      const withoutOrder = new Map(Object.entries(item(name)));
      withoutOrder.delete('order');

      await expect(
        setDoc(doc(admin, `${name}/001`), Object.fromEntries(withoutOrder)),
      ).rejects.toMatchObject(DENIED);
    });

    it.each(names)('should let the admin delete from %s', async (name) => {
      await expect(deleteDoc(doc(admin, `${name}/001`))).resolves.toBeUndefined();
    });

    it.each(names)('should stop another account writing or deleting %s', async (name) => {
      await expect(setDoc(doc(member, `${name}/001`), item(name))).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(member, `${name}/001`))).rejects.toMatchObject(DENIED);
    });

    it('should refuse an image with a description over the limit', async () => {
      const alt = 'x'.repeat(CONTENT_MAX_LENGTH.imageAlt + 1);

      await expect(
        setDoc(doc(admin, 'gallery/001'), { ...item('gallery'), alt }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should accept a cropped uploaded image', async () => {
      const src = 'c_crop,x_1,y_2,w_300,h_300/v123/taal-yatra/media/abc';

      await expect(
        setDoc(doc(admin, 'gallery/001'), { ...item('gallery'), src }),
      ).resolves.toBeUndefined();
    });

    it('should refuse a team photo with extra fields', async () => {
      const member1 = item('team');
      const photo = { ...(member1['photo'] as Fields), extra: 'x' };

      await expect(setDoc(doc(admin, 'team/001'), { ...member1, photo })).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should refuse too many skills on a team member', async () => {
      const skills = Array.from({ length: CONTENT_MAX_LENGTH.memberSkills + 1 }, () => 'x');

      await expect(
        setDoc(doc(admin, 'team/001'), { ...item('team'), skills }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should accept a show with no spotlight', async () => {
      await expect(
        setDoc(doc(admin, 'showFormats/001'), { ...item('showFormats'), spotlight: null }),
      ).resolves.toBeUndefined();
    });

    it('should refuse a show spotlight with a missing field', async () => {
      await expect(
        setDoc(doc(admin, 'showFormats/001'), {
          ...item('showFormats'),
          spotlight: { eyebrow: 'x', title: 'y', primaryCta: 'z' },
        }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should refuse a video link that is not https', async () => {
      await expect(
        setDoc(doc(admin, 'videos/001'), { ...item('videos'), url: 'http://example.com/a' }),
      ).rejects.toMatchObject(DENIED);
    });
  });

  describe('media library', () => {
    const id = '3d813c67-d23d-400e-bcca-a02d2011e587';
    const asset = {
      publicId: `taal-yatra/media/${id}`,
      version: 123,
      width: 2400,
      height: 1800,
      bytes: 5000,
      format: 'jpg',
      name: 'photo.jpg',
      description: '',
      uploadedAt: '2026-11-03T10:00:00.000Z',
    };

    it('should let the admin store, read and delete an image', async () => {
      await expect(setDoc(doc(admin, `media/${id}`), asset)).resolves.toBeUndefined();
      await expect(getDoc(doc(admin, `media/${id}`))).resolves.toBeDefined();
      await expect(deleteDoc(doc(admin, `media/${id}`))).resolves.toBeUndefined();
    });

    it.each(['member', 'visitor'] as const)('should keep it private from a %s', async (who) => {
      const client = who === 'member' ? member : visitor;

      await expect(getDoc(doc(client, `media/${id}`))).rejects.toMatchObject(DENIED);
      await expect(setDoc(doc(client, `media/${id}`), asset)).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(client, `media/${id}`))).rejects.toMatchObject(DENIED);
    });

    it.each([
      ['a file outside the upload folder', { publicId: `other/${id}` }],
      ["another document's file", { publicId: 'taal-yatra/media/other' }],
      ['a size that is not a number', { width: '2400' }],
      ['a long file name', { name: 'x'.repeat(CONTENT_MAX_LENGTH.mediaName + 1) }],
      ['an unknown field', { extra: 'x' }],
    ])('should refuse %s', async (_case, change) => {
      await expect(
        setDoc(doc(admin, `media/${id}`), { ...asset, ...change }),
      ).rejects.toMatchObject(DENIED);
    });

    it("should refuse an id that is not an upload's", async () => {
      await expect(
        setDoc(doc(admin, 'media/not-an-id'), { ...asset, publicId: 'taal-yatra/media/not-an-id' }),
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
