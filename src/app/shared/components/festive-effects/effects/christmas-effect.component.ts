import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveEffect } from './festive-effect';

/** The Christmas animation (2.16.0): falling snow. */
@Component({
  selector: 'app-christmas-effect',
  imports: [ParticleDirective],
  templateUrl: './festive-effect.html',
  styleUrl: './christmas-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChristmasEffectComponent extends FestiveEffect {}
