import { inject } from '@angular/core';
import { type Observable, delay, of } from 'rxjs';
import { type IEmailMessage, type IEmailService } from '@core/interfaces/i-email-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/** Accepts every email without sending it (development, demos, e2e). */
export class FakeEmailService implements IEmailService {
  private readonly latencyMs = inject(APP_ENVIRONMENT).fakeLatencyMs;

  public send(_message: IEmailMessage): Observable<void> {
    return of(undefined).pipe(delay(this.latencyMs));
  }
}
