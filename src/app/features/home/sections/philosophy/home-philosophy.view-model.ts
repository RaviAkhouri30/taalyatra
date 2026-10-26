import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { HomePhilosophyService } from './home-philosophy.service';
import { type IPhilosophyDto } from './i-philosophy';

/** Loads the philosophy section (display-ready as stored: no derived data). */
@Injectable()
export class HomePhilosophyViewModel extends ViewModel<IPhilosophyDto> {
  private readonly philosophyService = inject(HomePhilosophyService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.philosophyService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(dto);
      }),
    );
  }
}
