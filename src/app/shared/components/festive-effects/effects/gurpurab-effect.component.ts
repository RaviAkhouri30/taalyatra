import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveEffect } from './festive-effect';

/** The Gurpurab animation (2.16.0): a soft glow. */
@Component({
  selector: 'app-gurpurab-effect',
  imports: [ParticleDirective],
  templateUrl: './festive-effect.html',
  styleUrl: './gurpurab-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GurpurabEffectComponent extends FestiveEffect {}
