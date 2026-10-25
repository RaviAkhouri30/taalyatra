import { ErrorHandler, Service, inject } from '@angular/core';

/**
 * The single place that reports problems (CLAUDE.md §8: no `console.*`).
 * Delegates to Angular's `ErrorHandler`, which a monitoring integration can replace later.
 */
@Service()
export class LoggerService {
  private readonly errorHandler = inject(ErrorHandler);

  /** Reports an error with context. */
  public error(context: string, error: unknown): void {
    this.errorHandler.handleError(new Error(context, { cause: error }));
  }
}
