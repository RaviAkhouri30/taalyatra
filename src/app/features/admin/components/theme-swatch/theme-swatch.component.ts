import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { type IThemePresetDefinition } from '@shared/constants/theme.constants';

/**
 * A ready-made theme in miniature (0021): its background, a card with a line of text, and an accent
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
    '[style.--sw-bg]': 'preset().colours.background',
    '[style.--sw-card]': 'preset().colours.cards',
    '[style.--sw-text]': 'preset().colours.text',
    '[style.--sw-accent]': 'preset().colours.accent',
  },
})
export class ThemeSwatchComponent {
  /** The theme to show. */
  public readonly preset = input.required<IThemePresetDefinition>();
}
