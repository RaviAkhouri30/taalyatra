import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { AppRoute } from '@shared/enums/app-route.enum';

/** Preview pages show unpublished content, so search engines must never keep them. */
const NO_INDEX = { name: 'robots', content: 'noindex, nofollow' };

/**
 * Tells the owner they are looking at unpublished changes (`?preview`). Its links reload the
 * page, because preview mode is chosen once per visit.
 */
@Component({
  selector: 'app-preview-banner',
  templateUrl: './preview-banner.component.html',
  styleUrl: './preview-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status' },
})
export class PreviewBannerComponent {
  protected readonly editorUrl = AppRoute.Admin;
  protected readonly liveUrl = AppRoute.Home;

  public constructor() {
    const meta = inject(Meta);
    meta.updateTag(NO_INDEX);
    inject(DestroyRef).onDestroy(() => {
      meta.removeTag(`name="${NO_INDEX.name}"`);
    });
  }
}
