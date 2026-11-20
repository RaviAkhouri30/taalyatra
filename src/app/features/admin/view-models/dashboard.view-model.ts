import { Injectable, computed, inject } from '@angular/core';
import { type Observable, catchError, forkJoin, map, of, switchMap, take, tap } from 'rxjs';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { ContentPath } from '../models/content-path.enum';
import { DashboardModel } from '../models/dashboard.model';
import { type Permissions } from '../models/permissions.model';
import { ManagerArea } from '../models/manager-area.enum';
import { PlaceholderRule } from '../models/publish-rules';
import { type IReleaseSummary, summarizeRelease } from '../models/releases-page.model';
import { ALL_SECTIONS } from '../schemas/editor-tabs';
import { AccessService } from '../services/access.service';
import { ApprovalService } from '../services/approval.service';
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
  private readonly access = inject(AccessService);
  private readonly approvals = inject(ApprovalService);
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
    return this.access.permissions$.pipe(
      take(1),
      // switchMap: what's read depends on who is looking (0019).
      switchMap((permissions) => this.read(permissions)),
      tap((dashboard) => {
        this.setData(dashboard);
      }),
    );
  }

  private read(permissions: Permissions): Observable<DashboardModel> {
    const now = this.clock.now();
    // forkJoin: independent reads, all needed before the dashboard can be built.
    return forkJoin([
      this.drafts.drafts(),
      this.publishes.history(),
      forkJoin(SECTION_PATHS.map((path) => this.drafts.document(path))),
      // Before the 2.0.0 rules are live they're refused: nothing waits.
      this.approvals.requests().pipe(catchError(() => of([]))),
      ...this.extras(permissions),
    ]).pipe(
      map(([drafts, history, documents, requests, lastBackupAt, visits, leads]) => {
        const byPath = new Map(SECTION_PATHS.map((path, index) => [path, documents.at(index)]));
        const placeholders = new PlaceholderRule();
        return new DashboardModel({
          changeCount: [...drafts.keys()].filter((path) => permissions.canSeePath(path)).length,
          lastPublish: history[0] ?? null,
          siteConfig: byPath.get(ContentPath.SiteConfig) ?? null,
          visibility: byPath.get(ContentPath.SiteVisibility) ?? null,
          warnings: ALL_SECTIONS.filter((section) => permissions.canSeePath(section.path)).flatMap(
            (section) => placeholders.check(section, byPath.get(section.path) ?? {}),
          ),
          lastBackupAt,
          visits,
          leads,
          now,
          permissions,
          requests,
        });
      }),
    );
  }

  /**
   * The owner's reads (0019 decision 6), whose failure only means "not known": each card then
   * says so, nothing breaks. A manager's are skipped: the rules refuse them, and the cards are hidden.
   */
  /** Each area's read, made only when this account may use it (0022); else "not known". */
  private extras(
    permissions: Permissions,
  ): readonly [
    Observable<string | null>,
    Observable<IVisitHistory | null>,
    Observable<Lead[] | null>,
  ] {
    const when = <T>(area: ManagerArea, read: () => Observable<T>): Observable<T | null> =>
      // A failed read means "not known": the backup card then suggests one, which is harmless.
      permissions.canUse(area) ? read().pipe(catchError(() => of(null))) : of(null);
    return [
      when(ManagerArea.Backups, () => this.backups.lastMade()),
      when(ManagerArea.Visits, () => this.visits.load()),
      when(ManagerArea.Leads, () => this.leads.leads()),
    ] as const;
  }
}
