import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { HomeCitiesService } from './home-cities.service';
import { type ICitiesDto } from './i-cities';

/** Loads the "Where we play" section (display-ready as stored). */
@Injectable()
export class HomeCitiesViewModel extends ViewModel<ICitiesDto> {
  private readonly citiesService = inject(HomeCitiesService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.citiesService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(dto);
      }),
    );
  }
}
