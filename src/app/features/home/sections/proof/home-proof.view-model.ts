import { Injectable, inject } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { AppRoute } from '@shared/enums/app-route.enum';
import { SiteVisibilityService } from '@shared/services/site-visibility.service';
import { navLink } from '@shared/utils/link.util';
import { visibleLink } from '@shared/utils/visibility.util';
import { HomeProofService } from './home-proof.service';
import { type IProofView } from './i-proof';

/** Loads the proof section (display-ready as stored). */
@Injectable()
export class HomeProofViewModel extends ViewModel<IProofView> {
  private readonly proofService = inject(HomeProofService);
  private readonly visibilityService = inject(SiteVisibilityService);

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.proofService.attachViewDataHandler(),
      this.visibilityService.getVisibility(),
    ]).pipe(
      tap(([dto, visibility]) => {
        const achievementsPage = visibleLink(navLink(dto.cta, AppRoute.Achievements), visibility);
        this.setData({ ...dto, achievementsPage });
      }),
    );
  }
}
