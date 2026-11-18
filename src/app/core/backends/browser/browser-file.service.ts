import { DOCUMENT } from '@angular/common';
import { inject } from '@angular/core';
import { type Observable, defer } from 'rxjs';
import { type IFileService } from '@core/interfaces/i-file-service';

/**
 * How long a download's temporary address stays usable. Safari and Firefox can cancel a download
 * whose address is released straight after the click.
 */
const RELEASE_AFTER_MS = 1000;

/** Saves through a temporary download link, and reads with the File API. */
export class BrowserFileService implements IFileService {
  private readonly document = inject(DOCUMENT);

  public download(name: string, text: string, type: string): void {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const link = this.document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    // A timer, not RxJS: there's nothing to compose, and nothing to cancel if the page closes.
    this.document.defaultView?.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, RELEASE_AFTER_MS);
  }

  public read(file: Blob): Observable<string> {
    // text() returns a Promise; defer() keeps it lazy and inside this adapter (CLAUDE.md §7).
    return defer(() => file.text());
  }
}
