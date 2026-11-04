import { youtubeThumbnail } from './youtube-link';

describe('youtubeThumbnail', () => {
  const thumbnail = {
    src: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    width: 480,
    height: 360,
  };

  it.each([
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com/watch?list=abc&v=dQw4w9WgXcQ',
    'https://m.youtube.com/watch?v=dQw4w9WgXcQ',
    'https://youtu.be/dQw4w9WgXcQ?si=abc',
    'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    'https://www.youtube.com/embed/dQw4w9WgXcQ',
    'https://www.youtube.com/live/dQw4w9WgXcQ',
    '  https://youtu.be/dQw4w9WgXcQ  ',
  ])('should find the thumbnail for %s', (link) => {
    expect(youtubeThumbnail(link)).toEqual(thumbnail);
  });

  it.each([
    '',
    'not a link',
    'https://www.youtube.com/@YOUR-CHANNEL',
    'https://www.youtube.com/watch',
    'https://www.youtube.com/watch?v=short',
    'https://vimeo.com/watch?v=dQw4w9WgXcQ',
    'https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ',
  ])('should find none for "%s"', (link) => {
    expect(youtubeThumbnail(link)).toBeNull();
  });
});
