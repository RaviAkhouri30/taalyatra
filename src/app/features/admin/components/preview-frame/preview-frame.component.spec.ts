import { TestBed } from '@angular/core/testing';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { type FakeAnimation, stubAnimate, stubMatchMedia } from '@shared/testing/motion-stubs';
import { PreviewFrameComponent } from './preview-frame.component';

describe('PreviewFrameComponent', () => {
  /** Fires the stage-size observer on demand: jsdom has no layout. */
  let resized: () => void;
  let animations: FakeAnimation[];

  beforeEach(() => {
    animations = stubAnimate();
    stubMatchMedia(false);
    vi.stubGlobal(
      'ResizeObserver',
      class {
        public constructor(callback: () => void) {
          resized = callback;
        }

        public observe(): void {
          // The test decides when the size changes.
        }

        public disconnect(): void {
          // Nothing to release.
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function render() {
    const fixture = TestBed.createComponent(PreviewFrameComponent);
    const element = fixture.nativeElement as HTMLElement;
    const location = { replace: vi.fn(), pathname: '/', search: '?preview=1' };
    const scrollTo = vi.fn();
    const getElementById = vi.fn(() => ({ getBoundingClientRect: () => ({ top: 500 }) }));
    fixture.detectChanges();
    const iframe = element.querySelector('iframe')!;
    const site = {
      location,
      scrollY: 100,
      scrollTo,
      document: { getElementById, body: {} },
      performance: { now: () => 0 },
      ResizeObserver: class {
        public observe = vi.fn();
        public disconnect = vi.fn();
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as Window;
    Object.defineProperty(iframe, 'contentWindow', { value: site });
    return { fixture, element, iframe, location, getElementById, scrollTo };
  }

  /** Gives the stage a size, as when the preview is on screen beside the form. */
  function show(element: HTMLElement): void {
    Object.defineProperties(element.querySelector('.pf-stage')!, {
      clientWidth: { value: 640 },
      clientHeight: { value: 500 },
    });
    resized();
  }

  it('should frame the site in preview mode and link to the full preview of the section', () => {
    const { fixture, element, iframe } = render();
    fixture.componentRef.setInput('anchor', PageAnchor.Team);
    fixture.detectChanges();

    expect(iframe.getAttribute('src')).toBe('/?preview=1');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/?preview=1#team');
    expect(element.querySelector('a')?.getAttribute('rel')).toBe('noopener');
  });

  it('should stay hidden until the first load has jumped to the section being edited', () => {
    const { fixture, element, iframe, getElementById, scrollTo } = render();
    show(element);
    fixture.componentRef.setInput('anchor', PageAnchor.Team);
    fixture.detectChanges();
    expect(animations[0]?.keyframes).toEqual([{ opacity: 0 }]);
    expect(getElementById).not.toHaveBeenCalled();

    iframe.dispatchEvent(new Event('load'));

    expect(getElementById).toHaveBeenCalledWith(PageAnchor.Team);
    expect(scrollTo).toHaveBeenCalledWith({ top: 600, behavior: 'instant' });
    expect(animations.at(-1)?.keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
  });

  it('should fade out, jump and fade back in when the section changes', () => {
    const { fixture, element, iframe, getElementById } = render();
    show(element);
    iframe.dispatchEvent(new Event('load'));
    getElementById.mockClear();

    fixture.componentRef.setInput('anchor', PageAnchor.Contact);
    fixture.detectChanges();
    const fadeOut = animations.at(-1);
    expect(fadeOut?.keyframes).toEqual([{ opacity: 1 }, { opacity: 0 }]);
    expect(getElementById).not.toHaveBeenCalled();
    fadeOut?.finish();

    expect(getElementById).toHaveBeenCalledWith(PageAnchor.Contact);
    expect(animations.at(-1)?.keyframes).toEqual([{ opacity: 0 }, { opacity: 1 }]);
  });

  it('should jump without fading when the device asks for reduced motion', () => {
    stubMatchMedia(true);
    const { fixture, element, iframe, getElementById } = render();
    show(element);
    iframe.dispatchEvent(new Event('load'));
    const started = animations.length;

    fixture.componentRef.setInput('anchor', PageAnchor.Contact);
    fixture.detectChanges();

    expect(getElementById).toHaveBeenLastCalledWith(PageAnchor.Contact);
    expect(animations).toHaveLength(started);
  });

  it('should not move a hidden preview, which moves once it is shown', () => {
    const { fixture, iframe, getElementById } = render();
    iframe.dispatchEvent(new Event('load'));

    fixture.componentRef.setInput('anchor', PageAnchor.Contact);
    fixture.detectChanges();

    expect(getElementById).not.toHaveBeenCalled();
  });

  it('should hide and load the preview afresh after a save', () => {
    const { fixture, iframe, location } = render();
    iframe.dispatchEvent(new Event('load'));
    location.replace.mockClear();

    fixture.componentRef.setInput('version', 1);
    fixture.detectChanges();

    expect(location.replace).toHaveBeenCalledWith('/?preview=1&v=1');
    expect(animations.at(-1)?.keyframes).toEqual([{ opacity: 0 }]);
  });

  it('should hold a reload for a save made during the first load until it finishes', () => {
    const { fixture, iframe, location } = render();

    fixture.componentRef.setInput('version', 2);
    fixture.detectChanges();
    expect(location.replace).not.toHaveBeenCalled();
    iframe.dispatchEvent(new Event('load'));
    iframe.dispatchEvent(new Event('load'));

    const reloads = location.replace.mock.calls.filter(([url]) => String(url).includes('&v='));
    expect(reloads).toEqual([['/?preview=1&v=2']]);
  });

  describe('the frame', () => {
    async function sized(width: number, height: number) {
      const rendered = render();
      const stage = rendered.element.querySelector('.pf-stage')!;
      Object.defineProperties(stage, {
        clientWidth: { value: width },
        clientHeight: { value: height },
      });
      await rendered.fixture.whenStable();
      resized();
      await rendered.fixture.whenStable();
      return rendered;
    }

    it('should shrink the desktop site to fit the stage', async () => {
      const { iframe } = await sized(640, 500);

      expect(iframe.style.width).toBe('1280px');
      expect(iframe.style.height).toBe('1000px');
      expect(iframe.style.transform).toBe('scale(0.5)');
      expect(iframe.style.left).toBe('0px');
    });

    it('should centre the phone site, at full size, in a wider stage', async () => {
      const { fixture, element, iframe } = await sized(790, 500);

      element.querySelector<HTMLButtonElement>('[aria-label="Phone"]')?.click();
      await fixture.whenStable();

      expect(iframe.style.width).toBe('390px');
      expect(iframe.style.transform).toBe('scale(1)');
      expect(iframe.style.left).toBe('200px');
      expect(element.querySelector('[aria-label="Phone"]')?.getAttribute('aria-pressed')).toBe(
        'true',
      );
    });

    it('should go back to desktop when asked', async () => {
      const { fixture, element, iframe } = await sized(790, 500);
      element.querySelector<HTMLButtonElement>('[aria-label="Phone"]')?.click();
      await fixture.whenStable();

      element.querySelector<HTMLButtonElement>('[aria-label="Desktop"]')?.click();
      await fixture.whenStable();

      expect(iframe.style.width).toBe('1280px');
    });

    it('should move to the section again when a hidden preview is shown', async () => {
      const rendered = render();
      rendered.iframe.dispatchEvent(new Event('load'));
      rendered.getElementById.mockClear();
      const stage = rendered.element.querySelector('.pf-stage')!;
      Object.defineProperties(stage, {
        clientWidth: { value: 640 },
        clientHeight: { value: 500 },
      });
      await rendered.fixture.whenStable();

      resized();
      animations.at(-1)?.finish();

      expect(rendered.getElementById).toHaveBeenCalledWith(PageAnchor.Top);
    });

    it('should not divide by nothing while the stage is hidden', () => {
      const { iframe } = render();

      expect(iframe.style.transform).toBe('scale(1)');
    });

    it('should load afresh when refreshed, even with nothing saved', () => {
      const { element, location } = render();

      element.querySelector<HTMLButtonElement>('[aria-label="Refresh preview"]')?.click();

      expect(location.replace).toHaveBeenLastCalledWith('/?preview=1&v=0-1');
    });
  });
});
