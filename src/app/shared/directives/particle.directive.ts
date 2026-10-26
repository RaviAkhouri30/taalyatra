import { Directive, computed, input } from '@angular/core';
import { type IFestiveParticle } from '@shared/interfaces/i-festive-particle';

/**
 * Places one festive particle by setting its CSS custom properties from host bindings
 * (templates may not carry inline styles — CLAUDE.md §6).
 */
@Directive({
  selector: '[appParticle]',
  host: {
    '[style.--l]': 'left()',
    '[style.--t]': 'top()',
    '[style.--d]': 'delay()',
  },
})
export class ParticleDirective {
  public readonly appParticle = input.required<IFestiveParticle>();

  protected readonly left = computed(() => `${String(this.appParticle().left)}%`);
  protected readonly top = computed(() => `${String(this.appParticle().top)}%`);
  protected readonly delay = computed(() => `${String(this.appParticle().delay)}s`);
}
