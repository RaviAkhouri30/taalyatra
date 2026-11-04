const YOUTUBE_HOSTS: ReadonlySet<string> = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'youtu.be',
]);

/** A video id's form; anything else isn't a video link, e.g. a channel page. */
const VIDEO_ID = /^[\w-]{11}$/u;

/** Paths where the id is the segment after this first one. */
const ID_AFTER: ReadonlySet<string> = new Set(['shorts', 'embed', 'live']);

/** YouTube's letterboxed size; the slot's 16:9 crop cuts off the black bars. */
const THUMBNAIL_WIDTH = 480;
const THUMBNAIL_HEIGHT = 360;

function videoId(url: URL): string {
  const [first = '', second = ''] = url.pathname.split('/').filter(Boolean);
  if (url.hostname === 'youtu.be') {
    return first;
  }
  return ID_AFTER.has(first) ? second : (url.searchParams.get('v') ?? '');
}

function parse(link: string): URL | null {
  try {
    return new URL(link.trim());
  } catch {
    return null;
  }
}

/**
 * Works out a video's thumbnail with no API key (D20).
 *
 * @param link What's in the video's link field.
 * @returns The thumbnail's address and size, or `null` when it isn't a YouTube video link.
 */
export function youtubeThumbnail(
  link: string,
): { readonly src: string; readonly width: number; readonly height: number } | null {
  const url = parse(link);
  if (url === null || !YOUTUBE_HOSTS.has(url.hostname)) {
    return null;
  }
  const id = videoId(url);
  return VIDEO_ID.test(id)
    ? {
        src: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        width: THUMBNAIL_WIDTH,
        height: THUMBNAIL_HEIGHT,
      }
    : null;
}
