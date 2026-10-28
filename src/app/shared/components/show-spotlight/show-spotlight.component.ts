import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PageCtaComponent } from '@shared/components/page-cta/page-cta.component';
import { type ShowSpotlightModel } from '@shared/models/show-spotlight.model';

/**
 * The featured show (classical concerts): a large image beside its story and two buttons. It
 * always sits under a section heading, so its title is an `h3`.
 */
@Component({
  selector: 'app-show-spotlight',
  imports: [NgOptimizedImage, PageCtaComponent],
  templateUrl: './show-spotlight.component.html',
  styleUrl: './show-spotlight.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowSpotlightComponent {
  public readonly spotlight = input.required<ShowSpotlightModel>();
  /** Load the image eagerly: set where it is the page's largest image (LCP). */
  public readonly priority = input(false);
}
