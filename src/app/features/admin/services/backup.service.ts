import { Injectable, inject } from '@angular/core';
import {
  type Observable,
  Subject,
  catchError,
  concatMap,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { DocumentWriteKind } from '@core/enums/document-write-kind.enum';
import {
  type DocumentFields,
  type DocumentWrite,
  IDocumentStore,
} from '@core/interfaces/i-document-store';
import { IFileService } from '@core/interfaces/i-file-service';
import { DeviceStoreService } from './device-store.service';
import { CLOCK } from '@core/tokens/clock.token';
import {
  BACKUP_FORMAT,
  BACKUP_MEDIA_TYPE,
  BACKUP_SITE,
  type IBackup,
  backupFileName,
  checkBackup,
  isContentPath,
} from '../models/backup-file';
import { ContentPath } from '../models/content-path.enum';
import {
  BACKUPS_STATE_PATH,
  BROWSER_BACKUP_KEY,
  BROWSER_BACKUP_MAX_CHARS,
} from '../models/editor-storage.constants';
import { MEDIA_COLLECTION } from '../models/i-media-asset';
import { LEADS_COLLECTION } from '../models/lead.model';
import { SAVED_THEMES_COLLECTION } from '../models/saved-theme.constants';
import { SavedTheme } from '../models/saved-theme.model';
import { reportTime } from '../models/speed-report.model';
import { DraftService } from './draft.service';
import { ReleaseNotesService } from './release-notes.service';

/**
 * A lead with its arrival time as a readable date: Firestore's timestamp would otherwise be saved
 * as seconds, which nobody can read.
 */
function readable(fields: DocumentFields): DocumentFields {
  const time = reportTime(fields);
  return time === null ? fields : { ...fields, createdAt: new Date(time).toISOString() };
}

/** Spaces per level in the file, so the owner can open and read it. */
const JSON_INDENT = 2;

/** A backup that was just made. */
export interface IBackupMade {
  readonly createdAt: string;
  /** Whether this browser kept a copy too; a very large backup is only downloaded. */
  readonly keptInBrowser: boolean;
  /** Whether it holds the leads (0018 D6). */
  readonly withLeads: boolean;
}

/**
 * Backups of the site's content (0016 V13): made as a downloaded file plus a copy in this
 * browser, and restored into drafts, never straight to the site. Provided on the admin routes,
 * not the root: it needs `IFileService`, which only the admin routes provide.
 */
@Injectable()
export class BackupService {
  /** Emits after each backup, wherever it was made, so every screen showing the date updates. */
  public readonly made$: Observable<IBackupMade>;

  private readonly made = new Subject<IBackupMade>();
  private readonly store = inject(IDocumentStore);
  private readonly drafts = inject(DraftService);
  private readonly files = inject(IFileService);
  private readonly deviceStore = inject(DeviceStoreService);
  private readonly releaseNotes = inject(ReleaseNotesService);
  private readonly clock = inject(CLOCK);

  public constructor() {
    // Assigned here because it reads `made`, a private field declared after the public one.
    this.made$ = this.made.asObservable();
  }

  /** @returns When the last backup was made, on any device, or `null` for never. */
  public lastMade(): Observable<string | null> {
    return this.store.read(BACKUPS_STATE_PATH).pipe(
      map((fields) => {
        const lastAt = new Map(Object.entries(fields ?? {})).get('lastAt');
        return typeof lastAt === 'string' ? lastAt : null;
      }),
    );
  }

  /** @returns The backup this browser keeps, or `null` when there's none (or it's unreadable). */
  public browserCopy(): IBackup | null {
    const result = checkBackup(this.deviceStore.get(BROWSER_BACKUP_KEY) ?? '');
    return 'backup' in result ? result.backup : null;
  }

  /**
   * Reads everything, downloads it as a file, keeps a copy in this browser and records the date.
   * @param withLeads Whether to add the leads (0018 D6). Such a file is only downloaded: customers'
   *   details shouldn't sit in the browser's storage.
   * @returns The backup made.
   */
  public make(withLeads = false): Observable<IBackupMade> {
    return this.build(withLeads).pipe(
      map((backup) => ({ backup, text: JSON.stringify(backup, null, JSON_INDENT) })),
      tap(({ backup, text }) => {
        this.files.download(backupFileName(backup.createdAt), text, BACKUP_MEDIA_TYPE);
      }),
      // switchMap: one record per backup, written once the file is saved.
      switchMap(({ backup, text }) => {
        const keptInBrowser = !withLeads && this.keep(text);
        return this.record(backup.createdAt).pipe(
          map(() => ({ createdAt: backup.createdAt, keptInBrowser, withLeads })),
        );
      }),
      tap((made) => {
        this.made.next(made);
      }),
    );
  }

  /**
   * Puts a backup's content into the drafts, for Review & publish, its photo descriptions back
   * into the library, and its saved themes back beside any saved since (0027 D6). Photos deleted
   * since are left out: their files are gone for good.
   * @param backup A checked backup.
   * @returns Completes once both are saved.
   */
  public restore(backup: IBackup): Observable<void> {
    const entries = Object.entries(backup.documents);
    const content = new Map(entries.filter(([path]) => isContentPath(path)));
    const library = entries.filter(([path]) => path.startsWith(`${MEDIA_COLLECTION}/`));
    const themes = entries.filter(([path]) => path.startsWith(`${SAVED_THEMES_COLLECTION}/`));
    return this.drafts.saveAll(content).pipe(
      concatMap(() => this.restoreLibrary(library)),
      concatMap(() => this.restoreSavedThemes(themes)),
    );
  }

  private build(withLeads: boolean): Observable<IBackup> {
    const paths = Object.values(ContentPath);
    // forkJoin: every document, the library, the leads and the saved themes are independent reads,
    // all needed for one file.
    return forkJoin([
      forkJoin(paths.map((path) => this.drafts.live(path))),
      this.store.readAll(MEDIA_COLLECTION),
      withLeads ? this.store.readAll(LEADS_COLLECTION) : of(new Map<string, DocumentFields>()),
      this.store.readAll(SAVED_THEMES_COLLECTION),
    ]).pipe(
      map(([content, library, leads, themes]) => ({
        format: BACKUP_FORMAT,
        site: BACKUP_SITE,
        version: this.releaseNotes.current()?.version ?? '',
        createdAt: this.clock.now().toISOString(),
        documents: Object.fromEntries([
          ...paths.flatMap((path, index) => {
            const fields = content.at(index);
            return fields ? [[path, fields] as const] : [];
          }),
          ...[...library].map(([id, fields]) => [`${MEDIA_COLLECTION}/${id}`, fields] as const),
          ...[...leads].map(
            ([id, fields]) => [`${LEADS_COLLECTION}/${id}`, readable(fields)] as const,
          ),
          ...[...themes].map(
            ([id, fields]) => [`${SAVED_THEMES_COLLECTION}/${id}`, fields] as const,
          ),
        ]),
      })),
    );
  }

  /** Keeps the latest backup only; a stale one is removed when the new one doesn't fit. */
  private keep(text: string): boolean {
    const kept =
      text.length <= BROWSER_BACKUP_MAX_CHARS && this.deviceStore.set(BROWSER_BACKUP_KEY, text);
    if (!kept) {
      this.deviceStore.remove(BROWSER_BACKUP_KEY);
    }
    return kept;
  }

  private record(createdAt: string): Observable<void> {
    return this.store
      .commit([
        { kind: DocumentWriteKind.Set, path: BACKUPS_STATE_PATH, fields: { lastAt: createdAt } },
      ])
      .pipe(
        // The file is already saved; a missed date only means the reminder shows sooner.
        catchError(() => of(undefined)),
      );
  }

  private restoreLibrary(
    entries: readonly (readonly [string, DocumentFields])[],
  ): Observable<void> {
    return this.store.readAll(MEDIA_COLLECTION).pipe(
      map((current) =>
        entries
          .filter(([path]) => current.has(path.slice(MEDIA_COLLECTION.length + 1)))
          .map(([path, fields]): DocumentWrite => ({ kind: DocumentWriteKind.Set, path, fields })),
      ),
      // switchMap: one commit, built from the library as it is now.
      switchMap((writes) => (writes.length === 0 ? of(undefined) : this.store.commit(writes))),
    );
  }

  /** Each saved theme back by its id; one that isn't a saved theme is left out, as the rules would. */
  private restoreSavedThemes(
    entries: readonly (readonly [string, DocumentFields])[],
  ): Observable<void> {
    const writes = entries.flatMap(([path, fields]): DocumentWrite[] => {
      const theme = SavedTheme.from(path.slice(SAVED_THEMES_COLLECTION.length + 1), fields);
      return theme
        ? [{ kind: DocumentWriteKind.Set, path, fields: { ...theme.toDocument() } }]
        : [];
    });
    return writes.length === 0 ? of(undefined) : this.store.commit(writes);
  }
}
