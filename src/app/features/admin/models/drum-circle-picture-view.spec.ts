import { DRUM_CIRCLE_PICTURE_VIEW } from './drum-circle-picture-view';

describe('DRUM_CIRCLE_PICTURE_VIEW', () => {
  const first = { src: '/images/a.webp', alt: 'A', width: 1200, height: 800 };
  const second = { src: '/images/b.webp', alt: 'B', width: 800, height: 533 };

  it('should show the first stored picture', () => {
    expect(DRUM_CIRCLE_PICTURE_VIEW.read({ gallery: [first, second] })).toEqual({ picture: first });
  });

  it('should show no picture when the gallery is empty or missing', () => {
    expect(DRUM_CIRCLE_PICTURE_VIEW.read({ gallery: [] })).toEqual({});
    expect(DRUM_CIRCLE_PICTURE_VIEW.read({})).toEqual({});
  });

  it('should store the picture as the whole gallery, keeping the other fields', () => {
    const stored = { title: 'Drum Circle', gallery: [first, second] };

    expect(DRUM_CIRCLE_PICTURE_VIEW.write(stored, { picture: second })).toEqual({
      title: 'Drum Circle',
      gallery: [second],
    });
  });
});
