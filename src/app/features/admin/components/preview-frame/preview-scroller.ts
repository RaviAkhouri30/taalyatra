import {
  PREVIEW_FADE_IN_MS,
  PREVIEW_FADE_OUT_MS,
  PREVIEW_SETTLE_MS,
} from '../../models/editor-nav.constants';

/** What the owner does in the preview that means "leave the scroll position to me". */
const TAKE_OVER_EVENTS = ['wheel', 'touchstart', 'keydown', 'mousedown'] as const;

/**
 * Moves the preview to a section without a long animated scroll: it fades out, jumps, and fades
 * back in. Then it keeps the section in place while the site settles, because live sections
 * arrive one by one and each one above the target pushes it down.
 *
 * The frame shows this site, so its document is reachable (same origin).
 */
export class PreviewScroller {
  private fade: Animation | null = null;
  private stopPinning: (() => void) | null = null;

  /**
   * @param frame The preview's frame.
   * @param animate Whether to fade; `false` when the owner's device asks for reduced motion.
   */
  public constructor(
    private readonly frame: HTMLIFrameElement,
    private readonly animate: boolean,
  ) {}

  /** Hides the frame at once, before it reloads, so the owner never sees the page's top flash by. */
  public hide(): void {
    this.fade?.cancel();
    this.fade = this.frame.animate([{ opacity: 0 }], { duration: 0, fill: 'forwards' });
  }

  /**
   * Shows `anchor`: fades out (unless already hidden), jumps, fades in, then pins it.
   * @param anchor The section's element id in the site.
   */
  public goTo(anchor: string): void {
    this.stopPinning?.();
    if (!this.animate) {
      this.fade?.cancel();
      this.arrive(anchor);
      return;
    }
    if (this.fade?.effect?.getComputedTiming().progress === 1) {
      this.arrive(anchor);
      return;
    }
    // A fade still running belongs to an older move; cancelling it also drops its 'finish' step.
    this.fade?.cancel();
    const out = this.frame.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: PREVIEW_FADE_OUT_MS,
      easing: 'ease-in',
      fill: 'forwards',
    });
    this.fade = out;
    out.addEventListener(
      'finish',
      () => {
        this.arrive(anchor);
      },
      { once: true },
    );
  }

  /** Stops pinning and fading; for when the preview is destroyed. */
  public dispose(): void {
    this.stopPinning?.();
    this.fade?.cancel();
  }

  /** Jumps while hidden, fades back in, and keeps the section in place. */
  private arrive(anchor: string): void {
    this.jump(anchor);
    const hidden = this.fade;
    this.fade = this.animate
      ? this.frame.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: PREVIEW_FADE_IN_MS,
          easing: 'ease-out',
        })
      : null;
    // Cancelled after the fade-in starts, so the frame never shows at full opacity in between.
    hidden?.cancel();
    this.pin(anchor);
  }

  private jump(anchor: string): void {
    const site = this.site();
    const section = site?.document.getElementById(anchor);
    if (!site || !section) {
      return;
    }
    // The site's own window only: `scrollIntoView` would also scroll the editor's panels that
    // hold the frame. 'instant': never an animated scroll, whatever the site's scroll behaviour.
    site.scrollTo({ top: section.getBoundingClientRect().top + site.scrollY, behavior: 'instant' });
  }

  /**
   * Re-jumps whenever the page's height changes, until it settles or the owner scrolls the preview.
   * A section not rendered yet is found as soon as it appears.
   */
  private pin(anchor: string): void {
    const site = this.site();
    if (site === null) {
      return;
    }
    const deadline = site.performance.now() + PREVIEW_SETTLE_MS;
    // The frame's own ResizeObserver: an observer only watches elements in its own document.
    const { ResizeObserver: SiteResizeObserver } = site as Window & typeof globalThis;
    const observer = new SiteResizeObserver(() => {
      if (site.performance.now() > deadline) {
        stop();
        return;
      }
      this.jump(anchor);
    });
    const stop = (): void => {
      observer.disconnect();
      TAKE_OVER_EVENTS.forEach((type) => {
        site.removeEventListener(type, stop);
      });
      this.stopPinning = null;
    };
    observer.observe(site.document.body);
    TAKE_OVER_EVENTS.forEach((type) => {
      site.addEventListener(type, stop, { passive: true });
    });
    this.stopPinning = stop;
  }

  private site(): Window | null {
    return this.frame.contentWindow;
  }
}
