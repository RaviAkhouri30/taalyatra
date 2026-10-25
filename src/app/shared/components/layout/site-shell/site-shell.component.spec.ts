import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ROUTE_DATA_KEYS } from '@shared/constants/route-data.constants';
import { PageLayout } from '@shared/enums/page-layout.enum';
import { SITE_CONFIG } from '@shared/tokens/site-config.token';
import { SITE } from '@shared/testing/fixtures';
import { SiteShellComponent } from './site-shell.component';

@Component({ template: '<p class="page">page</p>' })
class PageComponent {}

describe('SiteShellComponent', () => {
  async function renderAt(url: string, promotion = SITE.promotion) {
    TestBed.configureTestingModule({
      providers: [
        { provide: SITE_CONFIG, useValue: { ...SITE, promotion } },
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
});
