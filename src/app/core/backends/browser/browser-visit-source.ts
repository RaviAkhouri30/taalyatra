import { EMPTY, type Observable, of } from 'rxjs';
import { type IVisit, type IVisitSource } from '@core/interfaces/i-vitals-reporter';
import { ADMIN_DEVICE_KEY } from '@shared/constants/visit.constants';
import { deviceFor, mayReport } from './visitor';

/**
 * Remembers, for as long as the tab is open, that this visit was counted: a reload or a return
 * in the same tab isn't a new visit (0018 decision 1). The value is a plain yes, never an id.
 */
export const VISIT_COUNTED_KEY = 'taal-yatra.visit-counted';

const COUNTED = '1';

/**
 * Counts one anonymous visit per opening of the site in a tab (0018), unless it's a robot, a
 * browser asking not to be tracked, the owner's own browser, or a tab already counted.
 */
export class BrowserVisitSource implements IVisitSource {
  /** @param view The browser window. */
  public constructor(private readonly view: Window) {}

  public count(): Observable<IVisit> {
    if (!mayReport(this.view) || this.isOwners() || this.alreadyCounted()) {
      return EMPTY;
    }
    // Marked before sending: a failed send is a visit lost, which beats one counted twice.
    this.markCounted();
    return of({ page: this.view.location.pathname, device: deviceFor(this.view.innerWidth) });
  }

  private isOwners(): boolean {
    return this.read(() => this.view.localStorage.getItem(ADMIN_DEVICE_KEY)) !== null;
  }

  private alreadyCounted(): boolean {
    return this.read(() => this.view.sessionStorage.getItem(VISIT_COUNTED_KEY)) === COUNTED;
  }

  private markCounted(): void {
    try {
      this.view.sessionStorage.setItem(VISIT_COUNTED_KEY, COUNTED);
    } catch {
      // Storage blocked (a private window, say): the visit still counts, a reload may again.
    }
  }

  /** Browsers can refuse storage altogether; that reads as "nothing stored". */
  private read(get: () => string | null): string | null {
    try {
      return get();
    } catch {
      return null;
    }
  }
}
