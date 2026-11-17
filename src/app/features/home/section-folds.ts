import { FOLD_DEFAULTS } from '@shared/constants/fold.constants';
import { FoldMode } from '@shared/enums/fold-mode.enum';
import { HomeSection } from '@shared/enums/home-section.enum';
import { type SiteVisibility } from '@shared/models/site-visibility.model';

/** How each home section folds. */
export type SectionFolds = Readonly<Record<HomeSection, FoldMode>>;

const FOLD_MODES: ReadonlySet<unknown> = new Set(Object.values(FoldMode));

function foldOf(section: HomeSection, visibility: SiteVisibility): FoldMode {
  const fallback = FOLD_DEFAULTS.get(section);
  if (fallback === undefined) {
    return FoldMode.Never;
  }
  const chosen = visibility.foldSetting(section);
  return FOLD_MODES.has(chosen) ? (chosen as FoldMode) : fallback;
}

/**
 * @param visibility The owner's switches.
 * @returns Each section's folding: the owner's choice for a foldable section when it's a known
 *   mode, else its default; sections that can't fold never do.
 */
export function sectionFolds(visibility: SiteVisibility): SectionFolds {
  return Object.fromEntries(
    Object.values(HomeSection).map((section) => [section, foldOf(section, visibility)]),
  ) as Record<HomeSection, FoldMode>;
}
