import { type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import {
  DENIED,
  MANAGER_UID,
  managerRole,
  rulesEnvironment,
  seedManagers,
  type IClients,
} from './testing/manager.fixture';

const MANAGER_EMAIL = 'content-manager@taalyatra.in';
const STATUS_AT = '2026-11-21T10:00:00.000Z';
const DAY = { total: 3, devices: { phone: 2, desktop: 1 }, pages: { '/': 3 } };
const ALL_ON = { leads: true, visits: true, backups: true, goingBack: true };

/** The owner's areas for chosen managers (0022): each switch opens its collections, nothing more. */
describe('firestore.rules · manager areas', () => {
  let env: RulesTestEnvironment;
  let clients: IClients;

  /** The manager, signed in with their email, as the app does. */
  const manager = () => env.authenticatedContext(MANAGER_UID, { email: MANAGER_EMAIL }).firestore();

  async function giveAreas(areas: Record<string, boolean>): Promise<void> {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `roles/${MANAGER_UID}`), managerRole({ areas }));
    });
  }

  beforeAll(async () => {
    env = await rulesEnvironment();
  });

  beforeEach(async () => {
    clients = await seedManagers(env);
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore();
      await setDoc(doc(db, 'proposals/lead'), { name: 'Asha', status: 'new' });
      await setDoc(doc(db, 'visits/one'), { page: 'home' });
      await setDoc(doc(db, 'vitals/one'), { page: 'home' });
      await setDoc(doc(db, 'adminState/backups'), { lastAt: STATUS_AT });
    });
  });

  afterAll(async () => {
    await env.cleanup();
  });

  describe('without the areas (every manager before 2.3.0)', () => {
    it.each(['proposals', 'visits', 'visitDays', 'vitals'])('should refuse %s', async (name) => {
      await expect(getDocs(collection(manager(), name))).rejects.toMatchObject(DENIED);
    });

    it('should refuse the backup reminder', async () => {
      await expect(getDoc(doc(manager(), 'adminState/backups'))).rejects.toMatchObject(DENIED);
    });
  });

  describe('Leads', () => {
    beforeEach(async () => {
      await giveAreas({ leads: true });
    });

    it('should let the manager read leads and change a status, signed with their email', async () => {
      await expect(getDocs(collection(manager(), 'proposals'))).resolves.toBeDefined();
      await expect(
        updateDoc(doc(manager(), 'proposals/lead'), {
          status: 'contacted',
          statusAt: STATUS_AT,
          statusBy: MANAGER_EMAIL,
        }),
      ).resolves.toBeUndefined();
    });

    it('should refuse a change signed with someone else’s email', async () => {
      await expect(
        updateDoc(doc(manager(), 'proposals/lead'), {
          status: 'won',
          statusAt: STATUS_AT,
          statusBy: 'owner@taalyatra.in',
        }),
      ).rejects.toMatchObject(DENIED);
    });

    it('should keep deleting a lead the owner’s', async () => {
      await expect(deleteDoc(doc(manager(), 'proposals/lead'))).rejects.toMatchObject(DENIED);
    });

    it('should not open the other areas', async () => {
      await expect(getDocs(collection(manager(), 'visits'))).rejects.toMatchObject(DENIED);
    });
  });

  describe('Visits and speed', () => {
    beforeEach(async () => {
      await giveAreas({ visits: true });
    });

    it('should let the manager read visits and speed, and add a finished day up', async () => {
      await expect(getDocs(collection(manager(), 'visits'))).resolves.toBeDefined();
      await expect(getDocs(collection(manager(), 'vitals'))).resolves.toBeDefined();
      await expect(setDoc(doc(manager(), 'visitDays/2026-11-20'), DAY)).resolves.toBeUndefined();
      await expect(deleteDoc(doc(manager(), 'visits/one'))).resolves.toBeUndefined();
      await expect(deleteDoc(doc(manager(), 'vitals/one'))).resolves.toBeUndefined();
    });
  });

  describe('Backups', () => {
    beforeEach(async () => {
      await giveAreas({ backups: true });
    });

    it('should let the manager read and reset the reminder', async () => {
      await expect(getDoc(doc(manager(), 'adminState/backups'))).resolves.toBeDefined();
      await expect(
        setDoc(doc(manager(), 'adminState/backups'), { lastAt: STATUS_AT }),
      ).resolves.toBeUndefined();
    });

    it('should not open the leads', async () => {
      await expect(getDocs(collection(manager(), 'proposals'))).rejects.toMatchObject(DENIED);
    });
  });

  describe('Team access', () => {
    it('should let the owner give a manager every area', async () => {
      await expect(
        setDoc(doc(clients.owner, `roles/${MANAGER_UID}`), managerRole({ areas: ALL_ON })),
      ).resolves.toBeUndefined();
    });

    it.each([
      ['an unknown area', { ...ALL_ON, teamAccess: true }],
      ['a switch that isn’t yes or no', { leads: 'yes' }],
    ])('should refuse %s', async (_case, areas) => {
      await expect(
        setDoc(doc(clients.owner, `roles/${MANAGER_UID}`), managerRole({ areas })),
      ).rejects.toMatchObject(DENIED);
    });

    it('should stop a manager giving themselves an area', async () => {
      await expect(
        setDoc(doc(manager(), `roles/${MANAGER_UID}`), managerRole({ areas: ALL_ON })),
      ).rejects.toMatchObject(DENIED);
    });
  });
});
