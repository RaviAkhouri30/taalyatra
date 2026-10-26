import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '@shared/components/icon/icon.component';
import { IconName } from '@shared/enums/icon-name.enum';
import { type ExperienceModel } from './experiences.model';

/** Icons for the duration, group size and venue specs, in that order. */
const SPEC_ICONS: readonly IconName[] = [IconName.Clock, IconName.Group, IconName.MapPin];

/**
 * One experience card. The whole card is a link; the featured variant is a wide accent card
 * with a call-to-action label.
 */
@Component({
  selector: 'app-experience-card',
  imports: [IconComponent, NgOptimizedImage, RouterLink],
  templateUrl: './experience-card.component.html',
  styleUrl: './experience-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExperienceCardComponent {
  public readonly experience = input.required<ExperienceModel>();
  public readonly featured = input<boolean>(false);
  /** Button-styled label inside the card (featured card only). */
  public readonly cta = input<string>('');

  protected readonly specIcons = SPEC_ICONS;
}
