import { Injectable, computed, inject } from '@angular/core';
import { type Observable, tap } from 'rxjs';
import { APP_PREVIEW } from '@core/tokens/app-preview.token';
import { ViewModel } from '@shared/base/view-model';
import { HomeSection } from '@shared/enums/home-section.enum';
import { SiteWidget } from '@shared/enums/site-widget.enum';
import { type SiteVisibility } from '@shared/models/site-visibility.model';
import { SiteVisibilityService } from '@shared/services/site-visibility.service';

/** Which home sections and home widgets to render. */
export type HomeShown = Readonly<Record<HomeSection, boolean>> & {
  readonly intro: boolean;
  readonly assistant: boolean;
};

/**
 * Decides which home sections render, from the owner's switches (ADR-0015). Until the switches
 * arrive nothing optional renders, so a hidden section never flashes in and never reads its data.
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
      assistant: visibility?.isWidgetVisible(SiteWidget.Assistant) ?? false,
    };
  });

  private readonly visibilityService = inject(SiteVisibilityService);
  private readonly preview = inject(APP_PREVIEW);

  protected override attachViewHandler(): Observable<unknown> {
    return this.visibilityService.getVisibility().pipe(
      tap((visibility) => {
        this.setData(visibility);
      }),
    );
  }
}
