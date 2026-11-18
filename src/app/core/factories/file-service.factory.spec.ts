import { TestBed } from '@angular/core/testing';
import { BrowserFileService } from '@core/backends/browser/browser-file.service';
import { provideFiles } from '@core/config/provide-files';
import { IFileService } from '@core/interfaces/i-file-service';

describe('fileServiceFactory', () => {
  it('should provide the browser adapter for IFileService', () => {
    TestBed.configureTestingModule({ providers: [provideFiles()] });

    expect(TestBed.inject(IFileService)).toBeInstanceOf(BrowserFileService);
  });
});
