import { HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { APP_ENVIRONMENT } from '@core/tokens/app-environment.token';
import { environment } from '@env/environment';
import { FakeHttpsService } from './fake-https.service';

describe('FakeHttpsService', () => {
  function create(): FakeHttpsService {
    TestBed.configureTestingModule({
      providers: [{ provide: APP_ENVIRONMENT, useValue: { ...environment, fakeLatencyMs: 0 } }],
    });
    return TestBed.runInInjectionContext(() => new FakeHttpsService());
  }

  it('should read a nested document by path', async () => {
    const response = await firstValueFrom(create().get<object>('/home/'));

    expect(response.status).toBe(HttpStatusCode.Ok);
    expect(response.body).toBeTypeOf('object');
  });

  it('should answer 404 for a missing path', async () => {
    const service = create();

    await expect(firstValueFrom(service.get('home/missing'))).resolves.toMatchObject({
      status: HttpStatusCode.NotFound,
      body: null,
    });
    await expect(firstValueFrom(service.get('nowhere/at/all'))).resolves.toMatchObject({
      status: HttpStatusCode.NotFound,
    });
  });

  it('should acknowledge writes without storing them', async () => {
    const service = create();
    const body = { name: 'Asha' };

    await expect(firstValueFrom(service.post('enquiries', body))).resolves.toMatchObject({
      status: HttpStatusCode.Created,
      body,
    });
    await expect(firstValueFrom(service.put('x', body))).resolves.toMatchObject({ status: 200 });
    await expect(firstValueFrom(service.patch('x', body))).resolves.toMatchObject({ status: 200 });
    await expect(firstValueFrom(service.delete('x'))).resolves.toMatchObject({ status: 204 });
  });
});
