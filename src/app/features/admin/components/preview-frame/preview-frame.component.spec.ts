import { TestBed } from '@angular/core/testing';
import { PageAnchor } from '@shared/enums/page-anchor.enum';
import { PreviewFrameComponent } from './preview-frame.component';

describe('PreviewFrameComponent', () => {
  /** Fires the stage-size observer on demand: jsdom has no layout. */
  let resized: () => void;

  beforeEach(() => {
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
    fixture.detectChanges();
    const iframe = element.querySelector('iframe')!;
    const site = { location } as unknown as Window;
    Object.defineProperty(iframe, 'contentWindow', { value: site });
    return { fixture, element, iframe, location };
  }

  it('should frame the site in preview mode and link to the full preview of the section', () => {
    const { fixture, element, iframe } = render();
    fixture.componentRef.setInput('anchor', PageAnchor.Team);
    fixture.detectChanges();

    expect(iframe.getAttribute('src')).toBe('/?preview=1');
    expect(element.querySelector('a')?.getAttribute('href')).toBe('/?preview=1#team');
    expect(element.querySelector('a')?.getAttribute('rel')).toBe('noopener');
  });

  it('should scroll the site to the section being edited once it has loaded', () => {
    const { fixture, iframe, location } = render();
    fixture.componentRef.setInput('anchor', PageAnchor.Team);
    fixture.detectChanges();
    expect(location.replace).not.toHaveBeenCalled();

    iframe.dispatchEvent(new Event('load'));
    fixture.detectChanges();

    expect(location.replace).toHaveBeenCalledWith('/?preview=1#team');
  });

  it('should load the preview afresh after a save, at the section being edited', () => {
    const { fixture, iframe, location } = render();
    iframe.dispatchEvent(new Event('load'));
    location.replace.mockClear();

    fixture.componentRef.setInput('version', 1);
    fixture.detectChanges();

    expect(location.replace).toHaveBeenCalledWith('/?preview=1&v=1#top');
  });

  it('should hold a reload for a save made during the first load until it finishes', () => {
    const { fixture, iframe, location } = render();

    fixture.componentRef.setInput('version', 2);
    fixture.detectChanges();
    expect(location.replace).not.toHaveBeenCalled();
    iframe.dispatchEvent(new Event('load'));
    iframe.dispatchEvent(new Event('load'));

    const reloads = location.replace.mock.calls.filter(([url]) => String(url).includes('&v='));
    expect(reloads).toEqual([['/?preview=1&v=2#top']]);
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

    it('should not divide by nothing while the stage is hidden', () => {
      const { iframe } = render();

      expect(iframe.style.transform).toBe('scale(1)');
    });

    it('should load afresh when refreshed, even with nothing saved', () => {
      const { element, location } = render();

      element.querySelector<HTMLButtonElement>('[aria-label="Refresh preview"]')?.click();

      expect(location.replace).toHaveBeenLastCalledWith('/?preview=1&v=0-1#top');
    });
  });
});
