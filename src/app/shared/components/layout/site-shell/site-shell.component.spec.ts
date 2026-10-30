import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { FakeClipboardService } from '@core/backends/fake/fake-clipboard.service';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { ROUTE_DATA_KEYS } from '@shared/constants/route-data.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';
import { type IPromotionDto } from '@shared/interfaces/i-site-config';
import { SiteConfigModel } from '@shared/models/site-config.model';
import { SiteVisibility } from '@shared/models/site-visibility.model';
import { SiteConfigService } from '@shared/services/site-config.service';
import { SITE_DTO, provideSiteConfig, provideVisibility } from '@shared/testing/fixtures';
import { SiteShellComponent } from './site-shell.component';

@Component({ template: '<p class="page">page</p>' })
class PageComponent {}

describe('SiteShellComponent', () => {
  async function renderAt(
    url: string,
    promotion: IPromotionDto | null = SITE_DTO.promotion ?? null,
    visibility: SiteVisibility = SiteVisibility.allVisible,
  ) {
    TestBed.configureTestingModule({
      providers: [
        provideSiteConfig(new SiteConfigModel({ ...SITE_DTO, promotion })),
        provideVisibility(visibility),
        { provide: IClipboardService, useClass: FakeClipboardService },
        provideRouter([
          {
            path: '',
            component: PageComponent,
            data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Home },
          },
          {
            path: 'admin',
            component: PageComponent,
            data: { [ROUTE_DATA_KEYS.Layout]: PageLayout.Bare },
          },
          { path: '**', component: PageComponent },
        ]),
      ],
    });
    const fixture = TestBed.createComponent(SiteShellComponent);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(url);
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, element: fixture.nativeElement as HTMLElement };
  }

  it('should frame the home page with home chrome and no WhatsApp button', async () => {
    const { element } = await renderAt('/');

    expect(element.querySelector('main .page')).not.toBeNull();
    expect(element.querySelector('app-header a.navhot')).not.toBeNull();
    expect(element.querySelector('app-footer .fgrid')).not.toBeNull();
    expect(element.querySelector('app-promo-pill')).not.toBeNull();
    expect(element.querySelector('app-whatsapp-fab')).toBeNull();
    expect(element.querySelector('.shell')?.classList).toContain('shell--action-bar');
  });

  it('should frame inner pages with page chrome and the WhatsApp button', async () => {
    const { element } = await renderAt('/shows');

    expect(element.querySelector('app-header a.navhome')).not.toBeNull();
    expect(element.querySelector('app-promo-card')).not.toBeNull();
    expect(element.querySelector('app-whatsapp-fab')).not.toBeNull();
  });

  it('should leave out the widgets the owner switched off', async () => {
    const widgetsOff = new SiteVisibility({
      widgets: { utilityBar: false, actionBar: false, whatsApp: false },
    });

    const { element } = await renderAt('/shows', SITE_DTO.promotion ?? null, widgetsOff);

    expect(element.querySelector('app-utility-bar')).toBeNull();
    expect(element.querySelector('app-mobile-action-bar')).toBeNull();
    expect(element.querySelector('app-whatsapp-fab')).toBeNull();
    expect(element.querySelector('.shell')?.classList).not.toContain('shell--action-bar');
  });

  it('should drop menu links to a switched-off page', async () => {
    const teamOff = new SiteVisibility({ pages: { team: false } });

    const { element } = await renderAt('/', SITE_DTO.promotion ?? null, teamOff);

    expect(element.querySelector('app-header a[href="/team"]')).toBeNull();
    expect(element.querySelector('app-header a[href="/videos"]')).not.toBeNull();
  });

  it('should render only the outlet on bare routes', async () => {
    const { element } = await renderAt('/admin');

    expect(element.querySelector('main .page')).not.toBeNull();
    expect(element.querySelector('app-header')).toBeNull();
    expect(element.querySelector('app-footer')).toBeNull();
  });

  it('should skip the promo badge when no promotion is running', async () => {
    const { element } = await renderAt('/shows', null);

    expect(element.querySelector('app-promo-badge')).toBeNull();
  });

  describe('while the site config loads', () => {
    async function renderPending() {
      const site$ = new Subject<SiteConfigModel>();
      TestBed.configureTestingModule({
        providers: [
          { provide: SiteConfigService, useValue: { getSiteConfig: () => site$.asObservable() } },
          provideVisibility(),
          provideRouter([{ path: '**', component: PageComponent }]),
        ],
      });
      const fixture = TestBed.createComponent(SiteShellComponent);
      fixture.detectChanges();
      await TestBed.inject(Router).navigateByUrl('/');
      fixture.detectChanges();
      const main = () => (fixture.nativeElement as HTMLElement).querySelector('main')!;
      const settle = (site?: SiteConfigModel) => {
        if (site) {
          site$.next(site);
        }
        site$.complete();
        fixture.detectChanges();
      };
      return { main, settle };
    }

    it('should keep main hidden until the chrome can render above it', async () => {
      const { main, settle } = await renderPending();

      expect(main().classList).toContain('main--pending');
      settle(new SiteConfigModel(SITE_DTO));

      expect(main().classList).not.toContain('main--pending');
    });

    it('should show main without chrome when the site config fails', async () => {
      const { main, settle } = await renderPending();

      settle();

      expect(main().classList).not.toContain('main--pending');
      expect(main().parentElement?.querySelector('app-header')).toBeNull();
    });
  });
});
