import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { SECTION_HOLD_MS } from '@shared/constants/reveal.constants';
import { type FakeObserver, stubObservers } from '@shared/testing/motion-stubs';
import { SectionHoldService } from './section-hold.service';

describe('SectionHoldService', () => {
  let observers: FakeObserver[];
  const scrollToAnchor = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    observers = stubObservers();
    scrollToAnchor.mockReset();
    document.body.innerHTML = '<section id="contact"></section>';
    TestBed.configureTestingModule({
      providers: [{ provide: ViewportScroller, useValue: { scrollToAnchor } }],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  function hold(id = 'contact') {
    const done = vi.fn();
    const subscription = TestBed.inject(SectionHoldService).hold(id).subscribe({ complete: done });
    return { done, subscription, observer: observers.at(-1) };
  }

  it('should put the section back at the top each time the page above it grows', () => {
    const { observer } = hold();

    observer?.fire();
    observer?.fire();

    expect(scrollToAnchor).toHaveBeenCalledTimes(2);
    expect(scrollToAnchor).toHaveBeenCalledWith('contact');
  });

  it('should wait while the section has not rendered yet', () => {
    const { observer } = hold('faq');

    observer?.fire();

    expect(scrollToAnchor).not.toHaveBeenCalled();
  });

  it('should let go once the page has had time to settle', () => {
    const { done, observer } = hold();

    vi.advanceTimersByTime(SECTION_HOLD_MS);

    expect(done).toHaveBeenCalled();
    expect(observer?.disconnect).toHaveBeenCalled();
  });

  it('should let go as soon as the visitor scrolls', () => {
    const { done, observer } = hold();

    window.dispatchEvent(new Event('wheel'));

    expect(done).toHaveBeenCalled();
    expect(observer?.disconnect).toHaveBeenCalled();
  });

  it('should hold nothing in a browser without the resize observer', () => {
    vi.stubGlobal('ResizeObserver', undefined);

    const { done } = hold();

    expect(done).toHaveBeenCalled();
  });
});
