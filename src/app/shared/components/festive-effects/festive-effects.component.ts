import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FESTIVE_PARTICLES } from '@shared/constants/festive.constants';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveTheme } from '@shared/enums/festive-theme.enum';

/**
 * Decorative particle layer for seasonal offers. Fills its positioned parent and sits behind
 * the content. Draws nothing for `FestiveTheme.None` or under reduced motion.
 */
@Component({
  selector: 'app-festive-effects',
  imports: [ParticleDirective],
  templateUrl: './festive-effects.component.html',
  styleUrl: './festive-effects.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FestiveEffectsComponent {
  public readonly theme = input<FestiveTheme>(FestiveTheme.None);

  protected readonly isVisible = computed(() => this.theme() !== FestiveTheme.None);
  protected readonly isSparks = computed(() => this.theme() === FestiveTheme.Sparks);
  protected readonly particles = FESTIVE_PARTICLES;
}
