import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { type IManager, RoleFormMode } from '../../models/team-access.model';
import { TeamAccessViewModel } from '../../view-models/team-access.view-model';
import { ManagerCardComponent } from '../manager-card/manager-card.component';
import { ManagerFormComponent } from '../manager-form/manager-form.component';

/** Team access (0019): the owner adds, changes and removes the managers who help with the site. */
@Component({
  selector: 'app-team-access-page',
  imports: [ButtonDirective, ManagerCardComponent, ManagerFormComponent],
  templateUrl: './team-access-page.component.html',
  styleUrl: './team-access-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TeamAccessViewModel],
})
export default class TeamAccessPageComponent extends BaseComponent<readonly IManager[]> {
  protected override readonly model = inject(TeamAccessViewModel);
  protected readonly formOpen = computed(() => this.model.mode() !== RoleFormMode.Closed);
}
