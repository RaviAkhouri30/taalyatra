import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type ITeamMemberDto } from '@shared/interfaces/i-team-member';

/** One member on the Team page: photo, role, name, bio, skills and a fun fact. */
@Component({
  selector: 'app-team-card',
  imports: [NgOptimizedImage],
  templateUrl: './team-card.component.html',
  styleUrl: './team-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamCardComponent {
  public readonly member = input.required<ITeamMemberDto>();
  /** Label before the fun fact, e.g. "Fun fact:". */
  public readonly funFactLabel = input.required<string>();
  /** Load the photo eagerly: set for the first row, which holds the page's largest image (LCP). */
  public readonly priority = input(false);
}
