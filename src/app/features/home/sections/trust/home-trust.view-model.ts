import { Injectable, inject } from '@angular/core';
import { type Observable, map, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { HomeTrustService } from './home-trust.service';
import { TrustCardModel } from './trust-card.model';

/** Loads the reassurance cards. */
@Injectable()
export class HomeTrustViewModel extends ViewModel<readonly TrustCardModel[]> {
  private readonly trustService = inject(HomeTrustService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.trustService.attachViewDataHandler().pipe(
      map((cards) => cards.map((card) => new TrustCardModel(card))),
      tap((cards) => {
        this.setData(cards);
      }),
    );
  }
}
