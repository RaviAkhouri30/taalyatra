import { DOCUMENT } from '@angular/common';
import { DestroyRef, Service, type Signal, inject, signal } from '@angular/core';
import { PHONE_MEDIA_QUERY } from '@shared/constants/fold.constants';

/** Whether the screen is phone-sized, following resizes and rotation. */
@Service()
export class ViewportService {
  /** True at the site's phone breakpoint and below. */
  public readonly isPhone: Signal<boolean>;

  private readonly phoneSignal = signal(false);

  public constructor() {
    this.isPhone = this.phoneSignal.asReadonly();
    const view = inject(DOCUMENT).defaultView;
    // Some environments (jsdom in unit tests, very old browsers) have no matchMedia: not a phone.
    if (view === null || typeof view.matchMedia !== 'function') {
      return;
    }
    const query = view.matchMedia(PHONE_MEDIA_QUERY);
    this.phoneSignal.set(query.matches);
    const follow = (event: MediaQueryListEvent): void => {
      this.phoneSignal.set(event.matches);
    };
    query.addEventListener('change', follow);
    inject(DestroyRef).onDestroy(() => {
      query.removeEventListener('change', follow);
    });
  }
}
