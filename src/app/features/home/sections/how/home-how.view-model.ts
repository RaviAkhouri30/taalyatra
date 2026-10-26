import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { HomeHowService } from './home-how.service';
import { type IHowDto } from './i-how';

/** Loads the "How it works" section (display-ready as stored). */
@Injectable()
export class HomeHowViewModel extends ViewModel<IHowDto> {
  private readonly howService = inject(HomeHowService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.howService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(dto);
      }),
    );
  }
}
