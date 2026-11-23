import { Directive, computed, input } from '@angular/core';
import { FESTIVE_BADGE_PARTICLES, FESTIVE_PARTICLES } from '@shared/constants/festive.constants';

/**
 * What every festival animation shares (2.16.0): the particles, placed from the design's layout,
 * in the offer band or, smaller, around the badge. Each festival is its own component with its own
 * styles, so a visitor downloads only the one in use (`@defer` in `FestiveEffectsComponent`).
 */
@Directive()
export abstract class FestiveEffect {
  /** Draws around the offer badge rather than across the offer band. */
  public readonly compact = input(false);

  protected readonly particles = computed(() =>
    this.compact() ? FESTIVE_BADGE_PARTICLES : FESTIVE_PARTICLES,
  );
}
