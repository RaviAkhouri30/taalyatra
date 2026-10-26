import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IContactDto } from './i-contact';

/** Reads the contact section's copy. */
@Service()
export class HomeContactService extends ApiBaseService<IContactDto> {
  public override attachViewDataHandler(): Observable<IContactDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeContact);
  }
}
