import { Injectable, inject } from '@angular/core';
import { type Observable, combineLatest, filter, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { SiteConfigService } from '@shared/services/site-config.service';
import { HomeOfferService } from './home-offer.service';
import { OfferModel } from './offer.model';

/** Loads the seasonal offer and joins it with the contact details for the WhatsApp button. */
@Injectable()
export class HomeOfferViewModel extends ViewModel<OfferModel> {
  private readonly offerService = inject(HomeOfferService);
  private readonly siteConfigService = inject(SiteConfigService);

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.offerService.attachViewDataHandler(),
      this.siteConfigService.getSiteConfig(),
    ]).pipe(
      // No running promotion (switched off or outside its dates): the section stays unrendered.
      filter(([, site]) => site.promotion !== null),
      tap(([offer, site]) => {
        this.setData(new OfferModel(offer, site.contact));
      }),
    );
  }
}
