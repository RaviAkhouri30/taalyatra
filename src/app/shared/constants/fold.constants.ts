// Relative, not `@shared/…`: the rules tests import this file, and their runner has no path aliases.
import { FoldMode } from '../enums/fold-mode.enum';
import { HomeSection } from '../enums/home-section.enum';

/**
 * The sections that can fold, and how they start when the owner hasn't chosen (0015 V15). The
 * less important ones fold on phones, where the page is longest; the two longest reads fold
 * everywhere. Every other section never folds.
 */
export const FOLD_DEFAULTS: ReadonlyMap<HomeSection, FoldMode> = new Map([
  [HomeSection.Philosophy, FoldMode.Always],
  [HomeSection.Cities, FoldMode.Phone],
  [HomeSection.How, FoldMode.Phone],
  [HomeSection.Instagram, FoldMode.Phone],
  [HomeSection.Proof, FoldMode.Phone],
  [HomeSection.Faq, FoldMode.Always],
]);

/** The fold button's words. */
export const FOLD_LABELS = { more: 'Show more', less: 'Show less' } as const;

/** Mirrors `$phone` in `_breakpoints.scss`, so "on phones" means what it does in the layout. */
export const PHONE_MEDIA_QUERY = '(max-width: 620px)';
