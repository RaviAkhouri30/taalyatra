import { CROP_MAX_ZOOM, CropFrame } from './crop-frame.model';

describe('CropFrame', () => {
  it('should start as the largest centred frame when the image is wider than the slot', () => {
    expect(CropFrame.create(2400, 1200, 1).rect).toEqual({
      x: 600,
      y: 0,
      width: 1200,
      height: 1200,
    });
  });

  it('should start as the largest centred frame when the image is taller than the slot', () => {
    expect(CropFrame.create(1200, 2400, 4 / 3).rect).toEqual({
      x: 0,
      y: 750,
      width: 1200,
      height: 900,
    });
  });

  it('should start from an earlier crop when it still fits the file', () => {
    const saved = { x: 10, y: 20, width: 300, height: 300 };

    expect(CropFrame.create(1000, 1000, 1, saved).rect).toEqual(saved);
  });

  it.each([
    ['too wide', { x: 900, y: 0, width: 300, height: 300 }],
    ['too tall', { x: 0, y: 900, width: 300, height: 300 }],
    ['empty', { x: 0, y: 0, width: 0, height: 0 }],
  ])('should start centred when an earlier crop is %s for the file', (_case, saved) => {
    expect(CropFrame.create(1000, 1000, 1, saved).rect).toEqual({
      x: 0,
      y: 0,
      width: 1000,
      height: 1000,
    });
  });

  it('should move by the given amount when there is room', () => {
    const moved = CropFrame.create(1000, 1000, 1).zoomTo(2).moveBy(100, -50);

    expect(moved.rect).toEqual({ x: 350, y: 200, width: 500, height: 500 });
  });

  it.each([
    ['left and up', { dx: -9999, dy: -9999 }, { x: 0, y: 0 }],
    ['right and down', { dx: 9999, dy: 9999 }, { x: 500, y: 500 }],
  ])('should stop at the edges when moved too far %s', (_case, { dx, dy }, edge) => {
    const moved = CropFrame.create(1000, 1000, 1).zoomTo(2).moveBy(dx, dy);

    expect(moved.rect).toMatchObject(edge);
  });

  it('should keep the centre when zooming in', () => {
    expect(CropFrame.create(1000, 1000, 1).zoomTo(2).rect).toEqual({
      x: 250,
      y: 250,
      width: 500,
      height: 500,
    });
  });

  it('should keep the slot shape at every zoom', () => {
    const { width, height } = CropFrame.create(2400, 1600, 16 / 9).zoomTo(3).rect;

    expect(width / height).toBeCloseTo(16 / 9, 1);
  });

  it.each([
    ['below the minimum', 0.5, 1],
    ['above the maximum', 99, CROP_MAX_ZOOM],
  ])('should limit a zoom %s', (_case, requested, zoom) => {
    expect(CropFrame.create(1000, 1000, 1).zoomTo(requested).zoom).toBeCloseTo(zoom);
  });

  it('should stay inside the image when zooming out near an edge', () => {
    const frame = CropFrame.create(1000, 1000, 1).zoomTo(5).moveBy(9999, 9999).zoomTo(1);

    expect(frame.rect).toEqual({ x: 0, y: 0, width: 1000, height: 1000 });
  });

  it('should describe itself as a Cloudinary crop step', () => {
    const frame = CropFrame.create(1000, 1000, 1, { x: 1, y: 2, width: 30, height: 30 });

    expect(frame.transformation).toBe('c_crop,x_1,y_2,w_30,h_30');
  });

  it('should give its position as percentages of the image', () => {
    const frame = CropFrame.create(1000, 500, 1, { x: 100, y: 50, width: 250, height: 250 });

    expect(frame.position).toEqual({ left: 10, top: 10, width: 25, height: 50 });
  });
});
