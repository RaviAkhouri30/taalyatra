import { Injectable, computed, signal } from '@angular/core';
import { type AbstractControl, type FormRecord } from '@angular/forms';
import { type Observable, ReplaySubject, map, startWith, switchMap, tap } from 'rxjs';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { THEME_PRESETS, type IThemePresetDefinition } from '@shared/constants/theme.constants';
import { ThemePreset } from '@shared/enums/theme-preset.enum';
import { type SiteTheme } from '@shared/models/site-theme.model';
import { ViewModel } from '@shared/base/view-model';
import { RESET_VALUES, presetOf, presetValues, themeOfForm } from '../models/theme-form';

/**
 * The Theme page's panels (0021): follows the card's form as it changes, works out the theme and
 * its contrast, and fills the form from a ready-made theme or today's look.
 */
@Injectable()
export class ThemePanelViewModel extends ViewModel<SiteTheme> {
  /** The ready-made themes, in order. */
  public readonly presets = THEME_PRESETS;
  /** The ready-made theme the form matches, or `custom`. */
  public readonly preset = signal(ThemePreset.WarmNight);
  /** Every pair's result, in the page's order. */
  public readonly results = computed(() => this.data()?.contrast() ?? []);
  /** The pairs that fail. */
  public readonly failing = computed(() => this.results().filter((result) => !result.passes));

  private readonly forms = new ReplaySubject<FormRecord<AbstractControl>>(1);
  private form: FormRecord<AbstractControl> | null = null;

  /** @param form The card's form, whose values the panels follow and fill. */
  public watch(form: FormRecord<AbstractControl>): void {
    this.form = form;
    this.forms.next(form);
  }

  /** @param preset A ready-made theme: its colours and background fill the form. */
  public choose(preset: IThemePresetDefinition): void {
    this.fill(presetValues(preset));
  }

  /** Puts today's look back in the form, as a draft like any other change. */
  public reset(): void {
    this.fill(RESET_VALUES);
  }

  protected override attachViewHandler(): Observable<unknown> {
    // switchMap: only the card's current form matters.
    return this.forms.pipe(
      switchMap((form) => form.valueChanges.pipe(startWith(form.getRawValue()))),
      map(() => (this.form?.getRawValue() ?? {}) as DocumentFields),
      tap((values) => {
        this.preset.set(presetOf(values));
        this.setData(themeOfForm(values));
      }),
    );
  }

  private fill(values: DocumentFields): void {
    this.form?.patchValue(values);
    this.form?.markAsDirty();
  }
}
