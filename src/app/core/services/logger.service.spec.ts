import { ErrorHandler } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  it('should report errors with their context to the ErrorHandler', () => {
    const handleError = vi.fn();
    TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useValue: { handleError } }],
    });
    const cause = new Error('boom');

    TestBed.inject(LoggerService).error('Loading failed', cause);

    const reported = handleError.mock.calls[0]?.[0] as Error;
    expect(reported.message).toBe('Loading failed');
    expect(reported.cause).toBe(cause);
  });
});
