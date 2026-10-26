import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { HomeInstagramService } from './home-instagram.service';
import { type IInstagramDto } from './i-instagram';

/** Loads the Instagram section (display-ready as stored). */
@Injectable()
export class HomeInstagramViewModel extends ViewModel<IInstagramDto> {
  private readonly instagramService = inject(HomeInstagramService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.instagramService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(dto);
      }),
    );
  }
}
