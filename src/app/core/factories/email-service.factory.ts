import { inject } from '@angular/core';
import { EmailJsEmailService } from '@core/backends/emailjs/emailjs-email.service';
import { FakeEmailService } from '@core/backends/fake/fake-email.service';
import { type IEmailService } from '@core/interfaces/i-email-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';

/**
 * Picks the email adapter: EmailJS when it is configured, otherwise the fake one, so the site
 * works end to end before the EmailJS account exists.
 * @returns The active email adapter.
 */
export function emailServiceFactory(): IEmailService {
  const { serviceId, templateId, publicKey } = inject(APP_ENVIRONMENT).emailJs;
  return serviceId && templateId && publicKey ? new EmailJsEmailService() : new FakeEmailService();
}
