import { type Observable, of } from 'rxjs';
import { type IClipboardService } from '@core/interfaces/i-clipboard-service';

/** Clipboard for specs: remembers what was copied instead of touching the browser. */
export class FakeClipboardService implements IClipboardService {
  /** Every text copied, in order. */
  public readonly copied: string[] = [];

  public copy(text: string): Observable<void> {
    this.copied.push(text);
    return of(undefined);
  }
}
