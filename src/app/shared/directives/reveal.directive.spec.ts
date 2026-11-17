import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { APP_PREVIEW_FRAME } from '@core/tokens/app-preview.token';
import { REVEAL_RISE_PX, REVEAL_ROOT_MARGIN } from '@shared/constants/reveal.constants';
import {
  type FakeAnimation,
  type FakeObserver,
  stubAnimate,
  stubMatchMedia,
  stubObservers,
} from '@shared/testing/motion-stubs';
import { RevealDirective } from './reveal.directive';

@Component({
  imports: [RevealDirective],
  template: '<section appReveal></section>',
})
class HostComponent {}

describe('RevealDirective', () => {
  const below = window.innerHeight + 100;
  let animations: FakeAnimation[];
  let observers: FakeObserver[];
  let height: number;
  let top: number;

  beforeEach(() => {
    animations = stubAnimate();
    observers = stubObservers();
    stubMatchMedia(false);
    height = 300;
    top = below;
    // jsdom has no layout: each test says how tall the section is and where it sits.
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockImplementation(() => height);
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ top }) as DOMRect,
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function render(inEditor = false) {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_PREVIEW_FRAME, useValue: inEditor }],
    });
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    return fixture;
  }

  it('should hide a section below the screen by opacity alone, so links still land exactly', async () => {
    await render();

    expect(animations).toHaveLength(1);
    expect(animations[0]?.keyframes).toEqual([{ opacity: 0 }]);
    expect(observers.at(-1)?.options).toEqual({ rootMargin: REVEAL_ROOT_MARGIN });
  });

  it('should fade it in and rise when it scrolls into view', async () => {
    await render();
    const [hidden] = animations;

    observers.at(-1)?.fire(true);

    expect(animations[1]?.keyframes).toEqual([
      { opacity: 0, transform: `translateY(${String(REVEAL_RISE_PX)}px)` },
      { opacity: 1, transform: 'none' },
    ]);
    expect(hidden?.cancel).toHaveBeenCalled();
    expect(observers.at(-1)?.disconnect).toHaveBeenCalled();
  });

  it('should keep it hidden while it is still out of view', async () => {
    await render();

    observers.at(-1)?.fire(false);

    expect(animations).toHaveLength(1);
  });

  it('should leave a section on the first screen alone', async () => {
    top = 0;

    await render();

    expect(animations).toEqual([]);
  });

  it('should wait for content before deciding, since an empty section sits near the top', async () => {
    height = 0;
    await render();
    expect(animations).toEqual([]);

    height = 300;
    observers.at(-1)?.fire();

    expect(observers.at(-2)?.disconnect).toHaveBeenCalled();
    expect(animations[0]?.keyframes).toEqual([{ opacity: 0 }]);
  });

  it('should keep waiting while the section is still empty', async () => {
    height = 0;
    await render();

    observers.at(-1)?.fire();

    expect(animations).toEqual([]);
  });

  it('should not animate when the visitor asks for reduced motion', async () => {
    stubMatchMedia(true);

    await render();

    expect(animations).toEqual([]);
    expect(observers).toEqual([]);
  });

  it('should not animate inside the editor preview, which moves to sections itself', async () => {
    await render(true);

    expect(animations).toEqual([]);
  });

  it('should show everything in a browser without the observers', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);

    await render();

    expect(animations).toEqual([]);
  });

  it('should stop watching when destroyed', async () => {
    const fixture = await render();

    fixture.destroy();

    expect(observers.at(-1)?.disconnect).toHaveBeenCalled();
  });
});
