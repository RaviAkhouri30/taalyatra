import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { APP_PREVIEW } from './app-preview.token';

describe('APP_PREVIEW', () => {
  function previewFor(search: string | null): boolean {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DOCUMENT,
          useValue: { defaultView: search === null ? null : { location: { search } } },
        },
      ],
    });
    return TestBed.inject(APP_PREVIEW);
  }

  it('should be on when the address asks for a preview', () => {
    expect(previewFor('?preview=1&v=3')).toBe(true);
  });

  it('should be off for a normal visit', () => {
    expect(previewFor('?utm_source=x')).toBe(false);
  });

  it('should be off without a window', () => {
    expect(previewFor(null)).toBe(false);
  });
});
