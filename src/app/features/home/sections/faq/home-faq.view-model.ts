import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { HomeFaqService } from './home-faq.service';
import { type IFaqDto } from './i-faq';

/** Loads the FAQ (display-ready as stored; open/closed state lives in the native disclosure). */
@Injectable()
export class HomeFaqViewModel extends ViewModel<IFaqDto> {
  private readonly faqService = inject(HomeFaqService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.faqService.attachViewDataHandler().pipe(
      tap((dto) => {
        this.setData(dto);
      }),
    );
  }
}
