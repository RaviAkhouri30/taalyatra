import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { FoldComponent } from '@shared/components/fold/fold.component';
import { FoldMode } from '@shared/enums/fold-mode.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { HomeFaqViewModel } from './home-faq.view-model';
import { type IFaqDto } from './i-faq';

/** FAQ (design `#faq`): native disclosures, keyboard and screen-reader accessible by default. */
@Component({
  selector: 'app-home-faq',
  imports: [FoldComponent],
  templateUrl: './home-faq.component.html',
  styleUrl: './home-faq.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeFaqViewModel],
})
export class HomeFaqComponent extends BaseComponent<IFaqDto> {
  /** When the section's content folds behind Show more (0015 V15). */
  public readonly fold = input(FoldMode.Never);
  protected override readonly model = inject(HomeFaqViewModel);
  protected readonly anchor = PageAnchor.Faq;
}
