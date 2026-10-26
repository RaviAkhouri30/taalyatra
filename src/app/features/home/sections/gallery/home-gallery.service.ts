import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IHomeGalleryDto } from './i-home-gallery';

/** Reads the gallery heading and copy. */
@Service()
export class HomeGalleryService extends ApiBaseService<IHomeGalleryDto> {
  public override attachViewDataHandler(): Observable<IHomeGalleryDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeGallery);
  }
}
