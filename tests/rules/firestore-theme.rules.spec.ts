import { type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, setDoc } from 'firebase/firestore';
import { THEME_PRESETS } from '../../src/app/shared/constants/theme-presets.constants';
import { ThemeBackdrop } from '../../src/app/shared/enums/theme-backdrop.enum';
import { ThemeFonts } from '../../src/app/shared/enums/theme-fonts.enum';
import { ThemeHeadingWeight } from '../../src/app/shared/enums/theme-heading-weight.enum';
import { ThemePreset } from '../../src/app/shared/enums/theme-preset.enum';
import { ThemeTextSize } from '../../src/app/shared/enums/theme-text-size.enum';
import {
  DENIED,
  type IClients,
  MANAGER_UID,
  managerDraft,
  managerRole,
  rulesEnvironment,
  seedManagers,
} from './testing/manager.fixture';

const DAYLIGHT = THEME_PRESETS.find((preset) => preset.preset === ThemePreset.Daylight)!;

/** A complete theme, as the Theme page publishes it. */
const fullTheme = {
  preset: ThemePreset.Daylight,
  ...DAYLIGHT.colours,
  backdrop: ThemeBackdrop.Gradient,
  textSize: ThemeTextSize.Larger,
  headingWeight: ThemeHeadingWeight.Bold,
  fonts: ThemeFonts.FrauncesInter,
};

/** `site/theme`: the site's look (0021, ADR-0019). */
describe('firestore.rules · site theme', () => {
  let env: RulesTestEnvironment;
  let clients: IClients;

  beforeAll(async () => {
    env = await rulesEnvironment();
  });

  beforeEach(async () => {
    clients = await seedManagers(env);
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'site/theme'), {});
    });
  });

  afterAll(async () => {
    await env.cleanup();
  });

  it('should let the owner publish a complete theme', async () => {
    await expect(setDoc(doc(clients.owner, 'site/theme'), fullTheme)).resolves.toBeUndefined();
  });

  it('should let the owner publish an empty theme, which is today’s look', async () => {
    await expect(setDoc(doc(clients.owner, 'site/theme'), {})).resolves.toBeUndefined();
  });

  it.each([
    ['preset', Object.values(ThemePreset)],
    ['backdrop', Object.values(ThemeBackdrop)],
    ['textSize', Object.values(ThemeTextSize)],
    ['headingWeight', Object.values(ThemeHeadingWeight)],
    ['fonts', Object.values(ThemeFonts)],
  ])('should accept every value of %s the app offers', async (field, values) => {
    for (const value of values) {
      await expect(
        setDoc(doc(clients.owner, 'site/theme'), { [field]: value }),
      ).resolves.toBeUndefined();
    }
  });

  it.each([
    ['an unknown field', { logo: 'big' }],
    ['a colour in capitals', { accent: '#FFB21E' }],
    ['a short colour', { accent: '#fb1' }],
    ['a colour name', { text: 'white' }],
    ['a colour that isn’t text', { cards: 255 }],
    ['an unknown font pair', { fonts: 'comic-sans' }],
    ['an unknown text size', { textSize: 'huge' }],
  ])('should reject %s', async (_case, data) => {
    await expect(setDoc(doc(clients.owner, 'site/theme'), data)).rejects.toMatchObject(DENIED);
  });

  it('should stop a visitor changing it', async () => {
    const visitor = env.unauthenticatedContext().firestore();

    await expect(setDoc(doc(visitor, 'site/theme'), fullTheme)).rejects.toMatchObject(DENIED);
  });

  it('should stop a manager publishing it when the Theme page needs approval', async () => {
    await expect(setDoc(doc(clients.manager, 'site/theme'), fullTheme)).rejects.toMatchObject(
      DENIED,
    );
  });

  it('should let a manager publish it when the Theme page is set to "Can publish"', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), `roles/${MANAGER_UID}`),
        managerRole({ pages: { theme: 'publish' } }),
      );
    });

    await expect(setDoc(doc(clients.manager, 'site/theme'), fullTheme)).resolves.toBeUndefined();
  });

  it('should let a manager save a draft of it when the Theme page needs approval', async () => {
    await expect(
      setDoc(doc(clients.manager, 'drafts/site__theme'), managerDraft('site/theme')),
    ).resolves.toBeUndefined();
  });

  it('should stop a manager saving a draft of it when the Theme page is hidden', async () => {
    await env.withSecurityRulesDisabled(async (context) => {
      await setDoc(
        doc(context.firestore(), `roles/${MANAGER_UID}`),
        managerRole({ pages: { theme: 'hidden' } }),
      );
    });

    await expect(
      setDoc(doc(clients.manager, 'drafts/site__theme'), managerDraft('site/theme')),
    ).rejects.toMatchObject(DENIED);
  });

  it('should let the owner give a manager the Theme page on Team access', async () => {
    await expect(
      setDoc(
        doc(clients.owner, `roles/${MANAGER_UID}`),
        managerRole({ pages: { theme: 'publish' } }),
      ),
    ).resolves.toBeUndefined();
  });
});
