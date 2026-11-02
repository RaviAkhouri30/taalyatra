import { inject } from '@angular/core';
import { type Observable, defer, map } from 'rxjs';
import { type IEmailMessage, type IEmailService } from '@core/interfaces/i-email-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { EMAILJS_SENDER } from './emailjs-sender.token';

/**
 * Sends email through EmailJS. Only the public key reaches the browser (EmailJS is designed for
 * that); restrict the allowed domains and rate limits in the EmailJS dashboard.
 */
export class EmailJsEmailService implements IEmailService {
  private readonly config = inject(APP_ENVIRONMENT).emailJs;
  private readonly sender = inject(EMAILJS_SENDER);

  public send(message: IEmailMessage): Observable<void> {
    // The SDK returns a Promise; defer() keeps it lazy and inside this adapter (CLAUDE.md §7).
    return defer(() =>
      this.sender(
        this.config.serviceId,
        this.config.templateId,
        {
          subject: message.subject,
          message: message.body,
          from_name: message.fromName,
          phone: message.phone,
          reply_to: message.replyTo,
        },
        { publicKey: this.config.publicKey },
      ),
    ).pipe(map(() => undefined));
  }
}
