import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IAdminPageDto } from '../models/i-admin-page';

/** Reads the admin area copy (`pages/admin`). */
@Service()
export class AdminPageService extends ApiBaseService<IAdminPageDto> {
  public override attachViewDataHandler(): Observable<IAdminPageDto> {
    return this.attachViewApiHandler(ApiEndpoint.PagesAdmin);
  }
}
