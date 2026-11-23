import { Service } from '@angular/core';
import { type Observable, map } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IHideable } from '@shared/interfaces/i-hideable';
import { type IImage } from '@shared/interfaces/i-image';
import { shownOnly } from '@shared/utils/shown-only.util';

/** Reads the photo gallery (uploaded from the admin "Gallery" tab). */
@Service()
export class GalleryService extends ApiBaseService<readonly (IImage & IHideable)[]> {
  /** @returns The photos visitors see: a hidden one (2.15.0) is left out, here for every page. */
  public override attachViewDataHandler(): Observable<readonly (IImage & IHideable)[]> {
    return this.attachViewApiHandler(ApiEndpoint.Gallery).pipe(map(shownOnly));
  }
}
