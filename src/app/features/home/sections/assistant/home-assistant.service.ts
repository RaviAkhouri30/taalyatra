import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IAssistantDto } from './i-assistant';

/** Reads the chat assistant's copy and replies. */
@Service()
export class HomeAssistantService extends ApiBaseService<IAssistantDto> {
  public override attachViewDataHandler(): Observable<IAssistantDto> {
    return this.attachViewApiHandler(ApiEndpoint.HomeAssistant);
  }
}
