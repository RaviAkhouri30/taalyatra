import { type Observable } from 'rxjs';

/**
 * Port for copying text (CLAUDE.md §3). Also the DI token; `clipboardServiceFactory` provides the
 * browser adapter, and specs provide `FakeClipboardService`.
 */
export abstract class IClipboardService {
  /** Copies `text`; emits once and completes on success, errors when the clipboard refuses. */
  public abstract copy(text: string): Observable<void>;
}
