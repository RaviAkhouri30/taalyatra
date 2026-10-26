import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type HomeTeamModel } from './home-team.model';
import { HomeTeamViewModel } from './home-team.view-model';

/** Team teaser (design `#team`): intro and a grid of member portraits. */
@Component({
  selector: 'app-home-team',
  imports: [ButtonDirective, NgOptimizedImage, RouterLink],
  templateUrl: './home-team.component.html',
  styleUrl: './home-team.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeTeamViewModel],
})
export class HomeTeamComponent extends BaseComponent<HomeTeamModel> {
  protected override readonly model = inject(HomeTeamViewModel);
  protected readonly anchor = PageAnchor.Team;
}
