import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { AchievementsPageModel } from '../models/achievements-page.model';
import { AchievementsPageService } from '../services/achievements-page.service';

/** Loads the Achievements page from its one document, so it renders in one pass. */
@Injectable()
export class AchievementsPageViewModel extends ViewModel<AchievementsPageModel> {
  private readonly pageService = inject(AchievementsPageService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.pageService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(new AchievementsPageModel(dto));
      }),
    );
  }
}
