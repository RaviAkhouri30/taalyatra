import { inject } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { SiteConfigService } from '@shared/services/site-config.service';
import { AdminPageModel } from '../models/admin-page.model';
import { AdminPageService } from '../services/admin-page.service';

/** Base for the admin views: loads the admin copy and the site's brand in one pass. */
export abstract class AdminPageViewModel extends ViewModel<AdminPageModel> {
  private readonly pageService = inject(AdminPageService);
  private readonly siteConfigService = inject(SiteConfigService);

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.pageService.attachViewDataHandler(),
      this.siteConfigService.getSiteConfig(),
    ]).pipe(
      tap(([dto, site]) => {
        this.setData(new AdminPageModel(dto, site.brand));
      }),
    );
  }
}
