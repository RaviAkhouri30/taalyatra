import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { HomeShowsModel } from './home-shows.model';
import { HomeShowsService } from './home-shows.service';

/** Loads the shows teaser. */
@Injectable()
export class HomeShowsViewModel extends ViewModel<HomeShowsModel> {
  private readonly showsService = inject(HomeShowsService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.showsService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(new HomeShowsModel(dto));
      }),
    );
  }
}
