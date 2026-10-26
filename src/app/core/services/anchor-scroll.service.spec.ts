import { ViewportScroller } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router, Scroll, type Event } from '@angular/router';
import { Subject } from 'rxjs';
import { AnchorScrollService } from './anchor-scroll.service';

describe('AnchorScrollService', () => {
  const events = new Subject<Event>();
  const scrollToAnchor = vi.fn();

  function setUp(): AnchorScrollService {
    scrollToAnchor.mockReset();
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: { events } },
        { provide: ViewportScroller, useValue: { scrollToAnchor } },
      ],
    });
    return TestBed.inject(AnchorScrollService);
  }

  function scrollEvent(anchor: string | null): Scroll {
    return new Scroll(new NavigationEnd(1, '/', '/'), null, anchor);
  }

  function addSection(id: string): HTMLElement {
    const section = document.createElement('section');
    section.id = id;
    document.body.append(section);
    return section;
  }

  afterEach(() => {
    document.body.replaceChildren();
    vi.useRealTimers();
  });

  it('should scroll to a section that is already rendered', async () => {
    const subscription = setUp().attachAnchorScrolling().subscribe();
    addSection('contact');

    events.next(scrollEvent('contact'));

    await vi.waitFor(() => {
      expect(scrollToAnchor).toHaveBeenCalledWith('contact');
    });
    subscription.unsubscribe();
  });

  it('should wait for a section that renders after navigation', async () => {
    const subscription = setUp().attachAnchorScrolling().subscribe();

    events.next(scrollEvent('faq'));
    expect(scrollToAnchor).not.toHaveBeenCalled();
    addSection('faq');

    await vi.waitFor(() => {
      expect(scrollToAnchor).toHaveBeenCalledWith('faq');
    });
    subscription.unsubscribe();
  });

  it('should ignore scroll events without an anchor', () => {
    const subscription = setUp().attachAnchorScrolling().subscribe();

    events.next(scrollEvent(null));
    events.next(new NavigationEnd(2, '/x', '/x'));

    expect(scrollToAnchor).not.toHaveBeenCalled();
    subscription.unsubscribe();
  });

  it('should give up when the section never renders, and keep listening', () => {
    vi.useFakeTimers();
    const service = setUp();
    const values: string[] = [];
    const subscription = service.attachAnchorScrolling().subscribe((anchor) => values.push(anchor));

    events.next(scrollEvent('missing'));
    vi.advanceTimersByTime(5_000);

    expect(subscription.closed).toBe(false);
    expect(values).toEqual([]);
    subscription.unsubscribe();
  });
});
