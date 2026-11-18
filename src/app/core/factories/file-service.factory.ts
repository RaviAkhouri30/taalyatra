import { BrowserFileService } from '@core/backends/browser/browser-file.service';
import { type IFileService } from '@core/interfaces/i-file-service';

/**
 * Provides the file adapter. There is one real technology; the factory keeps concrete adapters
 * out of feature code (ADR-0002), and specs provide `FakeFileService` instead.
 * @returns The browser file adapter.
 */
export function fileServiceFactory(): IFileService {
  return new BrowserFileService();
}
