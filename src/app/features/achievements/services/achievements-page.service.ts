import { Service } from '@angular/core';
import { type Observable } from 'rxjs';
import { ApiBaseService } from '@shared/base/api-base.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { type IAchievementsPageDto } from '../models/i-achievements-page';

/** Reads the Achievements page copy (`pages/achievements`). */
@Service()
export class AchievementsPageService extends ApiBaseService<IAchievementsPageDto> {
  public override attachViewDataHandler(): Observable<IAchievementsPageDto> {
    return this.attachViewApiHandler(ApiEndpoint.PagesAchievements);
  }
}
