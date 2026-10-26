import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { DrumCircleModel } from './drum-circle.model';
import { HomeDrumCircleService } from './home-drum-circle.service';

/** Loads the Drum Circle details. */
@Injectable()
export class HomeDrumCircleViewModel extends ViewModel<DrumCircleModel> {
  private readonly drumCircleService = inject(HomeDrumCircleService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.drumCircleService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(new DrumCircleModel(dto));
      }),
    );
  }
}
