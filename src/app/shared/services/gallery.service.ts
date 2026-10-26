import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IImage } from '@shared/interfaces/i-image';

/** Reads the photo gallery (uploaded from the admin "Gallery" tab). */
@Service()
export class GalleryService extends ApiBaseService<readonly IImage[]> {
  public override attachViewDataHandler(): Observable<readonly IImage[]> {
    return this.attachViewApiHandler(ApiEndpoint.Gallery);
  }
}
