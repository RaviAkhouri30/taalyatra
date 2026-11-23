import { type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { type Firestore, doc, setDoc } from 'firebase/firestore';
import fakeDb from '../../src/app/core/backends/fake/fake-db.json';
import { DENIED, type Fields, rulesEnvironment, seedManagers } from './testing/manager.fixture';

/** The collections whose items can be hidden (2.15.0). */
const COLLECTIONS = ['videos', 'team', 'showFormats', 'gallery'] as const;

const lists = fakeDb as unknown as Record<string, readonly Fields[]>;

/** @returns The collection's first stored item, as a publish writes it. */
function item(collection: string, change: Fields = {}): Fields {
  return { ...lists[collection]?.[0], order: 0, ...change };
}

/** Hiding one item (2.15.0): a collection's item may say it's hidden, true or false. */
describe('firestore.rules · hidden items of 2.15.0', () => {
  let env: RulesTestEnvironment;
  let owner: Firestore;

  beforeAll(async () => {
    env = await rulesEnvironment();
  });

  beforeEach(async () => {
    owner = (await seedManagers(env)).owner;
  });

  afterAll(async () => {
    await env.cleanup();
  });

  it.each(COLLECTIONS)('should accept a hidden item in %s', async (collection) => {
    await expect(
      setDoc(doc(owner, `${collection}/001`), item(collection, { hidden: true })),
    ).resolves.toBeUndefined();
  });

  it.each(COLLECTIONS)('should accept an item in %s shown again', async (collection) => {
    await expect(
      setDoc(doc(owner, `${collection}/001`), item(collection, { hidden: false })),
    ).resolves.toBeUndefined();
  });

  it.each(COLLECTIONS)(
    'should refuse hidden as anything but true or false in %s',
    async (collection) => {
      await expect(
        setDoc(doc(owner, `${collection}/001`), item(collection, { hidden: 'yes' })),
      ).rejects.toMatchObject(DENIED);
    },
  );
});
