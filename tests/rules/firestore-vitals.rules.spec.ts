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
} from 'firebase/firestore';

const DENIED = { code: 'permission-denied' };

/** The production admin UID; `firestore.rules` checks it and the emulator build uses it too. */
const ADMIN_UID = '5zsz2DlUaja2Ss7wbFTrpiMMROk2';

/** Anonymous speed reports (0012): anyone may create a well-formed one, and only that. */
describe('firestore.rules · speed reports', () => {
  let env: RulesTestEnvironment;
  let admin: Firestore;
  let visitor: Firestore;

  const report = (change: object = {}) => ({
    page: '/',
    device: 'phone',
    connection: '4g',
    lcp: 3600,
    fcp: 800,
    ttfb: 120,
    ready: 950,
    cls: 0.01,
    createdAt: serverTimestamp(),
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
      await setDoc(doc(context.firestore(), 'vitals/existing'), { device: 'phone' });
    });
    admin = env.authenticatedContext(ADMIN_UID).firestore() as unknown as Firestore;
    visitor = env.unauthenticatedContext().firestore() as unknown as Firestore;
  });

  afterAll(async () => {
    await env.cleanup();
  });

  it.each([
    ['a full report', {}],
    ['a browser that could not measure', { lcp: null, fcp: null, ttfb: null, ready: null }],
    ['no connection class', { connection: '' }],
    ['the longest time allowed', { lcp: 120_000 }],
    ['no layout shift', { cls: 0 }],
    ['a whole-number layout shift', { cls: 10 }],
  ])('should let a visitor store %s', async (_case, change) => {
    await expect(addDoc(collection(visitor, 'vitals'), report(change))).resolves.toBeDefined();
  });

  it.each(['/', '/shows', '/videos', '/team', '/achievements'])(
    'should accept %s',
    async (page) => {
      await expect(addDoc(collection(visitor, 'vitals'), report({ page }))).resolves.toBeDefined();
    },
  );

  it.each([
    ['a page not on the list', { page: '/admin' }],
    ['a query string', { page: '/?who=asha' }],
    ['an unknown device', { device: 'fridge' }],
    ['an unknown connection', { connection: '5g' }],
    ['a time past the limit', { lcp: 120_001 }],
    ['a negative time', { ttfb: -1 }],
    ['a time as text', { fcp: '800' }],
    ['a huge layout shift', { cls: 11 }],
    ['an extra field, such as an id', { visitorId: 'abc' }],
    ['a made-up time', { createdAt: new Date('2020-01-01') }],
  ])('should refuse %s', async (_case, change) => {
    await expect(addDoc(collection(visitor, 'vitals'), report(change))).rejects.toMatchObject(
      DENIED,
    );
  });

  it('should refuse a report with a field missing', async () => {
    const fields = new Map(Object.entries(report()));
    fields.delete('lcp');

    await expect(
      addDoc(collection(visitor, 'vitals'), Object.fromEntries(fields)),
    ).rejects.toMatchObject(DENIED);
  });

  it('should stop a visitor reading, changing or deleting reports', async () => {
    await expect(getDoc(doc(visitor, 'vitals/existing'))).rejects.toMatchObject(DENIED);
    await expect(getDocs(collection(visitor, 'vitals'))).rejects.toMatchObject(DENIED);
    await expect(setDoc(doc(visitor, 'vitals/existing'), report())).rejects.toMatchObject(DENIED);
    await expect(deleteDoc(doc(visitor, 'vitals/existing'))).rejects.toMatchObject(DENIED);
  });

  it('should let the admin read and delete them, but not change them', async () => {
    await expect(getDocs(collection(admin, 'vitals'))).resolves.toBeDefined();
    await expect(
      setDoc(doc(admin, 'vitals/existing'), { device: 'desktop' }),
    ).rejects.toMatchObject(DENIED);
    await expect(deleteDoc(doc(admin, 'vitals/existing'))).resolves.toBeUndefined();
  });
});
