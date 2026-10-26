import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { HomeFaqViewModel } from './home-faq.view-model';
import { type IFaqDto } from './i-faq';

/** FAQ (design `#faq`): native disclosures, keyboard and screen-reader accessible by default. */
@Component({
  selector: 'app-home-faq',
  templateUrl: './home-faq.component.html',
  styleUrl: './home-faq.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeFaqViewModel],
})
export class HomeFaqComponent extends BaseComponent<IFaqDto> {
  protected override readonly model = inject(HomeFaqViewModel);
  protected readonly anchor = PageAnchor.Faq;
}
