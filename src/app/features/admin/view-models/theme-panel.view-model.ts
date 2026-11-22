import { Injectable, computed, inject, signal } from '@angular/core';
import { type AbstractControl, type FormRecord } from '@angular/forms';
import { type Observable, ReplaySubject, map, merge, startWith, switchMap, tap } from 'rxjs';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import {
  THEME_PRESETS,
  type IThemePresetDefinition,
} from '@shared/constants/theme-presets.constants';
import { ThemePreset } from '@shared/enums/theme-preset.enum';
import { type SiteTheme } from '@shared/models/site-theme.model';
import { isDark } from '@shared/utils/colour.util';
import { ViewModel } from '@shared/base/view-model';
import { type SavedTheme } from '../models/saved-theme.model';
import { RESET_VALUES, presetOf, presetValues, themeOfForm } from '../models/theme-form';
import { SavedThemesService } from '../services/saved-themes.service';

/** What the Themes panel calls a form that is neither a ready-made nor a saved theme (0027 D5). */
export const OWN_COLOURS_LABEL = 'Your own colours';

/**
 * @param name A saved theme's name.
 * @returns What the Themes panel calls the form when it is that theme.
 */
export function savedThemeLabel(name: string): string {
  return `Your theme: ${name}`;
}

/**
 * The Theme page's panels (0021): follows the card's form as it changes, works out the theme and
 * its contrast, and fills the form from a ready-made theme, a saved one (0027) or today's look.
 */
@Injectable()
export class ThemePanelViewModel extends ViewModel<SiteTheme> {
  /** The ready-made themes on a dark background, in order (0027 D5). */
  public readonly darkPresets = THEME_PRESETS.filter((entry) => isDark(entry.colours.background));
  /** The ready-made themes on a light background, in order. */
  public readonly lightPresets = THEME_PRESETS.filter((entry) => !isDark(entry.colours.background));
  /** The ready-made theme the form matches, or `custom`. */
  public readonly preset = signal(ThemePreset.WarmNight);
  /** Every pair's result, in the page's order. */
  public readonly results = computed(() => this.data()?.contrast() ?? []);
  /** The pairs that fail. */
  public readonly failing = computed(() => this.results().filter((result) => !result.passes));
  /** The saved themes, by name. */
  public readonly saved: SavedThemesService['themes'];
  /**
   * The saved theme the form matches, if any: also when its colours are a ready-made theme's, since
   * it holds more (the text and fonts too), so its swatch and name are the ones shown.
   */
  public readonly savedMatch = computed(() => {
    const values = this.values();
    return this.saved().find((theme) => theme.matches(values));
  });
  /** What the form is: a saved theme's name, a ready-made theme's, or the owner's own colours. */
  public readonly themeLabel = computed(() => {
    const saved = this.savedMatch();
    const preset = THEME_PRESETS.find((entry) => entry.preset === this.preset());
    return saved ? savedThemeLabel(saved.name) : (preset?.label ?? OWN_COLOURS_LABEL);
  });

  private readonly themes = inject(SavedThemesService);
  private readonly values = signal<DocumentFields>({});
  private readonly forms = new ReplaySubject<FormRecord<AbstractControl>>(1);
  private form: FormRecord<AbstractControl> | null = null;

  public constructor() {
    super();
    this.saved = this.themes.themes;
  }

  /** @param form The card's form, whose values the panels follow and fill. */
  public watch(form: FormRecord<AbstractControl>): void {
    this.form = form;
    this.forms.next(form);
  }

  /** @param preset A ready-made theme: its colours and background fill the form. */
  public choose(preset: IThemePresetDefinition): void {
    this.fill(presetValues(preset));
  }

  /** @param theme A saved theme: everything it holds fills the form (0027 D2). */
  public chooseSaved(theme: SavedTheme): void {
    this.fill(theme.values);
  }

  /** Puts today's look back in the form, as a draft like any other change. */
  public reset(): void {
    this.fill(RESET_VALUES);
  }

  protected override attachViewHandler(): Observable<unknown> {
    // merge: the saved themes load once for the page, beside the form it follows.
    return merge(this.themes.load(), this.follow());
  }

  private follow(): Observable<unknown> {
    // switchMap: only the card's current form matters.
    return this.forms.pipe(
      switchMap((form) => form.valueChanges.pipe(startWith(form.getRawValue()))),
      map(() => (this.form?.getRawValue() ?? {}) as DocumentFields),
      tap((values) => {
        this.values.set(values);
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
