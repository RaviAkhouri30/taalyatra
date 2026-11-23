import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveEffect } from './festive-effect';

/** The Diwali animation (2.16.0): crackers bursting outward. */
@Component({
  selector: 'app-diwali-effect',
  imports: [ParticleDirective],
  templateUrl: './festive-effect.html',
  styleUrl: './diwali-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiwaliEffectComponent extends FestiveEffect {}
