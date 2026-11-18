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
import fakeDb from '../../src/app/core/backends/fake/fake-db.json';
import {
  DENIED,
  type Fields,
  type IClients,
  MANAGER_UID,
  SAVED_AT,
  home,
  managerDraft,
  rulesEnvironment,
  seedManagers,
  siteConfig,
} from './testing/manager.fixture';

const lists = fakeDb as unknown as Record<string, Fields[]>;
const item = (name: string): Fields => ({ ...lists[name]?.[0], order: 0 });

const MEDIA_ID = '3d813c67-d23d-400e-bcca-a02d2011e587';
const asset = {
  publicId: `taal-yatra/media/${MEDIA_ID}`,
  version: 123,
  width: 2400,
  height: 1800,
  bytes: 5000,
  format: 'jpg',
  name: 'photo.jpg',
  description: '',
  uploadedAt: SAVED_AT,
};

/** @returns A history record as a manager's publish writes it. */
function record(changed: readonly string[], by = MANAGER_UID): Fields {
  return { publishedAt: SAVED_AT, changed, before: {}, by };
}

const changedTitle = (section: string): Fields => ({ ...home[section], title: 'A new title' });

/** What a manager may publish themselves, and what stays with the owner (0019). */
describe('firestore.rules · a manager publishing', () => {
  let env: RulesTestEnvironment;
  let clients: IClients;
  let manager: Firestore;

  beforeAll(async () => {
    env = await rulesEnvironment();
  });

  beforeEach(async () => {
    clients = await seedManagers(env);
    manager = clients.manager;
  });

  afterAll(async () => {
    await env.cleanup();
  });

  describe('live content', () => {
    it('should let a manager publish a page set to "Can publish"', async () => {
      await expect(
        setDoc(doc(manager, 'home/hero'), changedTitle('hero')),
      ).resolves.toBeUndefined();
      await expect(setDoc(doc(manager, 'videos/001'), item('videos'))).resolves.toBeUndefined();
    });

    it.each([
      ['needing approval', 'home/offer', changedTitle('offer')],
      ['hidden', 'home/team', changedTitle('team')],
      ['hidden, as a list', 'team/001', item('team')],
      ['needing approval, as a list', 'gallery/001', item('gallery')],
    ])('should refuse a page %s', async (_case, path, data) => {
      await expect(setDoc(doc(manager, path), data)).rejects.toMatchObject(DENIED);
    });

    it('should let a manager change only their own pages’ parts of the site details', async () => {
      const brand = { ...(siteConfig['brand'] as Fields), name: 'Taal Yatra Live' };
      const contact = { ...(siteConfig['contact'] as Fields), email: 'hello@example.com' };

      await expect(
        setDoc(doc(manager, 'site/config'), { ...siteConfig, brand }),
      ).resolves.toBeUndefined();
      await expect(
        setDoc(doc(manager, 'site/config'), { ...siteConfig, brand, contact }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should refuse site details parts no editor page edits', async () => {
      await expect(
        setDoc(doc(manager, 'site/config'), { ...siteConfig, credit: 'Someone else' }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should refuse an unchanged write from someone never added', async () => {
      await expect(setDoc(doc(clients.member, 'site/config'), siteConfig)).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should take effect at once when the owner removes the manager', async () => {
      await deleteDoc(doc(clients.owner, `roles/${MANAGER_UID}`));

      await expect(setDoc(doc(manager, 'home/hero'), changedTitle('hero'))).rejects.toMatchObject(
        DENIED,
      );
      await expect(getDocs(collection(manager, 'drafts'))).rejects.toMatchObject(DENIED);
    });
  });

  describe('history', () => {
    it('should accept a publish as the editor commits it: content, history, drafts', async () => {
      await setDoc(doc(manager, 'drafts/home__hero'), managerDraft('home/hero'));
      const batch = writeBatch(manager);
      batch.set(doc(manager, 'home/hero'), changedTitle('hero'));
      batch.set(doc(manager, 'publishes/2026-11-19T10-00-00-000Z'), record(['home/hero']));
      batch.delete(doc(manager, 'drafts/home__hero'));

      await expect(batch.commit()).resolves.toBeUndefined();
    });

    it('should accept a large publish within the rules’ lookup limits', async () => {
      const paths = ['home/hero', 'home/videos', 'videos', 'site/config'];
      const brand = { ...(siteConfig['brand'] as Fields), name: 'Taal Yatra Live' };
      await Promise.all(
        paths.map((path) =>
          setDoc(doc(manager, `drafts/${path.replace('/', '__')}`), managerDraft(path)),
        ),
      );
      const batch = writeBatch(manager);
      batch.set(doc(manager, 'home/hero'), changedTitle('hero'));
      batch.set(doc(manager, 'home/videos'), changedTitle('videos'));
      batch.set(doc(manager, 'site/config'), { ...siteConfig, brand });
      for (const number of ['001', '002', '003', '004', '005', '006', '007', '008', '009', '010']) {
        batch.set(doc(manager, `videos/${number}`), item('videos'));
      }
      batch.set(doc(manager, 'publishes/2026-11-19T10-00-00-000Z'), record(paths));
      for (const path of paths) {
        batch.delete(doc(manager, `drafts/${path.replace('/', '__')}`));
      }

      await expect(batch.commit()).resolves.toBeUndefined();
    });

    it.each([
      ['a page needing approval', record(['home/hero', 'home/offer'])],
      ['someone else’s name', record(['home/hero'], 'someone-else')],
    ])('should refuse a history record naming %s', async (_case, data) => {
      await expect(
        setDoc(doc(manager, 'publishes/2026-11-19T10-00-00-000Z'), data),
      ).rejects.toMatchObject(DENIED);
    });

    it('should let a manager read the history but never delete it', async () => {
      await setDoc(doc(clients.owner, 'publishes/old'), record(['home/hero']));

      await expect(getDoc(doc(manager, 'publishes/old'))).resolves.toBeDefined();
      await expect(deleteDoc(doc(manager, 'publishes/old'))).rejects.toMatchObject(DENIED);
    });
  });

  describe('photos', () => {
    it('should let a manager with uploads on add and describe a photo, but not delete it', async () => {
      await expect(setDoc(doc(manager, `media/${MEDIA_ID}`), asset)).resolves.toBeUndefined();
      await expect(
        setDoc(doc(manager, `media/${MEDIA_ID}`), { ...asset, description: 'Drummers' }),
      ).resolves.toBeUndefined();
      await expect(deleteDoc(doc(manager, `media/${MEDIA_ID}`))).rejects.toMatchObject(DENIED);
    });

    it('should let a manager with uploads off pick a photo but not add one', async () => {
      await setDoc(doc(clients.owner, `media/${MEDIA_ID}`), asset);

      await expect(getDocs(collection(clients.noUploads, 'media'))).resolves.toBeDefined();
      await expect(
        setDoc(doc(clients.noUploads, `media/${MEDIA_ID}`), { ...asset, name: 'x.jpg' }),
      ).rejects.toMatchObject(DENIED);
    });
  });

  describe('the owner’s only', () => {
    it.each(['proposals', 'visits', 'visitDays', 'vitals', 'adminState'])(
      'should refuse a manager reading %s',
      async (name) => {
        await expect(getDocs(collection(manager, name))).rejects.toMatchObject(DENIED);
      },
    );

    it('should still let the owner do everything as before', async () => {
      const batch = writeBatch(clients.owner);
      batch.set(doc(clients.owner, 'home/offer'), changedTitle('offer'));
      batch.set(doc(clients.owner, 'site/config'), { ...siteConfig, credit: 'Taal Yatra' });
      batch.set(doc(clients.owner, 'publishes/new'), record(['home/offer', 'site/config']));
      batch.delete(doc(clients.owner, 'publishes/old'));

      await expect(batch.commit()).resolves.toBeUndefined();
    });
  });
});
