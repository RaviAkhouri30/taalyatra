import { type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
import { Festival } from '../../src/app/shared/enums/festival.enum';
import {
  DENIED,
  type Fields,
  type IClients,
  MANAGER_UID,
  managerRole,
  rulesEnvironment,
  seedManagers,
  siteConfig,
} from './testing/manager.fixture';

const promotion = siteConfig['promotion'] as Fields;

/** @returns The site details with the offer's festival set to `festival`. */
function withFestival(festival: unknown): Fields {
  return { ...siteConfig, promotion: { ...promotion, festival } };
}

/** The festival looks (2.16.0): the offer's festival is one of the eleven names. */
describe('firestore.rules · the offer’s festival of 2.16.0', () => {
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

  it.each(Object.values(Festival))('should accept %s', async (festival) => {
    await expect(
      setDoc(doc(clients.owner, 'site/config'), withFestival(festival)),
    ).resolves.toBeUndefined();
  });

  it.each([
    ['an unknown name', 'fireworks'],
    ['a name in capitals', 'HOLI'],
    ['a number', 3],
  ])('should refuse %s', async (_case, festival) => {
    await expect(
      setDoc(doc(clients.owner, 'site/config'), withFestival(festival)),
    ).rejects.toMatchObject(DENIED);
  });

  it('should let a manager who can publish the Offer page change it', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), `roles/${MANAGER_UID}`),
        managerRole({ pages: { offer: 'publish' } }),
      );
    });

    await expect(
      setDoc(doc(clients.manager, 'site/config'), withFestival(Festival.Christmas)),
    ).resolves.toBeUndefined();
  });

  it('should refuse a manager whose Offer page needs approval', async () => {
    await expect(
      setDoc(doc(clients.manager, 'site/config'), withFestival(Festival.Christmas)),
    ).rejects.toMatchObject(DENIED);
  });
});
