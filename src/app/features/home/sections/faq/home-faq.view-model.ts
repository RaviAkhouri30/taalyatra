import { Injectable, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { shownOnly } from '@shared/utils/shown-only.util';
import { HomeFaqService } from './home-faq.service';
import { type IFaqDto } from './i-faq';

/** Loads the FAQ (display-ready as stored; open/closed state lives in the native disclosure). */
@Injectable()
export class HomeFaqViewModel extends ViewModel<IFaqDto> {
  private readonly faqService = inject(HomeFaqService);

  protected override attachViewHandler(): Observable<unknown> {
    return this.faqService.attachViewDataHandler().pipe(
      tap((dto) => {
        // shownOnly: a hidden question (2.15.0) isn't shown.
        this.setData({ ...dto, items: shownOnly(dto.items) });
      }),
    );
  }
}
