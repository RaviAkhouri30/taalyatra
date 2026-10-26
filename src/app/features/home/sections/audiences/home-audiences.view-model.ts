import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { AudiencesModel } from './audiences.model';
import { HomeAudiencesService } from './home-audiences.service';

/** Loads the "Who it's for" section. */
@Injectable()
export class HomeAudiencesViewModel extends ViewModel<AudiencesModel> {
  private readonly audiencesService = inject(HomeAudiencesService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.audiencesService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(new AudiencesModel(dto));
      }),
    );
  }
}
