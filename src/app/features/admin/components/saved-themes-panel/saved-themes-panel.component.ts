import { ChangeDetectionStrategy, Component, effect, inject, input } from '@angular/core';
import { type AbstractControl, type FormRecord, ReactiveFormsModule } from '@angular/forms';
import { BaseComponent } from '@shared/base/base-component';
import { ButtonDirective } from '@shared/directives/button.directive';
import { ButtonSize, ButtonVariant } from '@shared/enums/button-variant.enum';
import { formatMoment } from '../../models/editor-dates';
import { SAVED_THEME_TEXT, SavedThemesViewModel } from '../../view-models/saved-themes.view-model';

/**
 * The Theme page's Your themes panel (0027): Save as my theme, and each saved theme with Rename and
 * Delete. Its own component, with its own styles, beside the other theme panels.
 */
@Component({
  selector: 'app-saved-themes-panel',
  imports: [ButtonDirective, ReactiveFormsModule],
  templateUrl: './saved-themes-panel.component.html',
  styleUrl: './saved-themes-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SavedThemesViewModel],
})
export class SavedThemesPanelComponent extends BaseComponent<null> {
  /** The Theme page's form, which Save keeps. */
  public readonly form = input.required<FormRecord<AbstractControl>>();
  /** How many pairs of colours fail the contrast check now. */
  public readonly failing = input.required<number>();

  protected override readonly model = inject(SavedThemesViewModel);
  protected readonly ghost = ButtonVariant.Ghost;
  protected readonly compact = ButtonSize.Compact;
  protected readonly when = formatMoment;
  protected readonly text = SAVED_THEME_TEXT;

  public constructor() {
    super();
    // Inputs, not streams: hand each change to the view model as it arrives.
    effect(() => {
      this.model.watch(this.form(), this.failing());
    });
  }
}
