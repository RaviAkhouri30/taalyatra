import { type ImageLoaderConfig } from '@angular/common';

const CLOUDINARY_IMAGE_URL = 'https://res.cloudinary.com';

/** Local paths and full URLs are complete already. */
const COMPLETE_SRC = /^(?:\/|[a-z]+:)/iu;

/** The crop step, stored at the start of `src` (D14). */
const CROP_STEP = /^c_crop,[^/]+\//u;

/** Shown for uploaded images when no cloud is configured (development and e2e). */
export const MEDIA_PLACEHOLDER_SRC = '/images/og/taal-yatra.jpg';

/**
 * Builds a stored image's address (D10). The site still has local images, so only an uploaded one,
 * stored as `[crop/][v123/]<id>`, is sent to Cloudinary. The crop runs before the resize, because
 * its numbers refer to the stored file.
 *
 * @param config What `NgOptimizedImage` asks for.
 * @param cloudName Cloudinary's cloud name; empty when there's none.
 * @returns The address to load.
 */
export function mediaImageUrl(config: ImageLoaderConfig, cloudName: string): string {
  const { src, width } = config;
  if (COMPLETE_SRC.test(src)) {
    return src;
  }
  if (cloudName === '') {
    return MEDIA_PLACEHOLDER_SRC;
  }
  const crop = CROP_STEP.exec(src)?.[0] ?? '';
  const resize = width === undefined ? 'f_auto,q_auto' : `f_auto,q_auto,w_${String(width)}`;
  return `${CLOUDINARY_IMAGE_URL}/${cloudName}/image/upload/${crop}${resize}/${src.slice(crop.length)}`;
}
