import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { PageCtaComponent } from '@shared/components/page-cta/page-cta.component';
import { PageHeroComponent } from '@shared/components/page-hero/page-hero.component';
import { HeroLeadGap } from '@shared/enums/hero-lead-gap.enum';
import { type TeamPageModel } from '../../models/team-page.model';
import { TeamPageViewModel } from '../../view-models/team-page.view-model';
import { TeamCardComponent } from '../team-card/team-card.component';

/** Team page (design `Team.dc.html`): every member, the three habits and a call to action. */
@Component({
  selector: 'app-team-page',
  imports: [PageCtaComponent, PageHeroComponent, TeamCardComponent],
  templateUrl: './team-page.component.html',
  styleUrl: './team-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TeamPageViewModel],
})
export default class TeamPageComponent extends BaseComponent<TeamPageModel> {
  protected override readonly model = inject(TeamPageViewModel);
  protected readonly leadGap = HeroLeadGap.Relaxed;
  /** Cards in the first row on desktop (three columns): their photos load eagerly. */
  protected readonly firstRow = 3;
}
