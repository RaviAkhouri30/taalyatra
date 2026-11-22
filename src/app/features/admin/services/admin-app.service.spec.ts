import { DOCUMENT } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { Subject, of } from 'rxjs';
import { IInstallPrompt } from '@core/interfaces/i-install-prompt';
import { ADMIN_MANIFEST_HREF, ADMIN_TOUCH_ICON_HREF } from '../models/admin-app.constants';
import { AdminAppService } from './admin-app.service';

describe('AdminAppService (0026)', () => {
  const SITE_ICON = 'icons/apple-touch-icon.png';
  const VIEWPORT = 'width=device-width, initial-scale=1';

  function setUp() {
    const offers = new Subject<boolean>();
    const prompt = {
      offers: () => offers,
      install: vi.fn(() => of(true)),
      isInstalledApp: () => true,
    };
    TestBed.configureTestingModule({
      providers: [AdminAppService, { provide: IInstallPrompt, useValue: prompt }],
    });
    const document = TestBed.inject(DOCUMENT);
    const meta = TestBed.inject(Meta);
    meta.updateTag({ name: 'viewport', content: VIEWPORT });
    const icon = document.createElement('link');
    icon.rel = 'apple-touch-icon';
    icon.setAttribute('href', SITE_ICON);
    document.head.append(icon);
    return { service: TestBed.inject(AdminAppService), document, meta, offers, prompt, icon };
  }

  afterEach(() => {
    document.head.querySelectorAll('link[rel="apple-touch-icon"]').forEach((link) => {
      link.remove();
    });
  });

  it('should add the manifest and the iPhone tags only while the admin is open', () => {
    const { service, document, meta, icon } = setUp();

    const subscription = service.attach().subscribe();

    expect(document.head.querySelector('link[rel="manifest"]')?.getAttribute('href')).toBe(
      ADMIN_MANIFEST_HREF,
    );
    expect(icon.getAttribute('href')).toBe(ADMIN_TOUCH_ICON_HREF);
    expect(meta.getTag('name="apple-mobile-web-app-capable"')?.content).toBe('yes');
    expect(meta.getTag('name="apple-mobile-web-app-title"')?.content).toBe('TY Admin');
    expect(meta.getTag('name="viewport"')?.content).toBe(`${VIEWPORT}, viewport-fit=cover`);
    subscription.unsubscribe();

    expect(document.head.querySelector('link[rel="manifest"]')).toBeNull();
    expect(icon.getAttribute('href')).toBe(SITE_ICON);
    expect(meta.getTag('name="apple-mobile-web-app-capable"')).toBeNull();
    expect(meta.getTag('name="viewport"')?.content).toBe(VIEWPORT);
  });

  it('should say when the browser offers to install, and stop offering once used', () => {
    const { service, offers, prompt } = setUp();
    const subscription = service.attach().subscribe();

    offers.next(true);
    expect(service.canInstall()).toBe(true);
    service.install().subscribe();

    expect(prompt.install).toHaveBeenCalled();
    expect(service.canInstall()).toBe(false);
    expect(service.isInstalledApp()).toBe(true);
    subscription.unsubscribe();
  });

  it('should leave a viewport that already covers the screen, and a page with no Apple icon', () => {
    const { service, meta, icon } = setUp();
    meta.updateTag({ name: 'viewport', content: `${VIEWPORT}, viewport-fit=cover` });
    icon.remove();

    const subscription = service.attach().subscribe();

    expect(meta.getTag('name="viewport"')?.content).toBe(`${VIEWPORT}, viewport-fit=cover`);
    subscription.unsubscribe();
    expect(meta.getTag('name="viewport"')?.content).toBe(`${VIEWPORT}, viewport-fit=cover`);
  });
});
