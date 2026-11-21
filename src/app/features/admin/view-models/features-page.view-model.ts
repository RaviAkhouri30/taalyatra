import { Injectable, inject } from '@angular/core';
import { type Observable, combineLatest, map, tap } from 'rxjs';
import { IAiService } from '@core/interfaces/i-ai-service';
import { ViewModel } from '@shared/base/view-model';
import { FEATURES } from '../models/features.constants';
import { type IFeatureGroup, featureGroups } from '../models/features-page.model';
import { AccessService } from '../services/access.service';

/**
 * The Features page (0020 V18): every feature, as the signed-in account may use it; the AI help's
 * rows only once it's set up (0025).
 */
@Injectable()
export class FeaturesPageViewModel extends ViewModel<readonly IFeatureGroup[]> {
  private readonly access = inject(AccessService);
  private readonly ai = inject(IAiService);

  protected override attachViewHandler(): Observable<unknown> {
    // combineLatest: who is looking, and whether the AI help is set up (0025), read together.
    return combineLatest([this.access.permissions$, this.ai.status()]).pipe(
      map(([permissions, status]) =>
        featureGroups(
          permissions,
          FEATURES.filter((feature) => feature.ai !== true || status.text),
        ),
      ),
      tap((groups) => {
        this.setData(groups);
      }),
    );
  }
}
