import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveEffect } from './festive-effect';

/** The NewYear animation (2.16.0): confetti. */
@Component({
  selector: 'app-new-year-effect',
  imports: [ParticleDirective],
  templateUrl: './festive-effect.html',
  styleUrl: './new-year-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewYearEffectComponent extends FestiveEffect {}
