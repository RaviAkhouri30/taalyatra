import { Directive, computed, input } from '@angular/core';
import { festivalLook } from '@shared/constants/festival-looks.constants';
import { Festival } from '@shared/enums/festival.enum';

/**
 * Gives its host a festival's colours (2.16.0) as custom properties, `--fest-base`, `--fest-glow`
 * and `--fest-text`, with the `festival-look` class that the host's styles use them under.
 * Diwali and no festival set none, so the theme's own colours apply. Host bindings rather than
 * inline styles (CLAUDE.md §6).
 */
@Directive({
  selector: '[appFestivalLook]',
  host: {
    '[class.festival-look]': 'colours() !== null',
    '[style.--fest-base]': 'colours()?.base ?? null',
    '[style.--fest-glow]': 'colours()?.glow ?? null',
    '[style.--fest-text]': 'colours()?.text ?? null',
  },
})
export class FestivalLookDirective {
  /** The festival whose colours the host takes. */
  public readonly appFestivalLook = input<Festival>(Festival.None);

  protected readonly colours = computed(() => festivalLook(this.appFestivalLook()).colours);
}
