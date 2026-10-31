import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  computed,
  effect,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { PREVIEW_QUERY_PARAM } from '@core/tokens/app-preview.token';
import { AppRoute } from '@shared/enums/app-route.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';

/**
 * The live preview beside the editor (0008 D7): the real site in preview mode. It scrolls to the
 * section being edited and reloads after each save (a new `version`).
 *
 * The frame's address is a fixed attribute in the template, and the component only changes the
 * hash or reloads it. A bound `src` would need Angular's sanitizer bypassed; this needs nothing
 * trusted, and scrolling doesn't reload the site.
 */
@Component({
  selector: 'app-preview-frame',
  templateUrl: './preview-frame.component.html',
  styleUrl: './preview-frame.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewFrameComponent {
  /** Where to scroll. */
  public readonly anchor = input(PageAnchor.Top);
  /** Changes after every save, which reloads the frame. */
  public readonly version = input(0);

  /** The full-page preview, for the "open in a new tab" link. */
  protected readonly fullUrl = computed(
    () => `${AppRoute.Home}?${PREVIEW_QUERY_PARAM}=1#${this.anchor()}`,
  );

  private readonly frame = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');
  /** The site inside has loaded at least once, so its address can be changed. */
  private readonly loaded = signal(false);
  /** A save landed while the first load was still running: reload once it has finished. */
  private reloadPending = false;

  public constructor() {
    effect(() => {
      const anchor = this.anchor();
      const location = this.loaded() ? this.site()?.location : undefined;
      // Only the hash changes: the site scrolls without reloading, and no history entry is added.
      location?.replace(`${location.pathname}${location.search}#${anchor}`);
    });
    effect(() => {
      if (this.version() === 0) {
        return;
      }
      // Reloading a frame that is still loading does nothing, and that load may have read the
      // drafts before this save: wait for it, then reload.
      if (untracked(this.loaded)) {
        this.reload();
      } else {
        this.reloadPending = true;
      }
    });
  }

  /** The site has loaded: from now on, follow the section being edited. */
  protected onLoad(): void {
    this.loaded.set(true);
    if (this.reloadPending) {
      this.reloadPending = false;
      this.reload();
    }
  }

  /**
   * Loads the preview again, at the section being edited. Not `location.reload()`: the site's
   * router may have dropped `?preview` from the address, and preview mode is read at startup. A
   * new `v` makes it a fresh load even when only the hash would differ.
   */
  private reload(): void {
    this.site()?.location.replace(
      `${AppRoute.Home}?${PREVIEW_QUERY_PARAM}=1&v=${String(untracked(this.version))}#${untracked(this.anchor)}`,
    );
  }

  private site(): Window | null {
    return this.frame().nativeElement.contentWindow;
  }
}
