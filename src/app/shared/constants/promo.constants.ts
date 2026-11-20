/** Which of the design's two diya colourings an icon uses (its colours are in the icon's styles). */
export enum DiyaVariant {
  /** Clay bowl, dark rim: the card promo on the inner pages. */
  Card = 'card',
  /** Gold bowl, amber rim: the pill promo on the home page. */
  Pill = 'pill',
}

/** Size and colouring of the diya icon. */
export interface DiyaPalette {
  readonly size: number;
  readonly variant: DiyaVariant;
}

/** Diya icon in the card promo (inner pages), from the design. */
export const CARD_DIYA: DiyaPalette = { size: 22, variant: DiyaVariant.Card };

/** Diya icon in the pill promo (home page), from the design. */
export const PILL_DIYA: DiyaPalette = { size: 17, variant: DiyaVariant.Pill };

/** Number of sparks drawn by each promo style (must match the SCSS spark lists). */
const CARD_SPARK_COUNT = 6;
const PILL_SPARK_COUNT = 14;

/** @returns Slot numbers 1..count, used to render that many decorative spans. */
function slots(count: number): readonly number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}

/** Slots for the sparks around the card promo; positioned by order in SCSS. */
export const CARD_PROMO_SPARKS = slots(CARD_SPARK_COUNT);

/** Slots for the sparks bursting from the pill promo's icon; positioned by order in SCSS. */
export const PILL_PROMO_SPARKS = slots(PILL_SPARK_COUNT);
