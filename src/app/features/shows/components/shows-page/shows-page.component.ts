import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { PageCtaComponent } from '@shared/components/page-cta/page-cta.component';
import { PageHeroComponent } from '@shared/components/page-hero/page-hero.component';
import { StepsComponent } from '@shared/components/steps/steps.component';
import { PageCtaSize } from '@shared/enums/variant.enums';
import { type ShowsPageModel } from '../../models/shows-page.model';
import { ShowsPageViewModel } from '../../view-models/shows-page.view-model';
import { ShowFormatCardComponent } from '../show-format-card/show-format-card.component';

/** Shows page (design `Shows.dc.html`): formats with specs, setups and how a show comes together. */
@Component({
  selector: 'app-shows-page',
  imports: [PageCtaComponent, PageHeroComponent, ShowFormatCardComponent, StepsComponent],
  templateUrl: './shows-page.component.html',
  styleUrl: './shows-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ShowsPageViewModel],
})
export default class ShowsPageComponent extends BaseComponent<ShowsPageModel> {
  protected override readonly model = inject(ShowsPageViewModel);
  protected readonly buttonRow = PageCtaSize.Medium;
}
