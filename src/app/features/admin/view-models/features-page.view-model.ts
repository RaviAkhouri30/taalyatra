import { Injectable, inject } from '@angular/core';
import { type Observable, map, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { type IFeatureGroup, featureGroups } from '../models/features-page.model';
import { AccessService } from '../services/access.service';

/** The Features page (0020 V18): every feature, as the signed-in account may use it. */
@Injectable()
export class FeaturesPageViewModel extends ViewModel<readonly IFeatureGroup[]> {
  private readonly access = inject(AccessService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.access.permissions$.pipe(
      map((permissions) => featureGroups(permissions)),
      tap((groups) => {
        this.setData(groups);
      }),
    );
  }
}
