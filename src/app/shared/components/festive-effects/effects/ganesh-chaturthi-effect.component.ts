import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveEffect } from './festive-effect';

/** The Ganesh Chaturthi animation (2.16.0): falling petals. */
@Component({
  selector: 'app-ganesh-chaturthi-effect',
  imports: [ParticleDirective],
  templateUrl: './festive-effect.html',
  styleUrl: './ganesh-chaturthi-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GaneshChaturthiEffectComponent extends FestiveEffect {}
