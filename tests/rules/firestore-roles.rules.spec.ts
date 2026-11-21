import { type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  collection,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import {
  DENIED,
  type IClients,
  MANAGER_UID,
  NO_UPLOADS_UID,
  OWNER_EMAIL,
  OWNER_UID,
  approvalRequest,
  managerDraft,
  managerRole,
  rulesEnvironment,
  seedManagers,
} from './testing/manager.fixture';

const SAVED_AT_LATER = '2026-11-19T11:00:00.000Z';

/** Team access, the shared drafts and approvals (0019). */
describe('firestore.rules · roles, drafts and approvals', () => {
  let env: RulesTestEnvironment;
  let clients: IClients;

  beforeAll(async () => {
    env = await rulesEnvironment();
  });

  beforeEach(async () => {
    clients = await seedManagers(env);
  });

  afterAll(async () => {
    await env.cleanup();
  });

  describe('roles', () => {
    it('should let the owner add, change and remove a manager', async () => {
      const { owner } = clients;

      await expect(setDoc(doc(owner, 'roles/new-person'), managerRole())).resolves.toBeUndefined();
      await expect(
        setDoc(doc(owner, 'roles/new-person'), managerRole({ uploads: false })),
      ).resolves.toBeUndefined();
      await expect(deleteDoc(doc(owner, 'roles/new-person'))).resolves.toBeUndefined();
    });

    it.each([
      ['an unknown page', { pages: { secret: 'publish' } }],
      ['an unknown setting', { pages: { hero: 'admin' } }],
      ['uploads as text', { uploads: 'yes' }],
      ['an extra field', { role: 'owner' }],
      ['a missing email', { email: '' }],
    ])('should refuse a role with %s', async (_case, change) => {
      await expect(
        setDoc(doc(clients.owner, 'roles/new-person'), managerRole(change)),
      ).rejects.toMatchObject(DENIED);
    });

    it('should refuse a role for the owner, who is fixed in the rules', async () => {
      await expect(
        setDoc(doc(clients.owner, `roles/${OWNER_UID}`), managerRole()),
      ).rejects.toMatchObject(DENIED);
    });

    it('should let a manager read their own role and no one else’s', async () => {
      await expect(getDoc(doc(clients.manager, `roles/${MANAGER_UID}`))).resolves.toBeDefined();
      await expect(getDoc(doc(clients.manager, `roles/${NO_UPLOADS_UID}`))).rejects.toMatchObject(
        DENIED,
      );
      await expect(getDocs(collection(clients.manager, 'roles'))).rejects.toMatchObject(DENIED);
    });

    it('should stop a manager giving themselves more rights', async () => {
      const everything = managerRole({ pages: { offer: 'publish' } });

      await expect(
        setDoc(doc(clients.manager, `roles/${MANAGER_UID}`), everything),
      ).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(clients.manager, `roles/${MANAGER_UID}`))).rejects.toMatchObject(
        DENIED,
      );
    });
  });

  describe('drafts', () => {
    it.each(['home/hero', 'home/offer', 'site/config', 'showFormats', 'site/visibility'])(
      'should let a manager save a draft of %s',
      async (path) => {
        const key = path.replace('/', '__');

        await expect(
          setDoc(doc(clients.manager, `drafts/${key}`), managerDraft(path)),
        ).resolves.toBeUndefined();
      },
    );

    it.each([
      ['a hidden page', 'drafts/team', managerDraft('team')],
      ['a hidden page’s heading', 'drafts/home__team', managerDraft('home/team')],
      ['an unknown document', 'drafts/home__secret', managerDraft('home/secret')],
      ['an id that is not its path', 'drafts/home__offer', managerDraft('home/hero')],
      [
        'someone else’s name on it',
        'drafts/home__hero',
        managerDraft('home/hero', { savedBy: 'x' }),
      ],
      ['an extra field', 'drafts/home__hero', managerDraft('home/hero', { waiting: true })],
    ])('should refuse a manager’s draft of %s', async (_case, path, data) => {
      await expect(setDoc(doc(clients.manager, path), data)).rejects.toMatchObject(DENIED);
    });

    it('should let a manager read every draft, and someone never added none', async () => {
      await expect(getDocs(collection(clients.manager, 'drafts'))).resolves.toBeDefined();
      await expect(getDocs(collection(clients.member, 'drafts'))).rejects.toMatchObject(DENIED);
    });

    it('should let a manager throw away a draft of a page they can see', async () => {
      await setDoc(doc(clients.owner, 'drafts/home__hero'), managerDraft('home/hero'));

      await expect(deleteDoc(doc(clients.manager, 'drafts/home__hero'))).resolves.toBeUndefined();
    });

    it('should stop a manager throwing away a draft of a hidden page', async () => {
      await setDoc(doc(clients.owner, 'drafts/team'), managerDraft('team'));

      await expect(deleteDoc(doc(clients.manager, 'drafts/team'))).rejects.toMatchObject(DENIED);
    });
  });

  describe('approvals', () => {
    const send = () => {
      const batch = writeBatch(clients.manager);
      batch.set(doc(clients.manager, 'approvals/request-1'), approvalRequest());
      batch.set(doc(clients.manager, 'locks/home__offer'), { approval: 'request-1' });
      return batch.commit();
    };

    it('should let a manager send a change for approval, locking its draft', async () => {
      await expect(send()).resolves.toBeUndefined();
    });

    it('should stop a manager changing or throwing away a draft that waits', async () => {
      await setDoc(doc(clients.manager, 'drafts/home__offer'), managerDraft('home/offer'));
      await send();

      await expect(
        setDoc(doc(clients.manager, 'drafts/home__offer'), managerDraft('home/offer')),
      ).rejects.toMatchObject(DENIED);
      await expect(deleteDoc(doc(clients.manager, 'drafts/home__offer'))).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should let the owner still adjust a draft that waits', async () => {
      await send();

      await expect(
        setDoc(doc(clients.owner, 'drafts/home__offer'), managerDraft('home/offer')),
      ).resolves.toBeUndefined();
    });

    it.each([
      ['in someone else’s name', approvalRequest({ by: NO_UPLOADS_UID })],
      ['already approved', approvalRequest({ status: 'approved' })],
      ['with no pages', approvalRequest({ paths: [] })],
      ['with an extra field', approvalRequest({ urgent: true })],
    ])('should refuse a request %s', async (_case, data) => {
      await expect(setDoc(doc(clients.manager, 'approvals/request-1'), data)).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should refuse a lock without a waiting request of the manager’s own', async () => {
      await setDoc(
        doc(clients.noUploads, 'approvals/theirs'),
        approvalRequest({ by: NO_UPLOADS_UID }),
      );

      await expect(
        setDoc(doc(clients.manager, 'locks/home__hero'), { approval: 'missing' }),
      ).rejects.toMatchObject(DENIED);
      await expect(
        setDoc(doc(clients.manager, 'locks/home__hero'), { approval: 'theirs' }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should stop a page being sent twice while it waits', async () => {
      await send();
      const again = writeBatch(clients.manager);
      again.set(doc(clients.manager, 'approvals/request-2'), approvalRequest());
      again.set(doc(clients.manager, 'locks/home__offer'), { approval: 'request-2' });

      await expect(again.commit()).rejects.toMatchObject(DENIED);
    });

    it('should let a manager withdraw a request together with its locks', async () => {
      await send();
      const withdraw = writeBatch(clients.manager);
      withdraw.delete(doc(clients.manager, 'approvals/request-1'));
      withdraw.delete(doc(clients.manager, 'locks/home__offer'));

      await expect(withdraw.commit()).resolves.toBeUndefined();
    });

    it('should stop a manager removing a lock while its request still waits', async () => {
      await send();

      await expect(deleteDoc(doc(clients.manager, 'locks/home__offer'))).rejects.toMatchObject(
        DENIED,
      );
    });

    it('should let the owner send a request back with a reason, and not change what was sent', async () => {
      await send();
      const answer = {
        status: 'sent-back',
        answer: 'Dates are wrong',
        answeredAt: SAVED_AT_LATER,
        answeredBy: OWNER_EMAIL,
      };

      await expect(
        setDoc(doc(clients.owner, 'approvals/request-1'), { ...approvalRequest(), ...answer }),
      ).resolves.toBeUndefined();
      await expect(
        setDoc(doc(clients.owner, 'approvals/request-1'), {
          ...approvalRequest({ paths: ['home/hero'] }),
          ...answer,
        }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should stop a manager answering a request, and anyone never added sending one', async () => {
      await send();

      await expect(
        setDoc(
          doc(clients.manager, 'approvals/request-1'),
          approvalRequest({ status: 'approved' }),
        ),
      ).rejects.toMatchObject(DENIED);
      await expect(
        setDoc(doc(clients.member, 'approvals/request-9'), approvalRequest({ by: 'someone-else' })),
      ).rejects.toMatchObject(DENIED);
    });
  });
});
