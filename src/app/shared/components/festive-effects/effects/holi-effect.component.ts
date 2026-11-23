import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveEffect } from './festive-effect';

/** The Holi animation (2.16.0): colour puffs. */
@Component({
  selector: 'app-holi-effect',
  imports: [ParticleDirective],
  templateUrl: './festive-effect.html',
  styleUrl: './holi-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoliEffectComponent extends FestiveEffect {}
