import { parseImageSrc } from './image-src';

describe('parseImageSrc', () => {
  it('should read an uploaded image with no crop', () => {
    expect(parseImageSrc('v123/taal-yatra/media/abc')).toEqual({
      source: 'v123/taal-yatra/media/abc',
      id: 'abc',
      crop: null,
    });
  });

  it('should read an uploaded image with a crop', () => {
    expect(parseImageSrc('c_crop,x_1,y_2,w_30,h_40/v123/taal-yatra/media/abc')).toEqual({
      source: 'v123/taal-yatra/media/abc',
      id: 'abc',
      crop: { x: 1, y: 2, width: 30, height: 40 },
    });
  });

  it.each([
    '/images/team/member-1.webp',
    'https://i.ytimg.com/vi/abc/hqdefault.jpg',
    'data:image/gif;base64,R0lGOD',
    'taal-yatra/media/abc',
    '',
  ])('should not treat %s as uploaded', (src) => {
    expect(parseImageSrc(src)).toBeNull();
  });
});
