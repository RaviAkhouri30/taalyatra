import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { IHttpBackend } from '@core/interfaces/i-http-backend';
import { LoggerService } from '@core/services/logger.service';
import { DEFAULT_ROOT_STYLE } from '@shared/constants/theme-default.constants';
import { ApiEndpoint } from '@shared/enums/api-endpoint.enum';
import { themeStyleFor } from '@shared/models/site-theme-style';
import { SITE_THEME_LOADER, type SiteThemeLoader } from '@shared/tokens/site-theme-loader.token';
import { SiteThemeService } from './site-theme.service';

describe('SiteThemeService', () => {
  function setUp(response: HttpResponse<unknown>, load: SiteThemeLoader = () => of(themeStyleFor)) {
    const get = vi.fn(() => of(response));
    const loader = vi.fn(load);
    TestBed.configureTestingModule({
      providers: [
        { provide: IHttpBackend, useValue: { get } },
        { provide: LoggerService, useValue: { error: vi.fn() } },
        { provide: SITE_THEME_LOADER, useValue: loader },
      ],
    });
    return { service: TestBed.inject(SiteThemeService), get, loader };
  }

  const ok = (body: unknown) => new HttpResponse({ status: HttpStatusCode.Ok, body });

  it('should read site/theme and work out its style when a theme is stored', async () => {
    const { service, get } = setUp(ok({ preset: 'custom', accent: '#ffb21e' }));

    const style = await firstValueFrom(service.getStyle());

    expect(get).toHaveBeenCalledWith(ApiEndpoint.SiteTheme);
    expect(style.variables.get('--ty-amber')).toBe('#ffb21e');
  });

  it('should give today’s look without loading the theme’s code when the document is empty', async () => {
    const { service, loader } = setUp(ok({}));

    await expect(firstValueFrom(service.getStyle())).resolves.toBe(DEFAULT_ROOT_STYLE);
    expect(loader).not.toHaveBeenCalled();
  });

  it('should give today’s look when the document is missing', async () => {
    const { service } = setUp(new HttpResponse({ status: HttpStatusCode.NotFound }));

    await expect(firstValueFrom(service.getStyle())).resolves.toBe(DEFAULT_ROOT_STYLE);
  });

  it('should give today’s look when the theme’s code fails to load', async () => {
    const { service } = setUp(ok({ accent: '#ffb21e' }), () =>
      throwError(() => new Error('offline')),
    );

    await expect(firstValueFrom(service.getStyle())).resolves.toBe(DEFAULT_ROOT_STYLE);
  });

  it('should read the document once for every subscriber', async () => {
    const { service, get } = setUp(ok({}));

    await firstValueFrom(service.getStyle());
    await firstValueFrom(service.getStyle());

    expect(get).toHaveBeenCalledTimes(1);
  });
});
