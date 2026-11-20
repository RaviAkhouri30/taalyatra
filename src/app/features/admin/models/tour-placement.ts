import { type IPlacement } from '../directives/placed.directive';

/** The space kept around a highlighted area, in pixels. */
export const TOUR_FRAME_PADDING = 6;
/** The gap between the area and the card, and from the screen's edges. */
export const TOUR_GAP = 12;
/** The card's width on screens wide enough to place it beside the area. */
export const TOUR_CARD_WIDTH = 360;

/** The room the card needs above or below the area; with less, it sits at the screen's foot. */
export const TOUR_CARD_ROOM = 240;

/** Padding and gaps apply on both sides. */
const BOTH_SIDES = 2;

/** A box on the screen, as `getBoundingClientRect` gives it. */
export interface IBox {
  readonly top: number;
  readonly left: number;
  readonly width: number;
  readonly height: number;
}

/** The screen's size. */
export interface IScreen {
  readonly width: number;
  readonly height: number;
}

const NOWHERE: IPlacement = { top: null, left: null, width: null, height: null, bottom: null };

/**
 * @param box The highlighted area.
 * @returns The frame around it, a little larger.
 */
export function framePlacement(box: IBox): IPlacement {
  return {
    ...NOWHERE,
    top: box.top - TOUR_FRAME_PADDING,
    left: box.left - TOUR_FRAME_PADDING,
    width: box.width + BOTH_SIDES * TOUR_FRAME_PADDING,
    height: box.height + BOTH_SIDES * TOUR_FRAME_PADDING,
  };
}

/**
 * @param box The highlighted area, or `null` for a step with none.
 * @param screen The screen's size.
 * @returns Where the card goes: under the area when there's room, else above it, else at the
 *   screen's foot (an area taller than the screen). Without an area, or on a narrow screen, the
 *   stylesheet places it.
 */
export function cardPlacement(box: IBox | null, screen: IScreen): IPlacement {
  if (box === null || screen.width < TOUR_CARD_WIDTH + BOTH_SIDES * TOUR_GAP) {
    return NOWHERE;
  }
  const left = Math.min(Math.max(box.left, TOUR_GAP), screen.width - TOUR_CARD_WIDTH - TOUR_GAP);
  const bottomEdge = box.top + box.height;
  if (screen.height - bottomEdge >= TOUR_CARD_ROOM) {
    return { ...NOWHERE, left, top: bottomEdge + TOUR_GAP };
  }
  if (box.top >= TOUR_CARD_ROOM) {
    return { ...NOWHERE, left, bottom: screen.height - box.top + TOUR_GAP };
  }
  return { ...NOWHERE, left, bottom: TOUR_GAP };
}
