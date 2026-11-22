import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { type AbstractControl, type FormRecord } from '@angular/forms';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { type SiteTheme } from '@shared/models/site-theme.model';
import { SectionPanel } from '../../models/section-panel.enum';
import { ThemePanelViewModel } from '../../view-models/theme-panel.view-model';
import { SavedThemesPanelComponent } from '../saved-themes-panel/saved-themes-panel.component';
import { ThemeSwatchComponent } from '../theme-swatch/theme-swatch.component';

/**
 * One of the Theme page's panels (0021), placed among the card's fields: the themes to choose, the
 * contrast results, Reset, or the saved themes (0027).
 */
@Component({
  selector: 'app-theme-panel',
  imports: [ButtonDirective, SavedThemesPanelComponent, ThemeSwatchComponent],
  templateUrl: './theme-panel.component.html',
  styleUrl: './theme-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ThemePanelViewModel],
})
export class ThemePanelComponent extends BaseComponent<SiteTheme> {
  /** Which panel this is. */
  public readonly panel = input.required<SectionPanel>();
  /** The card's form. */
  public readonly form = input.required<FormRecord<AbstractControl>>();

  protected override readonly model = inject(ThemePanelViewModel);
  protected readonly panels = SectionPanel;
  /** The ready-made themes, dark ones first (0027 D5). */
  protected readonly groups = [
    { label: 'Dark', presets: this.model.darkPresets },
    { label: 'Light', presets: this.model.lightPresets },
  ];
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;

  public constructor() {
    super();
    // The form is an input, not a stream: hand each one to the view model as it arrives.
    effect(() => {
      this.model.watch(this.form());
    });
  }
}
