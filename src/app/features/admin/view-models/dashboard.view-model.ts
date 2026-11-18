import { Injectable, computed, inject } from '@angular/core';
import { type Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { ContentPath } from '../models/content-path.enum';
import { DashboardModel } from '../models/dashboard.model';
import { PlaceholderRule } from '../models/publish-rules';
import { type IReleaseSummary, summarizeRelease } from '../models/releases-page.model';
import { ALL_SECTIONS } from '../schemas/editor-tabs';
import { BackupService } from '../services/backup.service';
import { DraftService } from '../services/draft.service';
import { LeadsService } from '../services/leads.service';
import { PublishService } from '../services/publish.service';
import { ReleaseNotesService } from '../services/release-notes.service';
import { type IVisitHistory, VisitsService } from '../services/visits.service';
import { type Lead } from '../models/lead.model';
import { EditorLayoutViewModel } from './editor-layout.view-model';

/** Every document the editor's sections live in, once each. */
const SECTION_PATHS = [...new Set(ALL_SECTIONS.map((section) => section.path))];

/**
 * The editor's dashboard: drafts, offer, visibility, last publish, backups, what's new and
 * leftover placeholders.
 */
@Injectable()
export class DashboardViewModel extends ViewModel<DashboardModel> {
  /** The welcome copy, from the layout's page copy (read once for the whole editor). */
  public readonly copy = computed(() => this.layout.data()?.home ?? null);
  /** The newest release in brief (0016 V1); bundled, so known at once. */
  public readonly release: IReleaseSummary | null;

  private readonly layout = inject(EditorLayoutViewModel);
  private readonly drafts = inject(DraftService);
  private readonly publishes = inject(PublishService);
  private readonly backups = inject(BackupService);
  private readonly visits = inject(VisitsService);
  private readonly leads = inject(LeadsService);
  private readonly clock = inject(CLOCK);

  public constructor() {
    super();
    const current = inject(ReleaseNotesService).current();
    this.release = current ? summarizeRelease(current) : null;
  }

  protected override attachViewHandler(): Observable<unknown> {
    const now = this.clock.now();
    // forkJoin: independent reads, all needed before the dashboard can be built.
    return forkJoin([
      this.drafts.drafts(),
      this.publishes.history(),
      forkJoin(SECTION_PATHS.map((path) => this.drafts.document(path))),
      ...this.extras(),
    ]).pipe(
      map(([drafts, history, documents, lastBackupAt, visits, leads]) => {
        const byPath = new Map(SECTION_PATHS.map((path, index) => [path, documents.at(index)]));
        const placeholders = new PlaceholderRule();
        return new DashboardModel({
          changeCount: drafts.size,
          lastPublish: history[0] ?? null,
          siteConfig: byPath.get(ContentPath.SiteConfig) ?? null,
          visibility: byPath.get(ContentPath.SiteVisibility) ?? null,
          warnings: ALL_SECTIONS.flatMap((section) =>
            placeholders.check(section, byPath.get(section.path) ?? {}),
          ),
          lastBackupAt,
          visits,
          leads,
          now,
        });
      }),
      tap((dashboard) => {
        this.setData(dashboard);
      }),
    );
  }

  /** Reads whose failure only means "not known": each card then says so, nothing breaks. */
  private extras(): readonly [
    Observable<string | null>,
    Observable<IVisitHistory | null>,
    Observable<Lead[] | null>,
  ] {
    return [
      // A failed read means "not known": the card then suggests a backup, which is harmless.
      this.backups.lastMade().pipe(catchError(() => of(null))),
      this.visits.load().pipe(catchError(() => of(null))),
      this.leads.leads().pipe(catchError(() => of(null))),
    ] as const;
  }
}
