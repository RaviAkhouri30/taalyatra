import { type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { type Firestore, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import {
  DENIED,
  type Fields,
  MANAGER_UID,
  SAVED_AT,
  managerDraft,
  managerRole,
  pages,
  rulesEnvironment,
  seedManagers,
  siteConfig,
} from './testing/manager.fixture';

/** The inner pages made editable in 2.11.0, and the editor page each is on (0028). */
const INNER_PAGES: readonly (readonly [page: string, editorPage: string])[] = [
  ['videos', 'videos'],
  ['team', 'team'],
  ['shows', 'shows'],
  ['achievements', 'achievements'],
];

/** @returns The page as stored, with a new heading. */
function changed(page: string, title = 'A new title'): Fields {
  const stored = pages[page] ?? {};
  return { ...stored, hero: { ...(stored['hero'] as Fields), title } };
}

/** @returns Each page's stored title and description, all empty but `change`. */
function seo(change: Fields = {}): Fields {
  const empty = { title: '', description: '' };
  return { home: empty, videos: empty, team: empty, shows: empty, achievements: empty, ...change };
}

const FIRST = '2026-11-22T12-00-00-000Z';

/** The inner pages and search titles of 2.11.0 (0028): who may change them, and their shape. */
describe('firestore.rules · the inner pages and search titles of 2.11.0', () => {
  let env: RulesTestEnvironment;
  let owner: Firestore;
  let manager: Firestore;

  /** Sets the manager's page settings, as Team access would. */
  async function setPages(settings: Fields, change: Fields = {}): Promise<void> {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), `roles/${MANAGER_UID}`),
        managerRole({ pages: settings, ...change }),
      );
    });
  }

  beforeAll(async () => {
    env = await rulesEnvironment();
  });

  beforeEach(async () => {
    const clients = await seedManagers(env);
    owner = clients.owner;
    manager = clients.manager;
  });

  afterAll(async () => {
    await env.cleanup();
  });

  describe('the inner pages', () => {
    it.each(INNER_PAGES)('should let the owner publish %s', async (page) => {
      await expect(setDoc(doc(owner, `pages/${page}`), changed(page))).resolves.toBeUndefined();
    });

    it.each(INNER_PAGES)(
      'should let a manager publish %s on its page set to publish',
      async (page, editorPage) => {
        await setPages({ [editorPage]: 'publish' });

        await expect(setDoc(doc(manager, `pages/${page}`), changed(page))).resolves.toBeUndefined();
      },
    );

    it.each(INNER_PAGES)(
      'should refuse a manager %s on its page needing approval',
      async (page) => {
        await setPages({});

        await expect(setDoc(doc(manager, `pages/${page}`), changed(page))).rejects.toMatchObject(
          DENIED,
        );
      },
    );

    it('should refuse even the owner the admin page’s wording', async () => {
      await expect(
        updateDoc(doc(owner, 'pages/admin'), { 'signIn.heading': 'Hello' }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should refuse a page with a part the site doesn’t render', async () => {
      await expect(
        setDoc(doc(owner, 'pages/team'), { ...changed('team'), extra: 'x' }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should refuse a heading without a title, or with one over the limit', async () => {
      await expect(setDoc(doc(owner, 'pages/shows'), changed('shows', ''))).rejects.toMatchObject(
        DENIED,
      );
      await expect(
        setDoc(doc(owner, 'pages/shows'), changed('shows', 'x'.repeat(121))),
      ).rejects.toMatchObject(DENIED);
    });

    it('should let a manager draft a page they see, but not one hidden from them', async () => {
      await setPages({ achievements: 'approval', team: 'hidden' });

      await expect(
        setDoc(doc(manager, 'drafts/pages__achievements'), managerDraft('pages/achievements')),
      ).resolves.toBeUndefined();
      await expect(
        setDoc(doc(manager, 'drafts/pages__team'), managerDraft('pages/team')),
      ).rejects.toMatchObject(DENIED);
    });

    it('should accept a manager’s publish of a page with its history record', async () => {
      await setPages({ achievements: 'publish', videos: 'publish' });
      const batch = writeBatch(manager);
      batch.set(doc(manager, 'pages/achievements'), changed('achievements'));
      batch.set(doc(manager, 'pages/videos'), changed('videos'));
      batch.set(doc(manager, `publishes/${FIRST}`), {
        publishedAt: SAVED_AT,
        changed: ['pages/achievements', 'pages/videos'],
        before: {},
        by: MANAGER_UID,
      });

      await expect(batch.commit()).resolves.toBeUndefined();
    });

    it('should let a manager who can approve self-approve a page', async () => {
      await setPages({}, { canApprove: true });
      const batch = writeBatch(manager);
      batch.set(doc(manager, 'pages/shows'), changed('shows'));
      batch.set(doc(manager, `publishes/${FIRST}`), {
        publishedAt: SAVED_AT,
        changed: ['pages/shows'],
        before: {},
        by: MANAGER_UID,
        selfApproval: { title: 'Shows page', note: '' },
      });
      batch.set(doc(manager, `selfApprovals/${MANAGER_UID}`), {
        record: FIRST,
        paths: ['pages/shows'],
      });

      await expect(batch.commit()).resolves.toBeUndefined();
    });
  });

  describe('search and sharing', () => {
    it('should let the owner store a page’s title and description', async () => {
      await expect(
        setDoc(doc(owner, 'site/config'), {
          ...siteConfig,
          seo: seo({ team: { title: 'Meet the team', description: 'Who plays.' } }),
        }),
      ).resolves.toBeUndefined();
    });

    it('should refuse a page the site doesn’t have', async () => {
      await expect(
        setDoc(doc(owner, 'site/config'), {
          ...siteConfig,
          seo: { ...seo(), admin: { title: 'x', description: '' } },
        }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should refuse a title over 70 characters or a description over 200', async () => {
      await expect(
        setDoc(doc(owner, 'site/config'), {
          ...siteConfig,
          seo: seo({ home: { title: 'x'.repeat(71), description: '' } }),
        }),
      ).rejects.toMatchObject(DENIED);
      await expect(
        setDoc(doc(owner, 'site/config'), {
          ...siteConfig,
          seo: seo({ home: { title: '', description: 'x'.repeat(201) } }),
        }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should refuse a page’s entry with a part it doesn’t have', async () => {
      await expect(
        setDoc(doc(owner, 'site/config'), {
          ...siteConfig,
          seo: seo({ home: { title: '', description: '', image: 'x' } }),
        }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should let a manager with Search and sharing set to publish change only that', async () => {
      await setPages({ seo: 'publish' });
      const titled = seo({ videos: { title: 'Our videos', description: '' } });

      await expect(
        setDoc(doc(manager, 'site/config'), { ...siteConfig, seo: titled }),
      ).resolves.toBeUndefined();
      await expect(
        setDoc(doc(manager, 'site/config'), {
          ...siteConfig,
          seo: titled,
          copyrightYear: 2030,
        }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should refuse a manager whose Search and sharing needs approval', async () => {
      await setPages({ seo: 'approval' });

      await expect(
        setDoc(doc(manager, 'site/config'), {
          ...siteConfig,
          seo: seo({ shows: { title: 'Shows', description: '' } }),
        }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should let a manager who sees only Search and sharing draft the site settings', async () => {
      await setPages({ seo: 'approval', business: 'hidden', offer: 'hidden', contact: 'hidden' });

      await expect(
        setDoc(doc(manager, 'drafts/site__config'), managerDraft('site/config')),
      ).resolves.toBeUndefined();
    });
  });

  it('should accept a role with the two new pages', async () => {
    await expect(
      setDoc(
        doc(owner, `roles/${MANAGER_UID}`),
        managerRole({ pages: { achievements: 'publish', seo: 'hidden' } }),
      ),
    ).resolves.toBeUndefined();
  });
});
