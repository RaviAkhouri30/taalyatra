import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveEffect } from './festive-effect';

/** The Baisakhi animation (2.16.0): swaying wheat. */
@Component({
  selector: 'app-baisakhi-effect',
  imports: [ParticleDirective],
  templateUrl: './festive-effect.html',
  styleUrl: './baisakhi-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaisakhiEffectComponent extends FestiveEffect {}
