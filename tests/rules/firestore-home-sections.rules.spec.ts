import { type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { type Firestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import {
  DENIED,
  type Fields,
  MANAGER_UID,
  SAVED_AT,
  home,
  managerDraft,
  managerRole,
  rulesEnvironment,
  seedManagers,
} from './testing/manager.fixture';

/** The sections made editable in 2.10.0, and the editor page each is on (0028). */
const NEW_SECTIONS: readonly (readonly [section: string, page: string])[] = [
  ['marquee', 'hero'],
  ['trust', 'hero'],
  ['philosophy', 'philosophy'],
  ['midCta', 'philosophy'],
  ['cities', 'cities'],
  ['how', 'how'],
  ['instagram', 'instagram'],
  ['proof', 'testimonials'],
  ['faq', 'faq'],
];

/** @returns The section as stored, changed: a list section keeps its `_items` envelope. */
function changed(section: string): Fields {
  const stored: unknown = home[section];
  return Array.isArray(stored)
    ? { _items: [...(stored as unknown[]).slice(1)] }
    : { ...(stored as Fields), title: 'A new title' };
}

const FIRST = '2026-11-22T10-00-00-000Z';

/** The home sections editable since 2.10.0 (0028): who may publish them, and their shape. */
describe('firestore.rules · the home sections of 2.10.0', () => {
  let env: RulesTestEnvironment;
  let owner: Firestore;
  let manager: Firestore;

  /** Sets the manager's page settings, as Team access would. */
  async function setPages(pages: Fields, change: Fields = {}): Promise<void> {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), `roles/${MANAGER_UID}`),
        managerRole({ pages, ...change }),
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

  it.each(NEW_SECTIONS)('should let the owner publish %s', async (section) => {
    await expect(setDoc(doc(owner, `home/${section}`), changed(section))).resolves.toBeUndefined();
  });

  it.each(NEW_SECTIONS)(
    'should let a manager publish %s on its page set to publish',
    async (section, page) => {
      await setPages({ [page]: 'publish' });

      await expect(
        setDoc(doc(manager, `home/${section}`), changed(section)),
      ).resolves.toBeUndefined();
    },
  );

  it.each(NEW_SECTIONS)(
    'should refuse a manager %s on its page needing approval',
    async (section) => {
      await setPages({});

      await expect(setDoc(doc(manager, `home/${section}`), changed(section))).rejects.toMatchObject(
        DENIED,
      );
    },
  );

  it('should let a manager draft on a new page they see, but not one hidden from them', async () => {
    await setPages({ faq: 'approval', cities: 'hidden' });

    await expect(
      setDoc(doc(manager, 'drafts/home__faq'), managerDraft('home/faq')),
    ).resolves.toBeUndefined();
    await expect(
      setDoc(doc(manager, 'drafts/home__cities'), managerDraft('home/cities')),
    ).rejects.toMatchObject(DENIED);
  });

  it('should accept a manager’s publish of a new page with its history record', async () => {
    await setPages({ testimonials: 'publish', philosophy: 'publish' });
    const batch = writeBatch(manager);
    batch.set(doc(manager, 'home/proof'), changed('proof'));
    batch.set(doc(manager, 'home/midCta'), changed('midCta'));
    batch.set(doc(manager, `publishes/${FIRST}`), {
      publishedAt: SAVED_AT,
      changed: ['home/proof', 'home/midCta'],
      before: {},
      by: MANAGER_UID,
    });

    await expect(batch.commit()).resolves.toBeUndefined();
  });

  it('should let a manager who can approve self-approve a new page', async () => {
    await setPages({}, { canApprove: true });
    const batch = writeBatch(manager);
    batch.set(doc(manager, 'home/faq'), changed('faq'));
    batch.set(doc(manager, `publishes/${FIRST}`), {
      publishedAt: SAVED_AT,
      changed: ['home/faq'],
      before: {},
      by: MANAGER_UID,
      selfApproval: { title: 'FAQ', note: '' },
    });
    batch.set(doc(manager, `selfApprovals/${MANAGER_UID}`), { record: FIRST, paths: ['home/faq'] });

    await expect(batch.commit()).resolves.toBeUndefined();
  });

  it('should refuse a new section with a field the site doesn’t render', async () => {
    await expect(
      setDoc(doc(owner, 'home/faq'), { ...changed('faq'), extra: 'x' }),
    ).rejects.toMatchObject(DENIED);
  });

  it('should refuse a new section with a title over the limit', async () => {
    await expect(
      setDoc(doc(owner, 'home/how'), { ...changed('how'), title: 'x'.repeat(121) }),
    ).rejects.toMatchObject(DENIED);
  });

  it('should accept a role with the six new pages', async () => {
    const pages = {
      philosophy: 'publish',
      cities: 'hidden',
      how: 'approval',
      instagram: 'publish',
      testimonials: 'approval',
      faq: 'hidden',
    };

    await expect(
      setDoc(doc(owner, `roles/${MANAGER_UID}`), managerRole({ pages })),
    ).resolves.toBeUndefined();
  });
});
