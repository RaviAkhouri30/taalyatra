import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { HomeMarqueeViewModel } from './home-marquee.view-model';
import { type MarqueeModel } from './marquee.model';

/**
 * Decorative scrolling strip of experience names under the hero. Hidden from assistive tech
 * (the same names are links in the experiences section and the footer).
 */
@Component({
  selector: 'app-home-marquee',
  templateUrl: './home-marquee.component.html',
  styleUrl: './home-marquee.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeMarqueeViewModel],
})
export class HomeMarqueeComponent extends BaseComponent<MarqueeModel> {
  protected override readonly model = inject(HomeMarqueeViewModel);
}
