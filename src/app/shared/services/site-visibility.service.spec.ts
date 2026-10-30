import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { LoggerService } from '@core/services/logger.service';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { HomeSection } from '@shared/enums/home-section.enum';
import { SiteVisibilityService } from './site-visibility.service';

describe('SiteVisibilityService', () => {
  function setUp(response: HttpResponse<unknown>) {
    const get = vi.fn(() => of(response));
    TestBed.configureTestingModule({
      providers: [
        { provide: IHttpBackend, useValue: { get } },
        { provide: LoggerService, useValue: { error: vi.fn() } },
      ],
    });
    return { service: TestBed.inject(SiteVisibilityService), get };
  }

  it('should read site/visibility and build the switches when it is stored', async () => {
    const body = { sections: { gallery: false } };
    const { service, get } = setUp(new HttpResponse({ status: HttpStatusCode.Ok, body }));

    const visibility = await firstValueFrom(service.getVisibility());

    expect(get).toHaveBeenCalledWith(ApiEndpoint.SiteVisibility);
    expect(visibility.isSectionVisible(HomeSection.Gallery)).toBe(false);
  });

  it('should show everything when the document is missing', async () => {
    const { service } = setUp(new HttpResponse({ status: HttpStatusCode.NotFound }));

    const visibility = await firstValueFrom(service.getVisibility());

    expect(visibility.isSectionVisible(HomeSection.Gallery)).toBe(true);
  });

  it('should read the document once for every subscriber', async () => {
    const { service, get } = setUp(new HttpResponse({ status: HttpStatusCode.Ok, body: {} }));

    await firstValueFrom(service.getVisibility());
    await firstValueFrom(service.getVisibility());

    expect(get).toHaveBeenCalledTimes(1);
  });
});
