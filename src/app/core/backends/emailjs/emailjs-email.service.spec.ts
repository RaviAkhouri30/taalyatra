import { TestBed } from '@angular/core/testing';
import { send } from '@emailjs/browser';
import { firstValueFrom } from 'rxjs';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { EmailJsEmailService } from './emailjs-email.service';

vi.mock('@emailjs/browser', () => ({ send: vi.fn() }));

describe('EmailJsEmailService', () => {
  const emailJs = { serviceId: 'service', templateId: 'template', publicKey: 'key' };
  const message = {
    subject: 'Proposal request: Drum Circle',
    body: 'Hi',
    fromName: 'Asha',
    phone: '9876543210',
    replyTo: 'asha@example.com',
  };

  function create(): EmailJsEmailService {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: { ...environment, emailJs } }],
    });
    return TestBed.runInInjectionContext(() => new EmailJsEmailService());
  }

  it('should send the message with the configured template, lazily', async () => {
    vi.mocked(send).mockResolvedValue({ status: 200, text: 'OK' });
    const request = create().send(message);

    expect(send).not.toHaveBeenCalled();
    await expect(firstValueFrom(request)).resolves.toBeUndefined();
    expect(send).toHaveBeenCalledWith(
      'service',
      'template',
      {
        subject: message.subject,
        message: 'Hi',
        from_name: 'Asha',
        phone: '9876543210',
        reply_to: 'asha@example.com',
      },
      { publicKey: 'key' },
    );
  });

  it('should fail when EmailJS rejects', async () => {
    vi.mocked(send).mockRejectedValue(new Error('rate limited'));

    await expect(firstValueFrom(create().send(message))).rejects.toThrow('rate limited');
  });
});
