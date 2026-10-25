import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonVariant } from '@shared/enums/button-variant.enum';
import { type HeroModel } from './hero.model';
import { HomeHeroViewModel } from './home-hero.view-model';

/** Alt text of the animated drum illustration (it is informative, not decorative). */
const STAGE_ALT =
  'Animation of two hands playing a djembe drum, with small drums, music notes, sparks and sound bars';

/**
 * Home hero (design `#top`): headline, lead, calls to action and audience pills beside the
 * animated drum stage, over a twinkling sky. The illustrations are static SVG assets with their
 * own embedded animations, so they paint immediately while the copy loads.
 */
@Component({
  selector: 'app-home-hero',
  imports: [ButtonDirective, NgOptimizedImage, RouterLink],
  templateUrl: './home-hero.component.html',
  styleUrl: './home-hero.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeHeroViewModel],
})
export class HomeHeroComponent extends BaseComponent<HeroModel> {
  protected override readonly model = inject(HomeHeroViewModel);
  protected readonly buttonVariant = ButtonVariant;
  protected readonly stageAlt = STAGE_ALT;
  /** Intrinsic size of the stage illustration (its viewBox). */
  protected readonly stageSize = 600;
}
