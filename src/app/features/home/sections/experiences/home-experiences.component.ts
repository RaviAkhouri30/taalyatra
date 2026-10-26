import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { FilterChipsComponent } from '@shared/components/filter-chips/filter-chips.component';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { ExperienceCardComponent } from './experience-card.component';
import { type ExperiencesModel } from './experiences.model';
import { HomeExperiencesViewModel } from './home-experiences.view-model';

/** Experiences (design `#experiences`): filter chips, the signature card and the other cards. */
@Component({
  selector: 'app-home-experiences',
  imports: [ExperienceCardComponent, FilterChipsComponent],
  templateUrl: './home-experiences.component.html',
  styleUrl: './home-experiences.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeExperiencesViewModel],
})
export class HomeExperiencesComponent extends BaseComponent<ExperiencesModel> {
  protected override readonly model = inject(HomeExperiencesViewModel);
  protected readonly anchor = PageAnchor.Experiences;
}
