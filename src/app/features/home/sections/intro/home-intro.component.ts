import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { BaseComponent } from '@shared/base/base-component';
import { HomeIntroViewModel } from './home-intro.view-model';
import { type IIntro } from './i-intro';

/** Rendered logo size in px (the file is 156 px square). */
const LOGO_SIZE = 150;
/** Drum bars under the logo (design). */
const BAR_COUNT = 5;

/**
 * Intro loader (design `.loader`): the logo with pulsing rings and drum bars, fading out after
 * ~3.5 s. Purely decorative (`aria-hidden`); hidden entirely under reduced motion.
 */
@Component({
  selector: 'app-home-intro',
  imports: [NgOptimizedImage],
  templateUrl: './home-intro.component.html',
  styleUrl: './home-intro.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [HomeIntroViewModel],
})
export class HomeIntroComponent extends BaseComponent<IIntro> {
  protected override readonly model = inject(HomeIntroViewModel);
  protected readonly logoSize = LOGO_SIZE;
  protected readonly bars = Array.from({ length: BAR_COUNT }, (_, index) => index);

  /** Only the overlay's own fade-out ends the intro; children's animations bubble up too. */
  protected onAnimationEnd(event: AnimationEvent): void {
    if (event.target === event.currentTarget) {
      this.model.finish();
    }
  }
}
