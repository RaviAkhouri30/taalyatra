import { DOCUMENT, Injectable, type Signal, inject, signal } from '@angular/core';
import {
  type Observable,
  catchError,
  defer,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import { type DocumentFields, IDocumentStore } from '@core/interfaces/i-document-store';
import { CLOCK } from '@core/tokens/clock.token';
import { SAVED_THEMES_COLLECTION } from '../models/saved-theme.constants';
import { SavedTheme } from '../models/saved-theme.model';

/** Thrown when the browser can't make an id, so nothing is saved under a made-up one. */
export class NoThemeIdError extends Error {
  public constructor() {
    super('This browser can’t make an id for a saved theme.');
    this.name = 'NoThemeIdError';
  }
}

/**
 * @param themes Saved themes.
 * @returns Them by name, as the page lists them.
 */
function byName(themes: readonly SavedTheme[]): readonly SavedTheme[] {
  return [...themes].sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The themes saved from the Theme page (0027): one document each, read fresh when the page opens
 * and changed one write at a time. The list changes only once a write is stored. Provided on the
 * admin routes, beside `BackupService`, since `IDocumentStore` lives there.
 */
@Injectable()
export class SavedThemesService {
  /** The saved themes, by name. */
  public readonly themes: Signal<readonly SavedTheme[]>;
  /** The saved themes couldn't be read: the page says so instead of showing none. */
  public readonly loadFailed = signal(false);

  private readonly store = inject(IDocumentStore);
  private readonly clock = inject(CLOCK);
  private readonly view = inject(DOCUMENT).defaultView;
  private readonly list = signal<readonly SavedTheme[]>([]);
  /**
   * One read for every panel on the page. `refCount`: once the page closes, opening it again reads
   * afresh, so a theme saved on another device shows.
   */
  private readonly loading = defer(() => this.store.readAll(SAVED_THEMES_COLLECTION)).pipe(
    map((documents) => [...documents].flatMap(([id, fields]) => SavedTheme.from(id, fields) ?? [])),
    tap((themes) => {
      this.loadFailed.set(false);
      this.list.set(byName(themes));
    }),
    map(() => undefined),
    // A failed read leaves the page usable: it says so, and saving still works.
    catchError(() => {
      this.loadFailed.set(true);
      return of(undefined);
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  public constructor() {
    // Assigned here: it reads `list`, a private field declared after the public ones.
    this.themes = this.list.asReadonly();
  }

  /** @returns Completes once the saved themes are read (or couldn't be). */
  public load(): Observable<void> {
    return this.loading;
  }

  /**
   * @param name The name, as typed.
   * @param edited The Theme page's form values.
   * @returns The saved theme, once it's stored; errors with nothing changed otherwise.
   */
  public save(name: string, edited: DocumentFields): Observable<SavedTheme> {
    // defer: the id and the time are made when the save runs, not when it's set up.
    return defer(() => {
      const id = this.view?.crypto.randomUUID();
      return id
        ? of(SavedTheme.create(id, name, this.clock.now().toISOString(), edited))
        : throwError(() => new NoThemeIdError());
    }).pipe(
      // switchMap: one write per theme made above.
      switchMap((theme) => this.write(theme)),
      tap((theme) => {
        this.list.update((themes) => byName([...themes, theme]));
      }),
    );
  }

  /**
   * @param theme A saved theme.
   * @param name Its new name, as typed.
   * @returns The renamed theme, once it's stored.
   */
  public rename(theme: SavedTheme, name: string): Observable<SavedTheme> {
    return this.write(theme.renamed(name)).pipe(
      tap((renamed) => {
        this.list.update((themes) =>
          byName(themes.map((entry) => (entry.id === renamed.id ? renamed : entry))),
        );
      }),
    );
  }

  /**
   * @param theme A saved theme. The site keeps its theme: only this copy goes.
   * @returns Completes once it's deleted.
   */
  public remove(theme: SavedTheme): Observable<void> {
    return this.store
      .commit([{ kind: DocumentWriteKind.Delete, path: this.pathOf(theme.id) }])
      .pipe(
        tap(() => {
          this.list.update((themes) => themes.filter((entry) => entry.id !== theme.id));
        }),
      );
  }

  /**
   * @param id A saved theme's id.
   * @returns Its document's path.
   */
  public pathOf(id: string): string {
    return `${SAVED_THEMES_COLLECTION}/${id}`;
  }

  private write(theme: SavedTheme): Observable<SavedTheme> {
    return this.store
      .commit([
        {
          kind: DocumentWriteKind.Set,
          path: this.pathOf(theme.id),
          fields: { ...theme.toDocument() },
        },
      ])
      .pipe(map(() => theme));
  }
}
