import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { DEFAULT_SITE_CONFIG } from '@shared/constants/site.constants';
import { SITE_CONFIG } from '@shared/tokens/site-config.token';
import { SiteConfigService } from './site-config.service';

describe('SiteConfigService', () => {
  it('should emit the default site configuration', async () => {
    const service = TestBed.inject(SiteConfigService);

    await expect(firstValueFrom(service.getSiteConfig())).resolves.toBe(DEFAULT_SITE_CONFIG);
  });

  it('should emit an overridden configuration', async () => {
    const custom = { ...DEFAULT_SITE_CONFIG, copyrightYear: 2030 };
    TestBed.configureTestingModule({ providers: [{ provide: SITE_CONFIG, useValue: custom }] });

    await expect(firstValueFrom(TestBed.inject(SiteConfigService).getSiteConfig())).resolves.toBe(
      custom,
    );
  });
});
