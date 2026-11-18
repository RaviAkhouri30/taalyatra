import { type Observable, of } from 'rxjs';
import { type IFileService } from '@core/interfaces/i-file-service';

/** Files for specs: remembers downloads, and reads what the spec says a file holds. */
export class FakeFileService implements IFileService {
  /** Every file downloaded, in order. */
  public readonly downloads: { name: string; text: string; type: string }[] = [];
  /** What "reading" any file returns. */
  public text = '';

  public download(name: string, text: string, type: string): void {
    this.downloads.push({ name, text, type });
  }

  public read(_file: Blob): Observable<string> {
    return of(this.text);
  }
}
