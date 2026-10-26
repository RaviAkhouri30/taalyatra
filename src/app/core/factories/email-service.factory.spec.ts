import { TestBed } from '@angular/core/testing';
import { EmailJsEmailService } from '@core/backends/emailjs/emailjs-email.service';
import { FakeEmailService } from '@core/backends/fake/fake-email.service';
import { provideBackend } from '@core/config/provide-backend';
import { IEmailService } from '@core/interfaces/i-email-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';

describe('emailServiceFactory', () => {
  const configured = { serviceId: 'service', templateId: 'template', publicKey: 'key' };

  it.each([
    ['EmailJS when every id is set', configured, EmailJsEmailService],
    ['the fake when any id is missing', { ...configured, publicKey: '' }, FakeEmailService],
  ])('should provide %s', (_case, emailJs, adapter) => {
    TestBed.configureTestingModule({
      providers: [
        provideBackend(),
        { provide: APP_ENVIRONMENT, useValue: { ...environment, emailJs } },
      ],
    });

    expect(TestBed.inject(IEmailService)).toBeInstanceOf(adapter);
  });
});
