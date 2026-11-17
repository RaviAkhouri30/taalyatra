import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { PHONE_MEDIA_QUERY } from '@shared/constants/fold.constants';
import { ViewportService } from './viewport.service';

describe('ViewportService', () => {
  function setUp(matches: boolean, hasWindow = true) {
    let listener: ((event: MediaQueryListEvent) => void) | undefined;
    const query = {
      matches,
      addEventListener: vi.fn((_type: string, next: (event: MediaQueryListEvent) => void) => {
        listener = next;
      }),
      removeEventListener: vi.fn(),
    };
    const matchMedia = vi.fn(() => query);
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: { defaultView: hasWindow ? { matchMedia } : null } },
      ],
    });
    return {
      service: TestBed.inject(ViewportService),
      matchMedia,
      query,
      change: (next: boolean) => listener?.({ matches: next } as MediaQueryListEvent),
    };
  }

  it('should say whether the screen starts phone-sized', () => {
    const { service, matchMedia } = setUp(true);

    expect(service.isPhone()).toBe(true);
    expect(matchMedia).toHaveBeenCalledWith(PHONE_MEDIA_QUERY);
  });

  it('should follow resizes and rotation', () => {
    const { service, change } = setUp(false);

    change(true);

    expect(service.isPhone()).toBe(true);
  });

  it('should stop listening when the app is torn down', () => {
    const { query } = setUp(false);

    TestBed.resetTestingModule();

    expect(query.removeEventListener).toHaveBeenCalled();
  });

  it('should treat a missing window as not a phone', () => {
    expect(setUp(true, false).service.isPhone()).toBe(false);
  });
});
