import { Injectable, computed, inject, signal } from '@angular/core';
import { type Observable, combineLatest, tap } from 'rxjs';
import { ViewModel } from '@shared/base/view-model';
import { type IVideoCard } from '@shared/interfaces/i-video';
import { SiteConfigService } from '@shared/services/site-config.service';
import { VideosService } from '@shared/services/videos.service';
import { VideosPageModel } from '../models/videos-page.model';
import { VideosPageService } from '../services/videos-page.service';

/**
 * Loads the Videos page (its copy, the shared library and site config, in one pass) and owns
 * the category filter: the first match is featured, the rest fill the grid.
 */
@Injectable()
export class VideosPageViewModel extends ViewModel<VideosPageModel> {
  /** Selected chip; "All" until the visitor picks one. */
  public readonly category = computed(() => this.selected() ?? this.data()?.allLabel ?? '');
  public readonly featured = computed<IVideoCard | null>(() => this.matches()[0] ?? null);
  public readonly rest = computed(() => this.matches().slice(1));
  public readonly countLabel = computed(() => this.data()?.countLabel(this.matches().length) ?? '');

  private readonly pageService = inject(VideosPageService);
  private readonly videosService = inject(VideosService);
  private readonly siteConfigService = inject(SiteConfigService);
  private readonly selected = signal<string | null>(null);
  private readonly matches = computed(() => this.data()?.cardsIn(this.category()) ?? []);

  /** Shows only `category` ("All" shows everything). */
  public selectCategory(category: string): void {
    this.selected.set(category);
  }

  protected override attachViewHandler(): Observable<unknown> {
    // combineLatest: the page renders once, when its copy, the videos and site config are all in.
    return combineLatest([
      this.pageService.attachViewDataHandler(),
      this.videosService.getVideos(),
      this.siteConfigService.getSiteConfig(),
    ]).pipe(
      tap(([dto, videos, site]) => {
        this.setData(new VideosPageModel(dto, videos, site));
      }),
    );
  }
}
