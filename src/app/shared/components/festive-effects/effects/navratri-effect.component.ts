import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ParticleDirective } from '@shared/directives/particle.directive';
import { FestiveEffect } from './festive-effect';

/** The Navratri animation (2.16.0): swirling garba dots. */
@Component({
  selector: 'app-navratri-effect',
  imports: [ParticleDirective],
  templateUrl: './festive-effect.html',
  styleUrl: './navratri-effect.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavratriEffectComponent extends FestiveEffect {}
