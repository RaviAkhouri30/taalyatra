import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type ThemeColours } from '@shared/constants/theme.constants';

/**
 * A theme in miniature (0021): its background, a card with a line of text, and an accent
 * button. Decorative: the button around it names the theme. Its colours are the theme's own, so they
 * come in as variables on the host rather than from the site's tokens.
 */
@Component({
  selector: 'app-theme-swatch',
  template: '<span></span><span></span>',
  styleUrl: './theme-swatch.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[style.--sw-bg]': 'colours().background',
    '[style.--sw-card]': 'colours().cards',
    '[style.--sw-text]': 'colours().text',
    '[style.--sw-accent]': 'colours().accent',
  },
})
export class ThemeSwatchComponent {
  /** The colours of the theme to show, ready-made or saved (0027). */
  public readonly colours = input.required<ThemeColours>();
}
