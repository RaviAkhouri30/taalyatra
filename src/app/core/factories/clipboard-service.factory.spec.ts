import { TestBed } from '@angular/core/testing';
import { provideBackend } from '@core/config/provide-backend';
import { BrowserClipboardService } from '@core/backends/browser/browser-clipboard.service';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';

describe('clipboardServiceFactory', () => {
  it('should provide the browser adapter for IClipboardService', () => {
    TestBed.configureTestingModule({ providers: [provideBackend()] });

    expect(TestBed.inject(IClipboardService)).toBeInstanceOf(BrowserClipboardService);
  });
});
