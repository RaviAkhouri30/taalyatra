import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { FakeSiteChat } from '@core/backends/fake/fake-site-chat';
import { BackendType } from '@core/enums/backend-type.enum';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { HttpSiteChat } from './http-site-chat';
import { SITE_CHAT_LOADER } from './site-chat-loader.token';

describe('SITE_CHAT_LOADER', () => {
  it.each([
    ['the function for Firebase', BackendType.Firebase, HttpSiteChat],
    ['the fake for the fake backend', BackendType.Fake, FakeSiteChat],
  ])('should load %s, only when asked', async (_case, backend, adapter) => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: APP_ENVIRONMENT, useValue: { ...environment, backend } },
      ],
    });

    const load = TestBed.inject(SITE_CHAT_LOADER);

    await expect(firstValueFrom(load())).resolves.toBeInstanceOf(adapter);
  });
});
