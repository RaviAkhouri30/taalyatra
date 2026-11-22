import { Injectable, computed, inject, signal } from '@angular/core';
import { type AbstractControl, FormControl, type FormRecord, Validators } from '@angular/forms';
import { EMPTY, type Observable, Subject, catchError, exhaustMap, finalize, map, tap } from 'rxjs';
import { type DocumentFields } from '@core/interfaces/i-document-store';
import { ViewModel } from '@shared/base/view-model';
import { requiredTrimmedValidator } from '../forms/auth.validators';
import { nameNotTakenValidator } from '../forms/saved-theme.validators';
import { SAVED_THEMES_MAX, SAVED_THEME_NAME_MAX } from '../models/saved-theme.constants';
import { type SavedTheme } from '../models/saved-theme.model';
import { SavedThemesService } from '../services/saved-themes.service';

/** What the Your themes panel says (0027). */
export const SAVED_THEME_TEXT = {
  noName: 'Give the theme a name.',
  longName: `Keep the name to ${String(SAVED_THEME_NAME_MAX)} characters or fewer.`,
  takenName: 'You already have a theme with that name. Choose another.',
  full: `You have ${String(SAVED_THEMES_MAX)} saved themes. Delete one to save another.`,
  failed: 'Couldn’t save the change. Try again.',
  loadFailed: 'Couldn’t load your saved themes. Reload the page to try again.',
} as const;

/**
 * @param count How many pairs of colours fail the contrast check.
 * @returns Why the theme can't be saved yet.
 */
export function hardToReadText(count: number): string {
  return `Fix the ${String(count)} hard-to-read ${count === 1 ? 'pair' : 'pairs'} first.`;
}

/**
 * @param control A name field.
 * @returns What's wrong with it, or `''`.
 */
function nameError(control: FormControl<string>): string {
  // Checked again now: the names in use may have changed since it was typed.
  control.updateValueAndValidity();
  if (control.hasError('required')) {
    return SAVED_THEME_TEXT.noName;
  }
  if (control.hasError('maxlength')) {
    return SAVED_THEME_TEXT.longName;
  }
  return control.hasError('nameTaken') ? SAVED_THEME_TEXT.takenName : '';
}

/**
 * The Your themes panel (0027): saves the Theme page's form under a name, and renames or deletes
 * the saved themes. None of it changes the site; choosing one is the Themes panel's.
 */
@Injectable()
export class SavedThemesViewModel extends ViewModel<null> {
  /** The saved themes, by name. */
  public readonly themes: SavedThemesService['themes'];
  /** They couldn't be read. */
  public readonly loadFailed: SavedThemesService['loadFailed'];
  /** The name to save the form under. */
  public readonly name: FormControl<string>;
  /** The new name of the theme being renamed. */
  public readonly newName: FormControl<string>;
  /** The id of the theme being renamed, if any. */
  public readonly renaming = signal<string | null>(null);
  /** The id of the theme whose delete is being confirmed, if any. */
  public readonly confirming = signal<string | null>(null);
  /** A save, rename or delete is running. */
  public readonly busy = signal(false);
  /** What's wrong with the name being saved, once Save was pressed. */
  public readonly nameError = signal('');
  /** What's wrong with the new name, once Save was pressed. */
  public readonly newNameError = signal('');
  /** Why the theme can't be saved, or a write that failed. */
  public readonly problem = signal('');
  /** What the last change did. */
  public readonly done = signal('');
  /** The theme whose delete is being confirmed, for the panel's wording. */
  public readonly confirmingTheme = computed(() =>
    this.themes().find((theme) => theme.id === this.confirming()),
  );

  private readonly service = inject(SavedThemesService);
  private readonly commands = new Subject<() => Observable<string>>();
  private readonly failing = signal(0);
  private form: FormRecord<AbstractControl> | null = null;

  public constructor() {
    super();
    this.themes = this.service.themes;
    this.loadFailed = this.service.loadFailed;
    this.name = this.nameControl(() => this.themes().map((theme) => theme.name));
    this.newName = this.nameControl(() =>
      this.themes()
        .filter((theme) => theme.id !== this.renaming())
        .map((theme) => theme.name),
    );
  }

  /**
   * @param form The Theme page's form, which Save keeps.
   * @param failing How many pairs fail the contrast check now.
   */
  public watch(form: FormRecord<AbstractControl>, failing: number): void {
    this.form = form;
    this.failing.set(failing);
  }

  /** Saves the form under the typed name, or says why it can't. */
  public save(): void {
    this.nameError.set(nameError(this.name));
    const blocked = this.blocked();
    this.problem.set(blocked);
    if (this.nameError() || blocked) {
      return;
    }
    const name = this.name.value;
    const values = (this.form?.getRawValue() ?? {}) as DocumentFields;
    this.run(() =>
      this.service.save(name, values).pipe(
        tap(() => {
          this.name.reset();
        }),
        map((theme) => `Saved as ${theme.name}.`),
      ),
    );
  }

  /** @param theme A saved theme: its name becomes editable. */
  public startRename(theme: SavedTheme): void {
    this.confirming.set(null);
    this.newNameError.set('');
    this.newName.setValue(theme.name);
    this.renaming.set(theme.id);
  }

  /** Leaves the name as it was. */
  public cancelRename(): void {
    this.renaming.set(null);
  }

  /** @param theme The theme being renamed: it gets the new name, when it's a good one. */
  public rename(theme: SavedTheme): void {
    this.newNameError.set(nameError(this.newName));
    if (this.newNameError()) {
      return;
    }
    const name = this.newName.value;
    this.run(() =>
      this.service.rename(theme, name).pipe(
        tap(() => {
          this.renaming.set(null);
        }),
        map((renamed) => `Renamed to ${renamed.name}.`),
      ),
    );
  }

  /** @param theme A saved theme: the panel asks before deleting it. */
  public askRemove(theme: SavedTheme): void {
    this.renaming.set(null);
    this.confirming.set(theme.id);
  }

  /** Keeps the theme. */
  public cancelRemove(): void {
    this.confirming.set(null);
  }

  /** @param theme The theme being confirmed: it's deleted, and the site keeps its theme. */
  public remove(theme: SavedTheme): void {
    this.run(() =>
      this.service.remove(theme).pipe(
        tap(() => {
          this.confirming.set(null);
        }),
        map(() => `Deleted ${theme.name}. The site keeps its theme.`),
      ),
    );
  }

  protected override attachCommandHandler(): Observable<unknown> {
    return this.commands.pipe(
      // exhaustMap: one change at a time; a second press while one is stored is ignored.
      exhaustMap((command) => {
        this.busy.set(true);
        this.done.set('');
        this.problem.set('');
        return command().pipe(
          tap((done) => {
            this.done.set(done);
          }),
          // Inside the exhaustMap: a failed write leaves the panel ready for the next one.
          catchError(() => {
            this.problem.set(SAVED_THEME_TEXT.failed);
            return EMPTY;
          }),
          finalize(() => {
            this.busy.set(false);
          }),
        );
      }),
    );
  }

  /** @returns Why nothing can be saved now (0027 D4, AC 5), or `''`. */
  private blocked(): string {
    if (this.failing() > 0) {
      return hardToReadText(this.failing());
    }
    return this.themes().length >= SAVED_THEMES_MAX ? SAVED_THEME_TEXT.full : '';
  }

  private run(command: () => Observable<string>): void {
    this.commands.next(command);
  }

  private nameControl(taken: () => readonly string[]): FormControl<string> {
    return new FormControl('', {
      nonNullable: true,
      validators: [
        requiredTrimmedValidator,
        Validators.maxLength(SAVED_THEME_NAME_MAX),
        nameNotTakenValidator(taken),
      ],
    });
  }
}
