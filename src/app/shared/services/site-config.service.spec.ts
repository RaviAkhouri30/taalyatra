import { HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { defer, firstValueFrom, of, toArray } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { LoggerService } from '@core/services/logger.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { SiteConfigModel } from '@shared/models/site-config.model';
import { SITE_DTO } from '@shared/testing/fixtures';
import { SiteConfigService } from './site-config.service';

describe('SiteConfigService', () => {
  /** Each subscription to the (cold) request is one read; `statuses` answers them in turn. */
  function setUp(...statuses: number[]) {
    const reads = vi.fn();
    const get = vi.fn(() =>
      defer(() => {
        reads();
        const status = statuses[reads.mock.calls.length - 1] ?? 200;
        return of(new HttpResponse({ status, body: status === 200 ? SITE_DTO : null }));
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        { provide: IHttpBackend, useValue: { get } },
        { provide: LoggerService, useValue: { error: vi.fn() } },
      ],
    });
    return { service: TestBed.inject(SiteConfigService), get, reads };
  }

  it('should read site/config and build the site model', async () => {
    const { service, get } = setUp(200);

    const site = await firstValueFrom(service.getSiteConfig());

    expect(site).toBeInstanceOf(SiteConfigModel);
    expect(site.contact.email).toBe('contact@taalyatra.in');
    expect(get).toHaveBeenCalledWith(ApiEndpoint.SiteConfig);
  });

  it('should read the backend once when several view models subscribe', async () => {
    const { service, reads } = setUp(200);

    const [first, second] = await Promise.all([
      firstValueFrom(service.getSiteConfig()),
      firstValueFrom(service.getSiteConfig()),
    ]);

    expect(first).toBe(second);
    expect(reads).toHaveBeenCalledTimes(1);
  });

  it('should complete empty, then retry for the next subscriber, when a read fails', async () => {
    const { service, reads } = setUp(503, 200);

    const failed = await firstValueFrom(service.getSiteConfig().pipe(toArray()));
    const retried = await firstValueFrom(service.getSiteConfig());

    expect(failed).toEqual([]);
    expect(retried.brand.name).toBe('Taal Yatra');
    expect(reads).toHaveBeenCalledTimes(2);
  });
});
