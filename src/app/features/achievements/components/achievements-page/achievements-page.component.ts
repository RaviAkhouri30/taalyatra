import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { IconComponent } from '@shared/components/icon/icon.component';
import { PageCtaComponent } from '@shared/components/page-cta/page-cta.component';
import { PageHeroComponent } from '@shared/components/page-hero/page-hero.component';
import { PageCtaSize } from '@shared/enums/variant.enums';
import { type AchievementsPageModel } from '../../models/achievements-page.model';
import { AchievementsPageViewModel } from '../../view-models/achievements-page.view-model';

/**
 * Achievements page (design `Achievements.dc.html`): stats, milestones, recognition, press and
 * notable performances.
 */
@Component({
  selector: 'app-achievements-page',
  imports: [IconComponent, PageCtaComponent, PageHeroComponent],
  templateUrl: './achievements-page.component.html',
  styleUrl: './achievements-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AchievementsPageViewModel],
})
export default class AchievementsPageComponent extends BaseComponent<AchievementsPageModel> {
  protected override readonly model = inject(AchievementsPageViewModel);
  protected readonly ctaSize = PageCtaSize.Medium;
}
