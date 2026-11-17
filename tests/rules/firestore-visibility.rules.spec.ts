import { readFileSync } from 'node:fs';
import { type RulesTestEnvironment, initializeTestEnvironment } from '@firebase/rules-unit-testing';
import { type Firestore, doc, setDoc } from 'firebase/firestore';
import { FOLD_DEFAULTS } from '../../src/app/shared/constants/fold.constants';
import { FoldMode } from '../../src/app/shared/enums/fold-mode.enum';
import { HomeSection } from '../../src/app/shared/enums/home-section.enum';
import { SitePage } from '../../src/app/shared/enums/site-page.enum';
import { SiteWidget } from '../../src/app/shared/enums/site-widget.enum';

const DENIED = { code: 'permission-denied' };

/** The production admin UID; `firestore.rules` checks it and the emulator build uses it too. */
const ADMIN_UID = '5zsz2DlUaja2Ss7wbFTrpiMMROk2';

/** Every switch from the enums, so the rules' key lists can't fall behind them. */
const fullVisibility = (value: boolean) => ({
  sections: Object.fromEntries(Object.values(HomeSection).map((key) => [key, value])),
  pages: Object.fromEntries(Object.values(SitePage).map((key) => [key, value])),
  widgets: Object.fromEntries(Object.values(SiteWidget).map((key) => [key, value])),
});

/** `site/visibility`: the owner's switches and folding choices (ADR-0015, 0015). */
describe('firestore.rules · site visibility', () => {
  let env: RulesTestEnvironment;
  let admin: Firestore;
  let visitor: Firestore;

  beforeAll(async () => {
    env = await initializeTestEnvironment({
      projectId: 'demo-taal-yatra',
      firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    });
  });

  beforeEach(async () => {
    await env.clearFirestore();
    admin = env.authenticatedContext(ADMIN_UID).firestore() as unknown as Firestore;
    visitor = env.unauthenticatedContext().firestore() as unknown as Firestore;
  });

  afterAll(async () => {
    await env.cleanup();
  });

  it('should let the admin switch every section, page and widget off', async () => {
    await expect(
      setDoc(doc(admin, 'site/visibility'), fullVisibility(false)),
    ).resolves.toBeUndefined();
  });

  it('should reject an unknown section key', async () => {
    const visibility = { ...fullVisibility(true), sections: { hero: false } };

    await expect(setDoc(doc(admin, 'site/visibility'), visibility)).rejects.toMatchObject(DENIED);
  });

  it('should stop a visitor changing it', async () => {
    await expect(
      setDoc(doc(visitor, 'site/visibility'), fullVisibility(false)),
    ).rejects.toMatchObject(DENIED);
  });

  it('should let the admin choose every mode for every foldable section', async () => {
    const modes = Object.values(FoldMode);
    const folded = Object.fromEntries(
      [...FOLD_DEFAULTS.keys()].map((section, index) => [section, modes[index % modes.length]]),
    );

    await expect(
      setDoc(doc(admin, 'site/visibility'), { ...fullVisibility(true), folded }),
    ).resolves.toBeUndefined();
  });

  it.each([
    ['a section that can’t fold', { hero: 'always' }],
    ['an unknown mode', { faq: 'sometimes' }],
  ])('should reject folding with %s', async (_case, folded) => {
    await expect(
      setDoc(doc(admin, 'site/visibility'), { ...fullVisibility(true), folded }),
    ).rejects.toMatchObject(DENIED);
  });
});
