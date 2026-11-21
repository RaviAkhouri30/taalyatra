import { TestBed } from '@angular/core/testing';
import { HttpAiService } from '@core/backends/ai/http-ai.service';
import { FakeAiService } from '@core/backends/fake/fake-ai.service';
import { provideAi } from '@core/config/provide-ai';
import { provideMedia } from '@core/config/provide-media';
import { BackendType } from '@core/enums/backend-type.enum';
import { IAiService } from '@core/interfaces/i-ai-service';
import { IAuthService } from '@core/interfaces/i-auth-service';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';

describe('aiServiceFactory', () => {
  it.each([
    ['the function for Firebase', BackendType.Firebase, HttpAiService],
    ['the fake for the fake backend', BackendType.Fake, FakeAiService],
  ])('should provide %s', (_case, backend, adapter) => {
    TestBed.configureTestingModule({
      providers: [
        provideMedia(),
        provideAi(),
        { provide: IAuthService, useValue: {} },
        { provide: APP_ENVIRONMENT, useValue: { ...environment, backend } },
      ],
    });

    expect(TestBed.inject(IAiService)).toBeInstanceOf(adapter);
  });
});
