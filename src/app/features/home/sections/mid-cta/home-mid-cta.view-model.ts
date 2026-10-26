import { Injectable, inject } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { SiteConfigService } from '@shared/services/site-config.service';
import { HomeMidCtaService } from './home-mid-cta.service';
import { MidCtaModel } from './mid-cta.model';

/** Loads the band and joins it with the contact details for the WhatsApp button. */
@Injectable()
export class HomeMidCtaViewModel extends ViewModel<MidCtaModel> {
  private readonly ctaService = inject(HomeMidCtaService);
  private readonly siteConfigService = inject(SiteConfigService);

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.ctaService.attachViewDataHandler(),
      this.siteConfigService.getSiteConfig(),
    ]).pipe(
      tap(([cta, site]) => {
        this.setData(new MidCtaModel(cta, site.contact));
      }),
    );
  }
}
