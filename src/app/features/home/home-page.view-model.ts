import { Injectable, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { type Observable, filter, switchMap, tap } from 'rxjs';
import { APP_PREVIEW, APP_PREVIEW_FRAME } from '@core/tokens/app-preview.token';
import { ViewModel } from '@shared/base/view-model';
import { HomeSection } from '@shared/enums/home-section.enum';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { SiteVisibilityService } from '@shared/services/site-visibility.service';
import { SectionHoldService } from './section-hold.service';
import { type SectionFolds, sectionFolds } from './section-folds';

/** Which home sections and home widgets to render. */
export type HomeShown = Readonly<Record<HomeSection, boolean>> & {
  readonly intro: boolean;
  readonly assistant: boolean;
};

/**
 * Decides which home sections render, from the owner's switches (ADR-0015). Until the switches
 * arrive nothing optional renders, so a hidden section never flashes in and never reads its data.
 * It also keeps a linked section in place while the sections above it arrive (0013).
 */
@Injectable()
export class HomePageViewModel extends ViewModel<SiteVisibility> {
  /** Per section and home widget: whether to render it. */
  public readonly shown = computed<HomeShown>(() => {
    const visibility = this.data();
    const sections = Object.fromEntries(
      Object.values(HomeSection).map((section) => [
        section,
        visibility?.isSectionVisible(section) ?? false,
      ]),
    ) as Record<HomeSection, boolean>;
    return {
      ...sections,
      // The editor's preview reloads after every save; replaying the intro each time would hide
      // the change being checked.
      intro: !this.preview && (visibility?.isWidgetVisible(SiteWidget.Intro) ?? false),
      assistant: !this.previewFrame && (visibility?.isWidgetVisible(SiteWidget.Assistant) ?? false),
    };
  });

  /** How each section folds: the owner's choice or the default (0015 V15). */
  public readonly folds = computed<SectionFolds>(() =>
    sectionFolds(this.data() ?? SiteVisibility.allVisible),
  );

  private readonly visibilityService = inject(SiteVisibilityService);
  private readonly preview = inject(APP_PREVIEW);
  private readonly previewFrame = inject(APP_PREVIEW_FRAME);
  private readonly route = inject(ActivatedRoute);
  private readonly sectionHold = inject(SectionHoldService);

  protected override attachCommandHandler(): Observable<unknown> {
    // switchMap: following a new link lets go of the section the last one was holding.
    return this.route.fragment.pipe(
      filter((fragment): fragment is string => fragment !== null),
      switchMap((fragment) => this.sectionHold.hold(fragment)),
    );
  }

  protected override attachViewHandler(): Observable<unknown> {
    return this.visibilityService.getVisibility().pipe(
      tap((visibility) => {
        this.setData(visibility);
      }),
    );
  }
}
