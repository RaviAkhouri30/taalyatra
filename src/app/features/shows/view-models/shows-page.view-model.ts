import { Injectable, inject } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { ShowFormatsService } from '@shared/services/show-formats.service';
import { SiteConfigService } from '@shared/services/site-config.service';
import { ShowsPageModel } from '../models/shows-page.model';
import { ShowsPageService } from '../services/shows-page.service';

/** Loads the Shows page: its copy, the shared formats and site config, rendered in one pass. */
@Injectable()
export class ShowsPageViewModel extends ViewModel<ShowsPageModel> {
  private readonly pageService = inject(ShowsPageService);
  private readonly formatsService = inject(ShowFormatsService);
  private readonly siteConfigService = inject(SiteConfigService);

  protected override attachViewHandler(): Observable<unknown> {
    // combineLatest: one render once the copy, the formats and site config are all in.
    return combineLatest([
      this.pageService.attachViewDataHandler(),
      this.formatsService.getFormats(),
      this.siteConfigService.getSiteConfig(),
    ]).pipe(
      tap(([dto, formats, site]) => {
        this.setData(new ShowsPageModel(dto, formats, site));
      }),
    );
  }
}
