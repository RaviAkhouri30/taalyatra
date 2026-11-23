import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveEffect } from './festive-effect';

/** The Halloween animation (2.16.0): drifting bats. */
@Component({
  selector: 'app-halloween-effect',
  imports: [ParticleDirective],
  templateUrl: './festive-effect.html',
  styleUrl: './halloween-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HalloweenEffectComponent extends FestiveEffect {}
