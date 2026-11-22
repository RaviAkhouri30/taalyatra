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

/** The chat's script, changed. */
function changed(greeting = 'Hello there!'): Fields {
  return { ...home['assistant'], greeting };
}

const FIRST = '2026-11-23T10-00-00-000Z';

/** The chat assistant's script, editable since 2.12.0 (0028): who may change it, and its shape. */
describe('firestore.rules · the chat assistant of 2.12.0', () => {
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

  it('should let the owner publish the chat’s script', async () => {
    await expect(setDoc(doc(owner, 'home/assistant'), changed())).resolves.toBeUndefined();
  });

  it('should let a manager publish it on Chat assistant set to publish', async () => {
    await setPages({ chat: 'publish' });

    await expect(setDoc(doc(manager, 'home/assistant'), changed())).resolves.toBeUndefined();
  });

  it('should refuse a manager whose Chat assistant needs approval', async () => {
    await setPages({});

    await expect(setDoc(doc(manager, 'home/assistant'), changed())).rejects.toMatchObject(DENIED);
  });

  it('should let a manager draft it, but not when the page is hidden from them', async () => {
    await setPages({ chat: 'approval' });
    await expect(
      setDoc(doc(manager, 'drafts/home__assistant'), managerDraft('home/assistant')),
    ).resolves.toBeUndefined();

    await setPages({ chat: 'hidden' });

    await expect(
      setDoc(doc(manager, 'drafts/home__assistant'), managerDraft('home/assistant')),
    ).rejects.toMatchObject(DENIED);
  });

  it('should let a manager who can approve self-approve the chat’s script', async () => {
    await setPages({}, { canApprove: true });
    const batch = writeBatch(manager);
    batch.set(doc(manager, 'home/assistant'), changed());
    batch.set(doc(manager, `publishes/${FIRST}`), {
      publishedAt: SAVED_AT,
      changed: ['home/assistant'],
      before: {},
      by: MANAGER_UID,
      selfApproval: { title: 'Chat', note: '' },
    });
    batch.set(doc(manager, `selfApprovals/${MANAGER_UID}`), {
      record: FIRST,
      paths: ['home/assistant'],
    });

    await expect(batch.commit()).resolves.toBeUndefined();
  });

  it('should refuse a script with a part the site doesn’t read, or a long title', async () => {
    await expect(
      setDoc(doc(owner, 'home/assistant'), { ...changed(), extra: 'x' }),
    ).rejects.toMatchObject(DENIED);
    await expect(
      setDoc(doc(owner, 'home/assistant'), { ...changed(), title: 'x'.repeat(121) }),
    ).rejects.toMatchObject(DENIED);
  });

  it('should accept a role with the chat page', async () => {
    await expect(
      setDoc(doc(owner, `roles/${MANAGER_UID}`), managerRole({ pages: { chat: 'publish' } })),
    ).resolves.toBeUndefined();
  });
});
