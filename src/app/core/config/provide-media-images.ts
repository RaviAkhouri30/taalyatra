import { IMAGE_LOADER, type ImageLoaderConfig } from '@angular/common';
import { type Provider, inject } from '@angular/core';
import { CLOUDINARY_CONFIG } from '@core/tokens/cloudinary-config.token';
import { mediaImageUrl } from './media-image-url';

/**
 * Sends `NgOptimizedImage` through `mediaImageUrl`. Not `provideCloudinaryLoader`, which rewrites
 * every image and can't put a crop before the resize (D10, ADR-0017).
 *
 * @returns The loader's provider.
 */
export function provideMediaImages(): Provider {
  return {
    provide: IMAGE_LOADER,
    useFactory: () => {
      const { cloudName } = inject(CLOUDINARY_CONFIG);
      return (config: ImageLoaderConfig) => mediaImageUrl(config, cloudName);
    },
  };
}
