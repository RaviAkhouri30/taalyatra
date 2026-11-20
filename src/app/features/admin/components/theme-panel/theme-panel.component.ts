import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { type AbstractControl, type FormRecord } from '@angular/forms';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { type SiteTheme } from '@shared/models/site-theme.model';
import { SectionPanel } from '../../models/section-panel.enum';
import { ThemePanelViewModel } from '../../view-models/theme-panel.view-model';
import { ThemeSwatchComponent } from '../theme-swatch/theme-swatch.component';

/**
 * One of the Theme page's panels (0021), placed among the card's fields: the ready-made themes, the
 * contrast results, or Reset.
 */
@Component({
  selector: 'app-theme-panel',
  imports: [ButtonDirective, ThemeSwatchComponent],
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
