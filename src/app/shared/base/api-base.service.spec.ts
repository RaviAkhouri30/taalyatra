import { HttpResponse } from '@angular/common/http';
import { Service } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, toArray, type Observable } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { ApiBaseService } from './api-base.service';

@Service()
class ProbeService extends ApiBaseService<{ title: string }> {
  public override attachViewDataHandler(): Observable<{ title: string }> {
    return this.attachViewApiHandler(ApiEndpoint.HomeHero);
  }
}

describe('ApiBaseService', () => {
  function setUp(response: HttpResponse<unknown>) {
    const get = vi.fn(() => of(response));
    TestBed.configureTestingModule({ providers: [{ provide: IHttpBackend, useValue: { get } }] });
    return { service: TestBed.inject(ProbeService), get };
  }

  it('should read the endpoint and emit the body', async () => {
    const { service, get } = setUp(new HttpResponse({ status: 200, body: { title: 'Hi' } }));

    await expect(firstValueFrom(service.attachViewDataHandler())).resolves.toEqual({ title: 'Hi' });
    expect(get).toHaveBeenCalledWith(ApiEndpoint.HomeHero);
  });

  it('should emit nothing for an empty body', async () => {
    const { service } = setUp(new HttpResponse({ status: 200, body: null }));

    await expect(firstValueFrom(service.attachViewDataHandler().pipe(toArray()))).resolves.toEqual(
      [],
    );
  });
});
