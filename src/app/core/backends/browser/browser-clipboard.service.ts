import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { type Observable, defer, throwError } from 'rxjs';
import { type IClipboardService } from '@core/interfaces/i-clipboard-service';

/** Copies with the browser's asynchronous Clipboard API. */
export class BrowserClipboardService implements IClipboardService {
  private readonly clipboard = inject(DOCUMENT).defaultView?.navigator.clipboard;

  public copy(text: string): Observable<void> {
    const clipboard = this.clipboard;
    // The API is missing outside secure contexts (http://, some embedded browsers).
    if (clipboard === undefined) {
      return throwError(() => new Error('Clipboard API unavailable'));
    }
    // writeText returns a Promise; defer() keeps it lazy and inside this adapter (CLAUDE.md §7).
    return defer(() => clipboard.writeText(text));
  }
}
