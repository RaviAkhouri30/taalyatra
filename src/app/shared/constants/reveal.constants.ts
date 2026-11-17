/** How a home section appears the first time it scrolls into view (0013). */
export const REVEAL_DURATION_MS = 1000;

/** How far below its place a section starts, in pixels. */
export const REVEAL_RISE_PX = 40;

/** A soft ease-out (ease-out cubic): no sudden start, a long, slow settle. */
export const REVEAL_EASING = 'cubic-bezier(0.33, 1, 0.68, 1)';

/** The section reveals once its top is a tenth of the screen above the bottom edge. */
export const REVEAL_ROOT_MARGIN = '0px 0px -10% 0px';

/** The media query for visitors who ask for less motion. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/** How long a linked section is kept in place while the sections above it arrive. */
export const SECTION_HOLD_MS = 3000;

/** What the visitor does that means "I'm scrolling now": the page stops holding the section. */
export const SCROLL_TAKE_OVER_EVENTS: readonly string[] = [
  'wheel',
  'touchstart',
  'keydown',
  'mousedown',
];
