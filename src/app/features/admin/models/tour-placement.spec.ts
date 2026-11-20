import {
  TOUR_CARD_WIDTH,
  TOUR_FRAME_PADDING,
  TOUR_GAP,
  cardPlacement,
  framePlacement,
} from './tour-placement';

describe('tour placement', () => {
  const screen = { width: 1200, height: 800 };
  const box = (top: number, height: number, left = 100) => ({ top, left, width: 200, height });

  it('should frame an area with a little room around it', () => {
    expect(framePlacement(box(100, 50))).toEqual({
      top: 100 - TOUR_FRAME_PADDING,
      left: 100 - TOUR_FRAME_PADDING,
      width: 200 + 2 * TOUR_FRAME_PADDING,
      height: 50 + 2 * TOUR_FRAME_PADDING,
      bottom: null,
    });
  });

  it('should put the card under an area with room below it', () => {
    expect(cardPlacement(box(100, 50), screen)).toMatchObject({ top: 150 + TOUR_GAP, left: 100 });
  });

  it('should put the card above an area near the bottom', () => {
    expect(cardPlacement(box(650, 100), screen)).toMatchObject({
      bottom: 800 - 650 + TOUR_GAP,
      top: null,
    });
  });

  it('should put the card at the foot of the screen for an area taller than it', () => {
    expect(cardPlacement(box(50, 2000), screen)).toMatchObject({ bottom: TOUR_GAP, top: null });
  });

  it('should keep the card on screen sideways', () => {
    expect(cardPlacement(box(100, 50, 1100), screen).left).toBe(1200 - TOUR_CARD_WIDTH - TOUR_GAP);
    expect(cardPlacement(box(100, 50, -40), screen).left).toBe(TOUR_GAP);
  });

  it('should leave the card to the stylesheet without an area, or on a narrow screen', () => {
    expect(cardPlacement(null, screen).top).toBeNull();
    expect(cardPlacement(box(100, 50), { width: 360, height: 700 }).left).toBeNull();
  });
});
