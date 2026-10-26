import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { HomeProofService } from './home-proof.service';
import { type IProofDto } from './i-proof';

/** Loads the proof section (display-ready as stored). */
@Injectable()
export class HomeProofViewModel extends ViewModel<IProofDto> {
  private readonly proofService = inject(HomeProofService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.proofService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(dto);
      }),
    );
  }
}
