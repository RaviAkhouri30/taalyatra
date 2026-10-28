import { EMPTY, type MonoTypeOperatorFunction, catchError, shareReplay, throwIfEmpty } from 'rxjs';

/**
 * Caches a one-shot read for the app's lifetime (ADR-0011): the first subscriber triggers the
 * read, every later one gets the replayed value. A failed read (one that completes without a
 * value, as `HttpsErrorHandler.handle` does) is not cached, so the next subscriber retries.
 * @returns An operator for a cold stream that emits once and completes.
 */
export function cacheLatest<T>(): MonoTypeOperatorFunction<T> {
  // throwIfEmpty turns "completed empty" into an error, which resets shareReplay instead of
  // being replayed; catchError then restores "complete without emitting" for subscribers.
  return (source) =>
    source.pipe(
      throwIfEmpty(),
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError(() => EMPTY),
    );
}
