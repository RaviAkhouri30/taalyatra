import { readFileSync } from 'node:fs';
import { type RulesTestEnvironment, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { type Firestore, doc, setDoc } from 'firebase/firestore';
import fakeDb from '../../src/app/core/backends/fake/fake-db.json';

const DENIED = { code: 'permission-denied' };

/** The production admin UID; `firestore.rules` checks it and the emulator build uses it too. */
const ADMIN_UID = '5zsz2DlUaja2Ss7wbFTrpiMMROk2';

/** The Experiences tab writes one document, `home/experiences`, whose keys stay the same. */
describe('firestore.rules · experiences', () => {
  const stored = fakeDb.home.experiences;
  let env: RulesTestEnvironment;
  let admin: Firestore;
  let member: Firestore;

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: 'demo-taal-yatra',
      firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    });
  });

  beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'home/experiences'), stored);
    });
    admin = env.authenticatedContext(ADMIN_UID).firestore() as unknown as Firestore;
    member = env.authenticatedContext('someone-else').firestore() as unknown as Firestore;
  });

  afterAll(async () => {
    await env.cleanup();
  });

  it('should let the admin publish a new featured card with its list', async () => {
    const [next, ...rest] = stored.items;
    const { cta } = stored.featured;
    const changed = { ...stored, featured: { ...next, cta }, items: [stored.featured, ...rest] };

    await expect(setDoc(doc(admin, 'home/experiences'), changed)).resolves.toBeUndefined();
  });

  it('should stop another account changing them', async () => {
    await expect(
      setDoc(doc(member, 'home/experiences'), { ...stored, items: [] }),
    ).rejects.toMatchObject(DENIED);
  });
});
