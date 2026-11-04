import { inject } from '@angular/core';
import { CloudinaryMediaService } from '@core/backends/cloudinary/cloudinary-media.service';
import { FakeMediaService } from '@core/backends/fake/fake-media.service';
import { BackendType } from '@core/enums/backend-type.enum';
import { type IMediaService } from '@core/interfaces/i-media-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { CLOUDINARY_CONFIG } from '@core/tokens/cloudinary-config.token';

/**
 * Picks the media adapter: Cloudinary for a Firebase build with a cloud name, otherwise the fake
 * one (development and e2e). The emulator build's cloud name isn't a real one.
 *
 * @returns The active media adapter.
 */
export function mediaServiceFactory(): IMediaService {
  const isLive =
    inject(APP_ENVIRONMENT).backend === BackendType.Firebase &&
    inject(CLOUDINARY_CONFIG).cloudName !== '';
  return isLive ? new CloudinaryMediaService() : new FakeMediaService();
}
