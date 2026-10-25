/** Colours and size of the diya icon. */
export interface DiyaPalette {
  readonly size: number;
  readonly flame: string;
  readonly core: string;
  readonly bowl: string;
  readonly rim: string;
}

/** Diya icon in the card promo (inner pages), from the design. */
export const CARD_DIYA: DiyaPalette = {
  size: 22,
  flame: '#FFD79A',
  core: '#C96B3C',
  bowl: '#C96B3C',
  rim: '#8A4A28',
};

/** Diya icon in the pill promo (home page), from the design. */
export const PILL_DIYA: DiyaPalette = {
  size: 17,
  flame: '#FFD79A',
  core: '#C96B3C',
  bowl: '#FFD79A',
  rim: '#E9A552',
};

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
