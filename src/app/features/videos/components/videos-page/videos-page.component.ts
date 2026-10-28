import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { FilterChipsComponent } from '@shared/components/filter-chips/filter-chips.component';
import { PageCtaComponent } from '@shared/components/page-cta/page-cta.component';
import { PageHeroComponent } from '@shared/components/page-hero/page-hero.component';
import { VideoCardComponent } from '@shared/components/video-card/video-card.component';
import { HeroLeadGap } from '@shared/enums/hero-lead-gap.enum';
import { VideoCardVariant } from '@shared/enums/variant.enums';
import { type VideosPageModel } from '../../models/videos-page.model';
import { VideosPageViewModel } from '../../view-models/videos-page.view-model';

/** Videos page (design `Videos.dc.html`): category chips, a featured video and the library. */
@Component({
  selector: 'app-videos-page',
  imports: [FilterChipsComponent, PageCtaComponent, PageHeroComponent, VideoCardComponent],
  templateUrl: './videos-page.component.html',
  styleUrl: './videos-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [VideosPageViewModel],
})
export default class VideosPageComponent extends BaseComponent<VideosPageModel> {
  protected override readonly model = inject(VideosPageViewModel);
  protected readonly leadGap = HeroLeadGap.Relaxed;
  protected readonly library = VideoCardVariant.Library;
  protected readonly featuredVariant = VideoCardVariant.Featured;
}
