import { type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  type Firestore,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  DENIED,
  type Fields,
  type IClients,
  MANAGER_EMAIL,
  MANAGER_UID,
  NO_UPLOADS_UID,
  SAVED_AT,
  approvalRequest,
  home,
  managerDraft,
  managerRole,
  rulesEnvironment,
  seedManagers,
} from './testing/manager.fixture';

const DAY_MS = 86_400_000;
const ANSWERED_AT = '2026-11-21T12:00:00.000Z';
const RECORD = '2026-11-21T12-00-00-000Z';
/** Another manager's request, waiting, with its draft and lock. */
const REQUEST = 'request-1';
const OTHER_EMAIL = 'other@taalyatra.in';

/** A super manager's entry, ending `untilMs` (null: for good). */
const superManager = (untilMs: number | null): Fields => ({ since: SAVED_AT, untilMs });

/** A super manager (0024): stands in for the owner until their end, never on Team access or history. */
describe('firestore.rules · a super manager', () => {
  let env: RulesTestEnvironment;
  let clients: IClients;
  let manager: Firestore;

  async function setRole(change: Fields): Promise<void> {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `roles/${MANAGER_UID}`), managerRole(change));
    });
  }

  /** The approval commit, as `ApprovalService.approve` makes it, by the super manager. */
  function approve(answeredBy: string | null = MANAGER_EMAIL) {
    const batch = writeBatch(manager);
    batch.set(doc(manager, 'home/offer'), { ...home['offer'], title: 'Approved title' });
    batch.set(doc(manager, `publishes/${RECORD}`), {
      publishedAt: ANSWERED_AT,
      changed: ['home/offer'],
      before: {},
      by: MANAGER_UID,
      approvedFrom: OTHER_EMAIL,
    });
    batch.set(doc(manager, `approvals/${REQUEST}`), {
      ...approvalRequest({ by: NO_UPLOADS_UID, email: OTHER_EMAIL }),
      status: 'approved',
      answeredAt: ANSWERED_AT,
      answeredBy,
    });
    batch.delete(doc(manager, 'locks/home__offer'));
    batch.delete(doc(manager, 'drafts/home__offer'));
    return batch.commit();
  }

  /** A publish of the Team page, which the manager's own settings hide. */
  function publishTeam() {
    const batch = writeBatch(manager);
    batch.set(doc(manager, 'home/team'), { ...home['team'], title: 'Our team' });
    batch.set(doc(manager, `publishes/${RECORD}`), {
      publishedAt: ANSWERED_AT,
      changed: ['home/team'],
      before: {},
      by: MANAGER_UID,
    });
    return batch.commit();
  }

  beforeAll(async () => {
    env = await rulesEnvironment();
  });

  beforeEach(async () => {
    clients = await seedManagers(env);
    manager = clients.manager;
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'proposals/lead'), { name: 'Asha', status: 'new' });
      await setDoc(doc(db, 'media/one'), { publicId: 'x' });
      await setDoc(doc(db, 'publishes/old'), { changed: ['home/hero'], by: 'x' });
      await setDoc(
        doc(db, `approvals/${REQUEST}`),
        approvalRequest({ by: NO_UPLOADS_UID, email: OTHER_EMAIL }),
      );
      await setDoc(doc(db, 'locks/home__offer'), { approval: REQUEST });
      await setDoc(
        doc(db, 'drafts/home__offer'),
        managerDraft('home/offer', { savedBy: NO_UPLOADS_UID }),
      );
    });
  });

  afterAll(async () => {
    await env.cleanup();
  });

  describe.each([
    ['for good', null],
    ['before their end', Date.now() + DAY_MS],
  ])('%s', (_case, untilMs) => {
    beforeEach(async () => {
      await setRole({ superManager: superManager(untilMs) });
    });

    it('should publish a page their own settings hide', async () => {
      await expect(publishTeam()).resolves.toBeUndefined();
    });

    it('should approve another manager’s request, signed with their own email', async () => {
      await expect(approve()).resolves.toBeUndefined();
    });

    it('should use every area, delete a lead and delete a photo', async () => {
      await expect(getDocs(collection(manager, 'visits'))).resolves.toBeDefined();
      await expect(deleteDoc(doc(manager, 'proposals/lead'))).resolves.toBeUndefined();
      await expect(deleteDoc(doc(manager, 'media/one'))).resolves.toBeUndefined();
    });

    it('should read every manager’s record, to show who made each change', async () => {
      await expect(getDoc(doc(manager, `roles/${NO_UPLOADS_UID}`))).resolves.toBeDefined();
    });
  });

  describe('after their end', () => {
    beforeEach(async () => {
      await setRole({ superManager: superManager(Date.now() - DAY_MS) });
    });

    it('should refuse the page their own settings hide', async () => {
      await expect(publishTeam()).rejects.toMatchObject(DENIED);
    });

    it('should refuse answering another manager’s request', async () => {
      await expect(approve()).rejects.toMatchObject(DENIED);
    });

    it('should refuse the areas, deleting a lead and deleting a photo', async () => {
      await expect(getDocs(collection(manager, 'visits'))).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(manager, 'proposals/lead'))).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(manager, 'media/one'))).rejects.toMatchObject(DENIED);
    });

    it('should still publish the pages their own settings allow', async () => {
      await expect(
        setDoc(doc(manager, 'home/hero'), { ...home['hero'], title: 'Still mine' }),
      ).resolves.toBeUndefined();
    });
  });

  describe('what stays the owner’s (D1)', () => {
    beforeEach(async () => {
      await setRole({ superManager: superManager(null) });
    });

    it.each([
      ['extend their own end', MANAGER_UID, managerRole({ superManager: superManager(null) })],
      ['change another manager', NO_UPLOADS_UID, managerRole({ pages: {} })],
    ])('should refuse a super manager trying to %s', async (_case, uid, data) => {
      await expect(setDoc(doc(manager, `roles/${uid}`), data)).rejects.toMatchObject(DENIED);
    });

    it('should refuse removing a manager', async () => {
      await expect(deleteDoc(doc(manager, `roles/${NO_UPLOADS_UID}`))).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should refuse deleting or changing a history record', async () => {
      await expect(deleteDoc(doc(manager, 'publishes/old'))).rejects.toMatchObject(DENIED);
      await expect(
        setDoc(doc(manager, 'publishes/old'), { changed: [], by: MANAGER_UID }),
      ).rejects.toMatchObject(DENIED);
    });

    it.each([
      ['someone else’s email', OTHER_EMAIL],
      ['no email', null],
    ])('should refuse an answer signed with %s', async (_case, answeredBy) => {
      await expect(approve(answeredBy)).rejects.toMatchObject(DENIED);
    });
  });

  it('should accept a large publish by a super manager within the rules’ lookup limits', async () => {
    await setRole({ superManager: superManager(Date.now() + DAY_MS) });
    const sections = ['offer', 'shows', 'gallery', 'team', 'audiences', 'experiences'];
    const batch = writeBatch(manager);
    for (const section of sections) {
      batch.set(doc(manager, `home/${section}`), { ...home[section], title: 'Changed' });
    }
    batch.set(doc(manager, `publishes/${RECORD}`), {
      publishedAt: ANSWERED_AT,
      changed: sections.map((section) => `home/${section}`),
      before: {},
      by: MANAGER_UID,
    });

    await expect(batch.commit()).resolves.toBeUndefined();
  });

  describe('Team access storing it', () => {
    it.each([
      ['for good', superManager(null)],
      ['until a date', superManager(Date.now() + DAY_MS)],
    ])('should let the owner make a manager super %s', async (_case, entry) => {
      await expect(
        setDoc(doc(clients.owner, `roles/${MANAGER_UID}`), managerRole({ superManager: entry })),
      ).resolves.toBeUndefined();
    });

    it.each([
      ['an end that isn’t a number', { since: SAVED_AT, untilMs: '2026-11-30' }],
      ['no start', { untilMs: null }],
      ['an unknown field', { ...superManager(null), forever: true }],
      ['not a map', true],
    ])('should refuse a super manager entry with %s', async (_case, entry) => {
      await expect(
        setDoc(doc(clients.owner, `roles/${MANAGER_UID}`), managerRole({ superManager: entry })),
      ).rejects.toMatchObject(DENIED);
    });
  });
});
