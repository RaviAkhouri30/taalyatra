import { DOCUMENT, ViewportScroller } from '@angular/common';
import { Service, inject } from '@angular/core';
import { Router, Scroll } from '@angular/router';
import {
  EMPTY,
  Observable,
  animationFrameScheduler,
  catchError,
  delay,
  filter,
  map,
  switchMap,
  tap,
  timeout,
} from 'rxjs';

/** Longest wait for a section to render before giving up on scrolling to it. */
const ANCHOR_WAIT_MS = 5_000;

/**
 * Makes links to page sections (`/#contact`) work when the section renders late.
 *
 * The router scrolls to an anchor as soon as navigation ends, but home sections render only once
 * their data arrives. This service waits for the target element, then scrolls to it.
 */
@Service()
export class AnchorScrollService {
  private readonly router = inject(Router);
  private readonly scroller = inject(ViewportScroller);
  private readonly document = inject(DOCUMENT);

  /** @returns A stream that scrolls to each navigated anchor once it exists; never errors. */
  public attachAnchorScrolling(): Observable<string> {
    return this.router.events.pipe(
      filter((event): event is Scroll => event instanceof Scroll),
      map((event) => event.anchor),
      filter((anchor): anchor is string => anchor !== null),
      // switchMap: a newer navigation cancels waiting for an older anchor.
      switchMap((anchor) =>
        this.whenRendered(anchor).pipe(
          timeout(ANCHOR_WAIT_MS),
          catchError(() => EMPTY),
        ),
      ),
      // Wait one frame so sections rendered in the same pass have their final layout.
      delay(0, animationFrameScheduler),
      tap((anchor) => {
        this.scroller.scrollToAnchor(anchor);
      }),
    );
  }

  /** Emits `id` once an element with that id is in the document, then completes. */
  private whenRendered(id: string): Observable<string> {
    return new Observable<string>((subscriber) => {
      const emitIfPresent = (): boolean => {
        if (!this.document.getElementById(id)) {
          return false;
        }
        subscriber.next(id);
        subscriber.complete();
        return true;
      };
      if (emitIfPresent()) {
        return undefined;
      }
      const observer = new MutationObserver(() => {
        emitIfPresent();
      });
      observer.observe(this.document.body, { childList: true, subtree: true });
      return () => {
        observer.disconnect();
      };
    });
  }
}
