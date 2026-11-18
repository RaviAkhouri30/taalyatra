import { readFileSync } from 'node:fs';
import { type RulesTestEnvironment, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  type Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const DENIED = { code: 'permission-denied' };

/** The production admin UID; `firestore.rules` checks it and the emulator build uses it too. */
const ADMIN_UID = '5zsz2DlUaja2Ss7wbFTrpiMMROk2';

const STATUS_AT = '2026-11-18T05:00:00.000Z';

/** Visit counts and the Leads page (0018). */
describe('firestore.rules · visits and leads', () => {
  let env: RulesTestEnvironment;
  let admin: Firestore;
  let member: Firestore;
  let visitor: Firestore;

  const visit = (change: object = {}) => ({
    page: '/',
    device: 'phone',
    createdAt: serverTimestamp(),
    ...change,
  });
  const day = (change: object = {}) => ({
    total: 3,
    pages: { '/': 2, '/shows': 1 },
    devices: { phone: 2, desktop: 1 },
    ...change,
  });

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
      await setDoc(doc(db, 'visits/existing'), { page: '/', device: 'phone' });
      await setDoc(doc(db, 'visitDays/2026-11-17'), day());
      await setDoc(doc(db, 'proposals/existing'), { name: 'Asha', phone: '98200 00000' });
    });
    admin = env.authenticatedContext(ADMIN_UID).firestore() as unknown as Firestore;
    member = env.authenticatedContext('someone-else').firestore() as unknown as Firestore;
    visitor = env.unauthenticatedContext().firestore() as unknown as Firestore;
  });

  afterAll(async () => {
    await env.cleanup();
  });

  describe('visits', () => {
    it.each(['/', '/shows', '/videos', '/team', '/achievements'])(
      'should let a visitor count a visit to %s',
      async (page) => {
        await expect(addDoc(collection(visitor, 'visits'), visit({ page }))).resolves.toBeDefined();
      },
    );

    it.each([
      ['a page not on the list', { page: '/admin' }],
      ['a query string', { page: '/?who=asha' }],
      ['an unknown device', { device: 'fridge' }],
      ['an extra field, such as an id', { visitorId: 'abc' }],
      ['a made-up time', { createdAt: new Date('2020-01-01') }],
    ])('should refuse %s', async (_case, change) => {
      await expect(addDoc(collection(visitor, 'visits'), visit(change))).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should stop a visitor reading, changing or deleting visits', async () => {
      await expect(getDocs(collection(visitor, 'visits'))).rejects.toMatchObject(DENIED);
      await expect(setDoc(doc(visitor, 'visits/existing'), visit())).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(visitor, 'visits/existing'))).rejects.toMatchObject(DENIED);
    });

    it('should let the admin read and delete visits, but not change them', async () => {
      await expect(getDocs(collection(admin, 'visits'))).resolves.toBeDefined();
      await expect(
        setDoc(doc(admin, 'visits/existing'), { page: '/', device: 'desktop' }),
      ).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(admin, 'visits/existing'))).resolves.toBeUndefined();
    });
  });

  describe('visit days', () => {
    it('should let the admin add a day up once and read it', async () => {
      await expect(setDoc(doc(admin, 'visitDays/2026-11-18'), day())).resolves.toBeUndefined();
      await expect(getDoc(doc(admin, 'visitDays/2026-11-18'))).resolves.toBeDefined();
    });

    it('should stop a day being changed or deleted once added up', async () => {
      await expect(
        setDoc(doc(admin, 'visitDays/2026-11-17'), day({ total: 1 })),
      ).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(admin, 'visitDays/2026-11-17'))).rejects.toMatchObject(DENIED);
    });

    it.each([
      ['an id that is not a date', 'yesterday', day()],
      ['a total as text', '2026-11-18', day({ total: '3' })],
      ['a negative total', '2026-11-18', day({ total: -1 })],
      ['an unknown page', '2026-11-18', day({ pages: { '/admin': 1 } })],
      ['an unknown device', '2026-11-18', day({ devices: { fridge: 1 } })],
      ['an extra field', '2026-11-18', day({ note: 'x' })],
    ])('should refuse %s', async (_case, id, fields) => {
      await expect(setDoc(doc(admin, `visitDays/${id}`), fields)).rejects.toMatchObject(DENIED);
    });

    it('should stop anyone else reading or adding days', async () => {
      await expect(getDocs(collection(visitor, 'visitDays'))).rejects.toMatchObject(DENIED);
      await expect(getDocs(collection(member, 'visitDays'))).rejects.toMatchObject(DENIED);
      await expect(setDoc(doc(member, 'visitDays/2026-11-18'), day())).rejects.toMatchObject(
        DENIED,
      );
    });
  });

  describe('leads', () => {
    it('should let the admin read leads and change a status', async () => {
      await expect(getDocs(collection(admin, 'proposals'))).resolves.toBeDefined();
      await expect(
        updateDoc(doc(admin, 'proposals/existing'), { status: 'contacted', statusAt: STATUS_AT }),
      ).resolves.toBeUndefined();
    });

    it.each(['new', 'contacted', 'won', 'lost'])('should accept the status %s', async (status) => {
      await expect(
        updateDoc(doc(admin, 'proposals/existing'), { status, statusAt: STATUS_AT }),
      ).resolves.toBeUndefined();
    });

    it.each([
      ['an unknown status', { status: 'maybe', statusAt: STATUS_AT }],
      ['a status without its time', { status: 'won', statusAt: '' }],
      ['a changed name', { name: 'Someone else' }],
      ['a changed phone with the status', { status: 'won', statusAt: STATUS_AT, phone: '1' }],
    ])('should refuse %s', async (_case, change) => {
      await expect(updateDoc(doc(admin, 'proposals/existing'), change)).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should let the admin delete a lead', async () => {
      await expect(deleteDoc(doc(admin, 'proposals/existing'))).resolves.toBeUndefined();
    });

    it('should stop another signed-in account reading, changing or deleting leads', async () => {
      await expect(getDocs(collection(member, 'proposals'))).rejects.toMatchObject(DENIED);
      await expect(
        updateDoc(doc(member, 'proposals/existing'), { status: 'won', statusAt: STATUS_AT }),
      ).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(member, 'proposals/existing'))).rejects.toMatchObject(DENIED);
    });
  });
});
