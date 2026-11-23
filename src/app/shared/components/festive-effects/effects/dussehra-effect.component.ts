import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveEffect } from './festive-effect';

/** The Dussehra animation (2.16.0): rising flame. */
@Component({
  selector: 'app-dussehra-effect',
  imports: [ParticleDirective],
  templateUrl: './festive-effect.html',
  styleUrl: './dussehra-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DussehraEffectComponent extends FestiveEffect {}
