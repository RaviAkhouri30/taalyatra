import { Injectable, inject } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { ShowFormatsService } from '@shared/services/show-formats.service';
import { SiteVisibilityService } from '@shared/services/site-visibility.service';
import { HomeShowsModel } from './home-shows.model';
import { HomeShowsService } from './home-shows.service';

/** Loads the shows teaser: its heading plus the shared show formats. */
@Injectable()
export class HomeShowsViewModel extends ViewModel<HomeShowsModel> {
  private readonly showsService = inject(HomeShowsService);
  private readonly formatsService = inject(ShowFormatsService);
  private readonly visibilityService = inject(SiteVisibilityService);

  protected override attachViewHandler(): Observable<unknown> {
    return combineLatest([
      this.showsService.attachViewDataHandler(),
      this.formatsService.getFormats(),
      this.visibilityService.getVisibility(),
    ]).pipe(
      tap(([dto, formats, visibility]) => {
        this.setData(new HomeShowsModel(dto, formats, visibility));
      }),
    );
  }
}
