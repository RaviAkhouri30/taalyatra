import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { HomeMarqueeService } from './home-marquee.service';
import { MarqueeModel } from './marquee.model';

/** Loads the strip's items. */
@Injectable()
export class HomeMarqueeViewModel extends ViewModel<MarqueeModel> {
  private readonly marqueeService = inject(HomeMarqueeService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.marqueeService.attachViewDataHandler().pipe(
      tap((items) => {
        this.setData(new MarqueeModel(items));
      }),
    );
  }
}
