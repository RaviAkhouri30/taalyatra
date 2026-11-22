import { type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { THEME_PRESETS } from '../../src/app/shared/constants/theme-presets.constants';
import { ThemeBackdrop } from '../../src/app/shared/enums/theme-backdrop.enum';
import { ThemeFonts } from '../../src/app/shared/enums/theme-fonts.enum';
import { ThemeHeadingWeight } from '../../src/app/shared/enums/theme-heading-weight.enum';
import { ThemeTextSize } from '../../src/app/shared/enums/theme-text-size.enum';
import {
  DENIED,
  type Fields,
  type IClients,
  MANAGER_UID,
  SAVED_AT,
  managerRole,
  rulesEnvironment,
  seedManagers,
} from './testing/manager.fixture';

const ID = '0f8fad5b-d9cb-469f-a165-70867728950e';
const PATH = `savedThemes/${ID}`;
const MONSOON = THEME_PRESETS.find((preset) => preset.label === 'Monsoon')!;

/** A saved theme as the Theme page stores it. */
function savedTheme(change: Fields = {}): Fields {
  return {
    name: 'Spring show',
    savedAt: SAVED_AT,
    theme: {
      ...MONSOON.colours,
      backdrop: ThemeBackdrop.Gradient,
      textSize: ThemeTextSize.Standard,
      headingWeight: ThemeHeadingWeight.Bold,
      fonts: ThemeFonts.SpaceWork,
    },
    ...change,
  };
}

/** `savedThemes/{id}`: themes saved from the Theme page (0027). */
describe('firestore.rules · saved themes', () => {
  let env: RulesTestEnvironment;
  let clients: IClients;

  /** Changes the manager's role, as Team access would. */
  async function setRole(change: Fields): Promise<void> {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), `roles/${MANAGER_UID}`), managerRole(change));
    });
  }

  async function seedTheme(): Promise<void> {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), PATH), savedTheme());
    });
  }

  beforeAll(async () => {
    env = await rulesEnvironment();
  });

  beforeEach(async () => {
    clients = await seedManagers(env);
  });

  afterAll(async () => {
    await env.cleanup();
  });

  it('should let the owner save, read, rename and delete a theme', async () => {
    await expect(setDoc(doc(clients.owner, PATH), savedTheme())).resolves.toBeUndefined();
    await expect(getDoc(doc(clients.owner, PATH))).resolves.toBeDefined();
    await expect(
      setDoc(doc(clients.owner, PATH), savedTheme({ name: 'Summer show' })),
    ).resolves.toBeUndefined();
    await expect(deleteDoc(doc(clients.owner, PATH))).resolves.toBeUndefined();
  });

  it('should let a manager use them when the Theme page needs approval, the default', async () => {
    await expect(setDoc(doc(clients.manager, PATH), savedTheme())).resolves.toBeUndefined();
    await expect(getDoc(doc(clients.manager, PATH))).resolves.toBeDefined();
    await expect(deleteDoc(doc(clients.manager, PATH))).resolves.toBeUndefined();
  });

  it('should refuse a manager whose Theme page is hidden', async () => {
    await seedTheme();
    await setRole({ pages: { theme: 'hidden' } });

    await expect(getDoc(doc(clients.manager, PATH))).rejects.toMatchObject(DENIED);
    await expect(setDoc(doc(clients.manager, PATH), savedTheme())).rejects.toMatchObject(DENIED);
    await expect(deleteDoc(doc(clients.manager, PATH))).rejects.toMatchObject(DENIED);
  });

  it('should let a manager given Backups read and restore them, but not delete one', async () => {
    await seedTheme();
    await setRole({ pages: { theme: 'hidden' }, areas: { backups: true } });

    await expect(getDoc(doc(clients.manager, PATH))).resolves.toBeDefined();
    await expect(setDoc(doc(clients.manager, PATH), savedTheme())).resolves.toBeUndefined();
    await expect(deleteDoc(doc(clients.manager, PATH))).rejects.toMatchObject(DENIED);
  });

  it('should refuse someone never added on Team access', async () => {
    await seedTheme();

    await expect(getDoc(doc(clients.member, PATH))).rejects.toMatchObject(DENIED);
    await expect(setDoc(doc(clients.member, PATH), savedTheme())).rejects.toMatchObject(DENIED);
  });

  it.each([
    ['an id that isn’t a UUID', 'savedThemes/spring', savedTheme()],
    ['an unknown field', PATH, savedTheme({ by: 'me' })],
    ['no name', PATH, savedTheme({ name: '' })],
    ['a 41-character name', PATH, savedTheme({ name: 'x'.repeat(41) })],
    ['no time', PATH, { name: 'Spring show', theme: savedTheme()['theme'] }],
    ['a theme that isn’t a map', PATH, savedTheme({ theme: 'monsoon' })],
    ['a bad colour in the theme', PATH, savedTheme({ theme: { accent: '#FFF' } })],
    ['an unknown field in the theme', PATH, savedTheme({ theme: { logo: 'big' } })],
  ])('should refuse a theme with %s', async (_case, path, fields) => {
    await expect(setDoc(doc(clients.owner, path), fields)).rejects.toMatchObject(DENIED);
  });
});
