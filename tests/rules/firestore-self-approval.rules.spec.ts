import { type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { type Firestore, doc, setDoc, writeBatch } from 'firebase/firestore';
import fakeDb from '../../src/app/core/backends/fake/fake-db.json';
import {
  DENIED,
  type Fields,
  MANAGER_UID,
  SAVED_AT,
  home,
  managerRole,
  rulesEnvironment,
  seedManagers,
} from './testing/manager.fixture';

const lists = fakeDb as unknown as Record<string, Fields[]>;
const item = (name: string): Fields => ({ ...lists[name]?.[0], order: 0 });
const changedTitle = (section: string): Fields => ({ ...home[section], title: 'Approved title' });

const FIRST = '2026-11-21T10-00-00-000Z';
const SECOND = '2026-11-21T11-00-00-000Z';

/** A self-approved history record, as the editor writes it (0023). */
function selfApproved(
  changed: readonly string[],
  approval: Fields = { title: 'Diwali', note: '' },
): Fields {
  return { publishedAt: SAVED_AT, changed, before: {}, by: MANAGER_UID, selfApproval: approval };
}

/** A manager who can approve their own changes (0023): self-approving pages that need approval. */
describe('firestore.rules · a manager approving their own changes', () => {
  let env: RulesTestEnvironment;
  let manager: Firestore;

  async function setCanApprove(canApprove: boolean): Promise<void> {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `roles/${MANAGER_UID}`), managerRole({ canApprove }));
    });
  }

  /** The editor's commit: the live page, its self-approved record, and the marker. */
  function commit(id: string, paths: string[], options: { marker?: boolean } = {}) {
    const batch = writeBatch(manager);
    if (paths.includes('home/offer')) {
      batch.set(doc(manager, 'home/offer'), changedTitle('offer'));
    }
    batch.set(doc(manager, `publishes/${id}`), selfApproved(paths));
    if (options.marker !== false) {
      batch.set(doc(manager, `selfApprovals/${MANAGER_UID}`), { record: id, paths });
    }
    return batch.commit();
  }

  beforeAll(async () => {
    env = await rulesEnvironment();
  });

  beforeEach(async () => {
    manager = (await seedManagers(env)).manager;
    await setCanApprove(true);
  });

  afterAll(async () => {
    await env.cleanup();
  });

  it('should publish a page that needs approval with the manager’s own approval', async () => {
    await expect(commit(FIRST, ['home/offer'])).resolves.toBeUndefined();
  });

  it('should refuse it from a manager without the switch', async () => {
    await setCanApprove(false);

    await expect(commit(FIRST, ['home/offer'])).rejects.toMatchObject(DENIED);
  });

  it('should refuse it without the marker in the same commit', async () => {
    await expect(commit(FIRST, ['home/offer'], { marker: false })).rejects.toMatchObject(DENIED);
  });

  it('should refuse a later write that reuses the last commit’s marker', async () => {
    await commit(FIRST, ['home/offer']);

    await expect(setDoc(doc(manager, 'home/offer'), changedTitle('offer'))).rejects.toMatchObject(
      DENIED,
    );
  });

  it('should refuse a marker pointing at a record that already existed', async () => {
    await commit(FIRST, ['home/offer']);
    const batch = writeBatch(manager);
    batch.set(doc(manager, 'home/offer'), { ...changedTitle('offer'), title: 'Again' });
    batch.set(doc(manager, `selfApprovals/${MANAGER_UID}`), {
      record: FIRST,
      paths: ['home/offer', 'home/hero'],
    });

    await expect(batch.commit()).rejects.toMatchObject(DENIED);
  });

  it('should accept a second self-approval with its own new record', async () => {
    await commit(FIRST, ['home/offer']);

    await expect(commit(SECOND, ['home/offer'])).resolves.toBeUndefined();
  });

  it('should refuse a page hidden from the manager', async () => {
    const batch = writeBatch(manager);
    batch.set(doc(manager, 'team/001'), item('team'));
    batch.set(doc(manager, `publishes/${FIRST}`), selfApproved(['team']));
    batch.set(doc(manager, `selfApprovals/${MANAGER_UID}`), { record: FIRST, paths: ['team'] });

    await expect(batch.commit()).rejects.toMatchObject(DENIED);
  });

  it.each([
    [
      'without its approval',
      { publishedAt: SAVED_AT, changed: ['home/offer'], before: {}, by: MANAGER_UID },
    ],
    [
      'with a title over 80 characters',
      selfApproved(['home/offer'], { title: 'x'.repeat(81), note: '' }),
    ],
    [
      'with an unknown field in its approval',
      selfApproved(['home/offer'], { title: '', note: '', by: 'x' }),
    ],
  ])('should refuse a record naming a page that needs approval %s', async (_case, data) => {
    await expect(setDoc(doc(manager, `publishes/${FIRST}`), data)).rejects.toMatchObject(DENIED);
  });

  it('should accept a large self-approved publish within the rules’ lookup limits', async () => {
    const paths = ['home/offer', 'home/shows', 'showFormats', 'home/gallery', 'gallery'];
    const batch = writeBatch(manager);
    batch.set(doc(manager, 'home/offer'), changedTitle('offer'));
    batch.set(doc(manager, 'home/shows'), changedTitle('shows'));
    batch.set(doc(manager, 'home/gallery'), changedTitle('gallery'));
    for (const number of ['001', '002', '003', '004', '005', '006']) {
      batch.set(doc(manager, `showFormats/${number}`), item('showFormats'));
      batch.set(doc(manager, `gallery/${number}`), item('gallery'));
    }
    batch.set(doc(manager, `publishes/${FIRST}`), selfApproved(paths));
    batch.set(doc(manager, `selfApprovals/${MANAGER_UID}`), { record: FIRST, paths });

    await expect(batch.commit()).resolves.toBeUndefined();
  });

  it('should let the owner give a manager the switch, and refuse anything but yes or no', async () => {
    const owner = env.authenticatedContext('5zsz2DlUaja2Ss7wbFTrpiMMROk2').firestore();

    await expect(
      setDoc(doc(owner, `roles/${MANAGER_UID}`), managerRole({ canApprove: true })),
    ).resolves.toBeUndefined();
    await expect(
      setDoc(doc(owner, `roles/${MANAGER_UID}`), managerRole({ canApprove: 'yes' })),
    ).rejects.toMatchObject(DENIED);
  });
});
