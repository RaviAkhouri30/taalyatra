import { type FakeAnimation, stubAnimate } from '@shared/testing/motion-stubs';
import { PREVIEW_SETTLE_MS } from '../../models/editor-nav.constants';
import { PreviewScroller } from './preview-scroller';

describe('PreviewScroller', () => {
  let animations: FakeAnimation[];

  beforeEach(() => {
    animations = stubAnimate();
  });

  /** A frame whose site has a section, a clock and a resize observer the test controls. */
  function frame() {
    const scrollTo = vi.fn();
    let now = 0;
    let resized = (): void => undefined;
    const observer = { observe: vi.fn(), disconnect: vi.fn() };
    const listeners = new Map<string, () => void>();
    // The sections the site has rendered so far.
    const rendered = new Set(['shows']);
    const site = {
      scrollY: 100,
      scrollTo,
      document: {
        getElementById: vi.fn((id: string) =>
          rendered.has(id) ? { getBoundingClientRect: () => ({ top: 500 }) } : null,
        ),
        body: {},
      },
      performance: { now: () => now },
      ResizeObserver: class {
        public observe = observer.observe;
        public disconnect = observer.disconnect;

        public constructor(callback: () => void) {
          resized = callback;
        }
      },
      addEventListener: vi.fn((type: string, listener: () => void) =>
        listeners.set(type, listener),
      ),
      removeEventListener: vi.fn(),
    };
    const element = document.createElement('iframe');
    Object.defineProperty(element, 'contentWindow', { value: site });
    return {
      element,
      rendered,
      scrollTo,
      observer,
      listeners,
      resize: (at: number) => {
        now = at;
        resized();
      },
    };
  }

  it('should keep the section in place while the page above it grows', () => {
    const { element, scrollTo, resize } = frame();
    new PreviewScroller(element, false).goTo('shows');
    scrollTo.mockClear();

    resize(1000);

    expect(scrollTo).toHaveBeenCalledWith({ top: 600, behavior: 'instant' });
  });

  it('should stop keeping it in place once the page has settled', () => {
    const { element, scrollTo, observer, resize } = frame();
    new PreviewScroller(element, false).goTo('shows');
    scrollTo.mockClear();

    resize(PREVIEW_SETTLE_MS + 1);

    expect(scrollTo).not.toHaveBeenCalled();
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('should let the owner scroll the preview themselves', () => {
    const { element, observer, listeners } = frame();
    new PreviewScroller(element, false).goTo('shows');

    listeners.get('wheel')?.();

    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('should stop an older move when a newer one starts', () => {
    const { element, observer } = frame();
    const scroller = new PreviewScroller(element, true);
    scroller.hide();
    scroller.goTo('shows');

    scroller.goTo('team');

    expect(observer.disconnect).toHaveBeenCalled();
    expect(animations.at(-2)?.cancel).toHaveBeenCalled();
  });

  it('should stop everything when disposed', () => {
    const { element, observer } = frame();
    const scroller = new PreviewScroller(element, true);
    scroller.hide();
    scroller.goTo('shows');

    scroller.dispose();

    expect(observer.disconnect).toHaveBeenCalled();
    expect(animations.at(-1)?.cancel).toHaveBeenCalled();
  });

  it('should wait while the section has not rendered yet', () => {
    const { element, scrollTo } = frame();

    new PreviewScroller(element, false).goTo('faq');

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('should go to the page’s own top when the page has no top section', () => {
    const { element, scrollTo } = frame();

    new PreviewScroller(element, false).goTo('top');

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
  });

  it('should do nothing when the frame has no site yet', () => {
    const element = document.createElement('iframe');
    Object.defineProperty(element, 'contentWindow', { value: null });

    expect(() => {
      new PreviewScroller(element, false).goTo('shows');
    }).not.toThrow();
  });

  it('should stay hidden while the section loads, then fade in once it appears', () => {
    const { element, rendered, resize } = frame();
    const scroller = new PreviewScroller(element, true);
    scroller.hide();

    scroller.goTo('faq');
    const waiting = animations.at(-1);
    expect(waiting?.keyframes.at(-1)).toEqual({ opacity: 1 });
    expect(waiting?.options.duration).toBe(PREVIEW_SETTLE_MS);

    rendered.add('faq');
    resize(500);

    expect(animations.at(-1)?.keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(waiting?.cancel).toHaveBeenCalled();
  });

  it('should not flash the page when moved again while waiting', () => {
    const { element } = frame();
    const scroller = new PreviewScroller(element, true);
    scroller.hide();
    scroller.goTo('faq');
    const started = animations.length;

    scroller.goTo('shows');

    // Straight to the fade-in: no fade-out from full opacity in between.
    expect(animations.slice(started).map((animation) => animation.keyframes)).toEqual([
      [{ opacity: 0 }, { opacity: 1 }],
    ]);
  });
});
