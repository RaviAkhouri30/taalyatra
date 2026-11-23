import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Festival } from '@shared/enums/festival.enum';
import { BaisakhiEffectComponent } from './effects/baisakhi-effect.component';
import { ChristmasEffectComponent } from './effects/christmas-effect.component';
import { DiwaliEffectComponent } from './effects/diwali-effect.component';
import { DussehraEffectComponent } from './effects/dussehra-effect.component';
import { GaneshChaturthiEffectComponent } from './effects/ganesh-chaturthi-effect.component';
import { GurpurabEffectComponent } from './effects/gurpurab-effect.component';
import { HalloweenEffectComponent } from './effects/halloween-effect.component';
import { HoliEffectComponent } from './effects/holi-effect.component';
import { NavratriEffectComponent } from './effects/navratri-effect.component';
import { NewYearEffectComponent } from './effects/new-year-effect.component';

/**
 * Decorative animation layer for the seasonal offer (2.16.0): the chosen festival's own effect,
 * each loaded only when it is used (`@defer`). Fills its positioned parent and sits behind the
 * content; draws nothing for no festival, and nothing moves under reduced motion.
 */
@Component({
  selector: 'app-festive-effects',
  imports: [
    BaisakhiEffectComponent,
    ChristmasEffectComponent,
    DiwaliEffectComponent,
    DussehraEffectComponent,
    GaneshChaturthiEffectComponent,
    GurpurabEffectComponent,
    HalloweenEffectComponent,
    HoliEffectComponent,
    NavratriEffectComponent,
    NewYearEffectComponent,
  ],
  templateUrl: './festive-effects.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FestiveEffectsComponent {
  /** The festival whose animation to draw. */
  public readonly festival = input<Festival>(Festival.None);
  /** Draws around the offer badge rather than across the offer band. */
  public readonly compact = input(false);

  protected readonly festivals = Festival;
}
