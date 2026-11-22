import { DOCUMENT, inject } from '@angular/core';
import { type Observable, defer, fromEvent, map, merge, of, startWith, switchMap } from 'rxjs';
import { type IInstallPrompt } from '@core/interfaces/i-install-prompt';

/** Chrome's `beforeinstallprompt` event; not in TypeScript's DOM types. */
interface IBeforeInstallPromptEvent extends Event {
  readonly userChoice: Promise<{ readonly outcome: string }>;
  prompt(): Promise<void>;
}

/** Safari's own flag for a home-screen app; not in TypeScript's DOM types. */
interface IStandaloneNavigator {
  readonly standalone?: boolean;
}

const STANDALONE_QUERY = '(display-mode: standalone)';
const ACCEPTED = 'accepted';

/**
 * The browser's install offer (0026 D6), kept from when the admin opens: Chrome makes it once,
 * soon after the page loads, and not again until the next load.
 */
export class BrowserInstallPrompt implements IInstallPrompt {
  private readonly view = inject(DOCUMENT).defaultView;
  private offer: IBeforeInstallPromptEvent | null = null;

  public offers(): Observable<boolean> {
    const view = this.view;
    if (!view) {
      return of(false);
    }
    return merge(
      fromEvent(view, 'beforeinstallprompt').pipe(
        map((event) => {
          // Kept for the Install button, instead of Chrome's own mini bar.
          event.preventDefault();
          this.offer = event as IBeforeInstallPromptEvent;
          return true;
        }),
      ),
      fromEvent(view, 'appinstalled').pipe(
        map(() => {
          this.offer = null;
          return false;
        }),
      ),
    ).pipe(startWith(this.offer !== null));
  }

  public install(): Observable<boolean> {
    const offer = this.offer;
    if (!offer) {
      return of(false);
    }
    // An offer can be shown once.
    this.offer = null;
    // defer: the browser's Promises run only when subscribed (CLAUDE.md §7).
    return defer(() => offer.prompt()).pipe(
      // switchMap: the answer comes after the prompt is shown.
      switchMap(() => defer(() => offer.userChoice)),
      map((choice) => choice.outcome === ACCEPTED),
    );
  }

  public isInstalledApp(): boolean {
    const view = this.view;
    if (!view) {
      return false;
    }
    const navigator = view.navigator as Navigator & IStandaloneNavigator;
    return view.matchMedia(STANDALONE_QUERY).matches || navigator.standalone === true;
  }
}
