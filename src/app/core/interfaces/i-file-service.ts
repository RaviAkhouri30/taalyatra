import { type Observable } from 'rxjs';

/**
 * Port for saving and opening files on the owner's device (0016 V13: backups). Also the DI token;
 * `fileServiceFactory` provides the browser adapter on the admin routes, and specs provide
 * `FakeFileService`.
 */
export abstract class IFileService {
  /**
   * Saves text as a file in the device's downloads.
   * @param name The file's name, e.g. `taal-yatra-backup-2026-11-18.json`.
   * @param text What it holds.
   * @param type Its media type, e.g. `application/json`.
   */
  public abstract download(name: string, text: string, type: string): void;

  /**
   * @param file A file the owner chose.
   * @returns Its text; errors when it can't be read.
   */
  public abstract read(file: Blob): Observable<string>;
}
