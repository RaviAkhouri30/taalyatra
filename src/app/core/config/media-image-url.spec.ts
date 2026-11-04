import { MEDIA_PLACEHOLDER_SRC, mediaImageUrl } from './media-image-url';

describe('mediaImageUrl', () => {
  const upload = 'https://res.cloudinary.com/demo/image/upload';

  it.each([
    '/images/team/member-1.webp',
    '/images/shows/classical-tabla.svg',
    'https://i.ytimg.com/vi/abc/hqdefault.jpg',
    'data:image/gif;base64,R0lGOD',
  ])('should leave %s alone when it is already complete', (src) => {
    expect(mediaImageUrl({ src, width: 640 }, 'demo')).toBe(src);
  });

  it('should resize an uploaded image and keep its version when it has no crop', () => {
    expect(mediaImageUrl({ src: 'v123/taal-yatra/media/abc', width: 640 }, 'demo')).toBe(
      `${upload}/f_auto,q_auto,w_640/v123/taal-yatra/media/abc`,
    );
  });

  it('should crop before resizing when the image has a crop', () => {
    const src = 'c_crop,x_10,y_20,w_300,h_400/v123/taal-yatra/media/abc';

    expect(mediaImageUrl({ src, width: 640 }, 'demo')).toBe(
      `${upload}/c_crop,x_10,y_20,w_300,h_400/f_auto,q_auto,w_640/v123/taal-yatra/media/abc`,
    );
  });

  it('should leave the width out when none is asked for', () => {
    expect(mediaImageUrl({ src: 'v1/taal-yatra/media/abc' }, 'demo')).toBe(
      `${upload}/f_auto,q_auto/v1/taal-yatra/media/abc`,
    );
  });

  it('should use the placeholder for an uploaded image when no cloud is configured', () => {
    expect(mediaImageUrl({ src: 'v1/taal-yatra/media/abc', width: 640 }, '')).toBe(
      MEDIA_PLACEHOLDER_SRC,
    );
  });

  it('should still serve a local image when no cloud is configured', () => {
    expect(mediaImageUrl({ src: '/images/a.webp', width: 640 }, '')).toBe('/images/a.webp');
  });
});
