import { Injectable, computed, inject } from '@angular/core';
import { type Observable, forkJoin, map, tap } from 'rxjs';
import { CLOCK } from '@core/tokens/clock.token';
import { ViewModel } from '@shared/base/view-model';
import { ContentPath } from '../models/content-path.enum';
import { DashboardModel } from '../models/dashboard.model';
import { PlaceholderRule } from '../models/publish-rules';
import { ALL_SECTIONS } from '../schemas/editor-tabs';
import { DraftService } from '../services/draft.service';
import { PublishService } from '../services/publish.service';
import { EditorLayoutViewModel } from './editor-layout.view-model';

/** The editor's dashboard: drafts, offer, visibility, last publish and leftover placeholders. */
@Injectable()
export class DashboardViewModel extends ViewModel<DashboardModel> {
  /** The welcome copy, from the layout's page copy (read once for the whole editor). */
  public readonly copy = computed(() => this.layout.data()?.home ?? null);

  private readonly layout = inject(EditorLayoutViewModel);
  private readonly drafts = inject(DraftService);
  private readonly publishes = inject(PublishService);
  private readonly clock = inject(CLOCK);

  protected override attachViewHandler(): Observable<unknown> {
    const paths = [...new Set(ALL_SECTIONS.map((section) => section.path))];
    const now = this.clock.now();
    // forkJoin: independent reads, all needed before the dashboard can be built.
    return forkJoin([
      this.drafts.drafts(),
      this.publishes.history(),
      forkJoin(paths.map((path) => this.drafts.document(path))),
    ]).pipe(
      map(([drafts, history, documents]) => {
        const byPath = new Map(paths.map((path, index) => [path, documents.at(index) ?? null]));
        const placeholders = new PlaceholderRule();
        return new DashboardModel({
          changeCount: drafts.size,
          lastPublish: history[0] ?? null,
          siteConfig: byPath.get(ContentPath.SiteConfig) ?? null,
          visibility: byPath.get(ContentPath.SiteVisibility) ?? null,
          warnings: ALL_SECTIONS.flatMap((section) =>
            placeholders.check(section, byPath.get(section.path) ?? {}),
          ),
          now,
        });
      }),
      tap((dashboard) => {
        this.setData(dashboard);
      }),
    );
  }
}
