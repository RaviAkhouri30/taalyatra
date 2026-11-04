import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { APP_PREVIEW, APP_PREVIEW_FRAME } from './app-preview.token';

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

describe('APP_PREVIEW_FRAME', () => {
  const page = { location: { search: '?preview=1' } };

  function frameFor(view: object | null, preview: boolean): boolean {
    TestBed.configureTestingModule({
      providers: [
        { provide: DOCUMENT, useValue: { defaultView: view } },
        { provide: APP_PREVIEW, useValue: preview },
      ],
    });
    return TestBed.inject(APP_PREVIEW_FRAME);
  }

  it('should be on for a preview inside a frame', () => {
    expect(frameFor({ ...page, top: {} }, true)).toBe(true);
  });

  it('should be off for a preview in its own tab', () => {
    const own: { location: object; top?: object } = { ...page };
    own.top = own;

    expect(frameFor(own, true)).toBe(false);
  });

  it('should be off for a normal visit, even inside a frame', () => {
    expect(frameFor({ ...page, top: {} }, false)).toBe(false);
  });

  it('should be off without a window', () => {
    expect(frameFor(null, true)).toBe(false);
  });
});
