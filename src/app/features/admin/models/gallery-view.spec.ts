import { GALLERY_VIEW } from './gallery-view';

const PHOTO = { src: 'v1/taal-yatra/media/a', alt: 'Drums', width: 800, height: 600 };

describe('GALLERY_VIEW (2.15.0)', () => {
  it('should show each stored photo as its picture and a Hidden switch', () => {
    expect(GALLERY_VIEW.read({ _items: [PHOTO, { ...PHOTO, hidden: true }] })).toEqual({
      _items: [
        { photo: PHOTO, hidden: false },
        { photo: PHOTO, hidden: true },
      ],
    });
  });

  it('should store the picture itself, hidden only when it is', () => {
    const written = GALLERY_VIEW.write(
      { _items: [], other: 1 },
      {
        _items: [
          { photo: PHOTO, hidden: false },
          { photo: PHOTO, hidden: true },
        ],
      },
    );

    expect(written).toEqual({ other: 1, _items: [PHOTO, { ...PHOTO, hidden: true }] });
  });

  it('should treat a missing list as empty', () => {
    expect(GALLERY_VIEW.read({})).toEqual({ _items: [] });
  });
});
