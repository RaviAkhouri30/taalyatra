import { BrowserClipboardService } from '@core/backends/browser/browser-clipboard.service';
import { type IClipboardService } from '@core/interfaces/i-clipboard-service';

/**
 * Provides the clipboard adapter. There is one real technology today; the factory keeps concrete
 * adapters out of feature code (ADR-0002), and specs provide `FakeClipboardService` instead.
 * @returns The browser clipboard adapter.
 */
export function clipboardServiceFactory(): IClipboardService {
  return new BrowserClipboardService();
}
