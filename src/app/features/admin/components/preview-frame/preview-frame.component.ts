import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  type ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { PREVIEW_QUERY_PARAM } from '@core/tokens/app-preview.token';
import { IconComponent } from '@shared/components/icon/icon.component';
import { AppRoute } from '@shared/enums/app-route.enum';
import { IconName } from '@shared/enums/icon-name.enum';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { FrameFitDirective, type IFrameFit } from '../../directives/frame-fit.directive';

/** The widths the site is shown at, so it lays out as it does on each device. */
const DEVICE_WIDTH = { desktop: 1280, phone: 390 } as const;
type PreviewDevice = keyof typeof DEVICE_WIDTH;
const HALF = 0.5;

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
  imports: [FrameFitDirective, IconComponent],
  templateUrl: './preview-frame.component.html',
  styleUrl: './preview-frame.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewFrameComponent {
  /** Where to scroll. */
  public readonly anchor = input(PageAnchor.Top);
  /** Changes after every save, which reloads the frame. */
  public readonly version = input(0);

  protected readonly icons = IconName;
  /** Which device the site is shown as. */
  protected readonly device = signal<PreviewDevice>('desktop');
  /** The frame's fit: shrunk to the stage's width, and centred when it's narrower than the stage. */
  protected readonly fit = computed<IFrameFit>(() => {
    const width = DEVICE_WIDTH[this.device()];
    const { stageWidth, stageHeight } = this.stage();
    const scale = stageWidth > 0 ? Math.min(1, stageWidth / width) : 1;
    return {
      width,
      height: stageHeight / scale,
      scale,
      left: Math.max(0, (stageWidth - width * scale) * HALF),
    };
  });
  /** The full-page preview, for the "open in a new tab" link. */
  protected readonly fullUrl = computed(
    () => `${AppRoute.Home}?${PREVIEW_QUERY_PARAM}=1#${this.anchor()}`,
  );

  private readonly frame = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');
  private readonly stageElement = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly destroyRef = inject(DestroyRef);
  private readonly stage = signal({ stageWidth: 0, stageHeight: 0 });
  /** Counts refreshes, so a refresh is a fresh load even when nothing was saved. */
  private refreshes = 0;
  /** The site inside has loaded at least once, so its address can be changed. */
  private readonly loaded = signal(false);
  /** A save landed while the first load was still running: reload once it has finished. */
  private reloadPending = false;

  public constructor() {
    afterNextRender(() => {
      this.followStageSize();
    });
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

  /** @param device The device to show the site as. */
  protected show(device: PreviewDevice): void {
    this.device.set(device);
  }

  protected refresh(): void {
    this.refreshes += 1;
    this.reload();
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
    const version = String(untracked(this.version));
    const stamp = this.refreshes > 0 ? `${version}-${String(this.refreshes)}` : version;
    this.site()?.location.replace(
      `${AppRoute.Home}?${PREVIEW_QUERY_PARAM}=1&v=${stamp}#${untracked(this.anchor)}`,
    );
  }

  private followStageSize(): void {
    const stage = this.stageElement().nativeElement;
    const observer = new ResizeObserver(() => {
      this.stage.set({ stageWidth: stage.clientWidth, stageHeight: stage.clientHeight });
    });
    observer.observe(stage);
    this.destroyRef.onDestroy(() => {
      observer.disconnect();
    });
  }

  private site(): Window | null {
    return this.frame().nativeElement.contentWindow;
  }
}
