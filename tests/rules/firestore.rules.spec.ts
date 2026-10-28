import { readFileSync } from 'node:fs';
import { type RulesTestEnvironment, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import {
  type Firestore,
  Timestamp,
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
import { PROPOSAL_MAX_LENGTH } from '../../src/app/features/home/sections/contact/proposal-limits.constants';

/** What the emulator rejects a write or read with when the rules don't allow it. */
const DENIED = { code: 'permission-denied' };

/** Runs against the emulator started by `npm run test:rules` (project `demo-taal-yatra`). */
describe('firestore.rules', () => {
  let env: RulesTestEnvironment;
  let visitor: Firestore;

  const proposal = () => ({
    need: 'A workshop or drum circle',
    eventType: 'Corporate team',
    experience: 'Drum Circle',
    groupSize: '20–50',
    date: '2026-12-01',
    name: 'Asha',
    phone: '9876543210',
    email: 'asha@example.com',
    message: 'Looking forward to it',
    createdAt: serverTimestamp(),
  });

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: 'demo-taal-yatra',
      firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    });
  });

  beforeEach(async () => {
    await env.clearFirestore();
    // Seed as an admin, the way scripts/seed-firestore.mjs does (rules don't apply).
    await env.withSecurityRulesDisabled(async (context) => {
      const admin = context.firestore();
      await setDoc(doc(admin, 'home/hero'), { title: 'Taal Yatra' });
      await setDoc(doc(admin, 'site/config'), { copyrightYear: 2026 });
      await setDoc(doc(admin, 'videos/001'), { title: 'Video', order: 0 });
      await setDoc(doc(admin, 'proposals/existing'), { name: 'Ravi' });
    });
    visitor = env.unauthenticatedContext().firestore() as unknown as Firestore;
  });

  afterAll(async () => {
    await env.cleanup();
  });

  describe('public content', () => {
    it.each(['home/hero', 'site/config', 'videos/001', 'gallery/001', 'team/001'])(
      'should let anyone read %s',
      async (path) => {
        await expect(getDoc(doc(visitor, path))).resolves.toBeDefined();
      },
    );

    it.each(['videos', 'gallery', 'team'])('should let anyone list %s', async (path) => {
      await expect(getDocs(collection(visitor, path))).resolves.toBeDefined();
    });

    it.each(['home/hero', 'site/config', 'videos/001', 'gallery/001', 'team/001'])(
      'should stop a client writing %s',
      async (path) => {
        await expect(setDoc(doc(visitor, path), { title: 'Hacked' })).rejects.toMatchObject(DENIED);
        await expect(updateDoc(doc(visitor, path), { title: 'Hacked' })).rejects.toMatchObject(
          DENIED,
        );
        await expect(deleteDoc(doc(visitor, path))).rejects.toMatchObject(DENIED);
      },
    );
  });

  describe('proposals', () => {
    it('should accept a well-formed proposal stamped with the server time', async () => {
      await expect(addDoc(collection(visitor, 'proposals'), proposal())).resolves.toBeDefined();
    });

    it('should accept every field at its maximum length', async () => {
      const longest = Object.fromEntries(
        Object.entries(PROPOSAL_MAX_LENGTH).map(([field, max]) => [field, 'x'.repeat(max)]),
      );

      await expect(
        addDoc(collection(visitor, 'proposals'), { ...proposal(), ...longest }),
      ).resolves.toBeDefined();
    });

    it.each(Object.entries(PROPOSAL_MAX_LENGTH))(
      'should reject %s when it is one character over its limit',
      async (field, max) => {
        await expect(
          addDoc(collection(visitor, 'proposals'), { ...proposal(), [field]: 'x'.repeat(max + 1) }),
        ).rejects.toMatchObject(DENIED);
      },
    );

    it.each([
      ['an empty name', { name: '' }],
      ['an empty phone', { phone: '' }],
      ['a non-string field', { groupSize: 30 }],
      ['an extra field', { admin: true }],
      ['a client-supplied time', { createdAt: Timestamp.fromDate(new Date('2020-01-01')) }],
    ])('should reject a proposal with %s', async (_case, change) => {
      await expect(
        addDoc(collection(visitor, 'proposals'), { ...proposal(), ...change }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should reject a proposal with a missing field', async () => {
      const withoutMessage = Object.fromEntries(
        Object.entries(proposal()).filter(([field]) => field !== 'message'),
      );

      await expect(addDoc(collection(visitor, 'proposals'), withoutMessage)).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should stop a client reading, listing, changing or deleting proposals', async () => {
      await expect(getDoc(doc(visitor, 'proposals/existing'))).rejects.toMatchObject(DENIED);
      await expect(getDocs(collection(visitor, 'proposals'))).rejects.toMatchObject(DENIED);
      await expect(
        updateDoc(doc(visitor, 'proposals/existing'), { name: 'Changed' }),
      ).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(visitor, 'proposals/existing'))).rejects.toMatchObject(DENIED);
    });
  });

  it('should deny any path the rules do not mention', async () => {
    await expect(getDoc(doc(visitor, 'secrets/config'))).rejects.toMatchObject(DENIED);
    await expect(setDoc(doc(visitor, 'secrets/config'), { a: 1 })).rejects.toMatchObject(DENIED);
  });
});
