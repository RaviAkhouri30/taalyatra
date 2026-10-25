import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { RestHttpBackend } from './rest-http-backend.service';

describe('RestHttpBackend', () => {
  function setUp() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_ENVIRONMENT, useValue: { ...environment, apiBaseUrl: 'https://api.test' } },
      ],
    });
    return {
      backend: TestBed.runInInjectionContext(() => new RestHttpBackend()),
      http: TestBed.inject(HttpTestingController),
    };
  }

  it('should GET the full response from the prefixed URL', async () => {
    const { backend, http } = setUp();
    const result = firstValueFrom(backend.get<string>('home/hero'));

    http.expectOne({ method: 'GET', url: 'https://api.test/home/hero' }).flush('hero');

    await expect(result).resolves.toMatchObject({ status: 200, body: 'hero' });
  });

  it.each([
    ['POST', (rest: RestHttpBackend) => rest.post('items', { a: 1 })],
    ['PUT', (rest: RestHttpBackend) => rest.put('items', { a: 1 })],
    ['PATCH', (rest: RestHttpBackend) => rest.patch('items', { a: 1 })],
    ['DELETE', (rest: RestHttpBackend) => rest.delete('items')],
  ] as const)('should send %s requests', async (method, send) => {
    const { backend, http } = setUp();
    const result = firstValueFrom(send(backend));

    http.expectOne({ method, url: 'https://api.test/items' }).flush({});

    await expect(result).resolves.toMatchObject({ status: 200 });
    http.verify();
  });
});
