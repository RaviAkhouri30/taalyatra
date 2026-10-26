import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { FakeEmailService } from './fake-email.service';

describe('FakeEmailService', () => {
  it('should accept every email', async () => {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: { ...environment, fakeLatencyMs: 0 } }],
    });
    const service = TestBed.runInInjectionContext(() => new FakeEmailService());
    const message = { subject: 's', body: 'b', fromName: 'n', phone: 'p', replyTo: '' };

    await expect(firstValueFrom(service.send(message))).resolves.toBeUndefined();
  });
});
