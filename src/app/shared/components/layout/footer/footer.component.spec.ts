import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { FakeClipboardService } from '@core/backends/fake/fake-clipboard.service';
import { IClipboardService } from '@core/interfaces/i-clipboard-service';
import { type ILayoutChrome } from '@shared/interfaces/i-layout-chrome';
import { SiteConfigModel } from '@shared/models/site-config.model';
import { HOME_CHROME, PAGE_CHROME, SITE, SITE_DTO, texts } from '@shared/testing/fixtures';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {
  function render(chrome: ILayoutChrome): HTMLElement {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: IClipboardService, useClass: FakeClipboardService },
      ],
    });
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.componentRef.setInput('site', SITE);
    fixture.componentRef.setInput('chrome', chrome);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should render the compact footer with pages and contact columns', () => {
    const element = render(PAGE_CHROME);

    expect(texts(element, '.heading')).toEqual(['Pages', 'Contact']);
    expect(element.querySelector('.fine')?.textContent).toContain(
      '© 2026 Taal Yatra · Taalyatra drum circle · taalyatra.in',
    );
    expect(element.querySelector('.fgrid')).toBeNull();
  });

  it('should render the full footer with visit details and back-to-top', () => {
    const element = render(HOME_CHROME);

    expect(texts(element, '.heading')).toEqual(['Experiences', 'Explore', 'Visit us']);
    expect(element.querySelector('.domain')?.textContent).toBe('taalyatra.in');
    expect(texts(element, '.fbot-links a')).toEqual(['Admin', 'Back to top ↑']);
  });

  it.each([
    ['compact', PAGE_CHROME],
    ['full', HOME_CHROME],
  ])('should credit the developer in the %s footer', (_variant, chrome) => {
    const credit = render(chrome).querySelector('app-footer-credit');

    expect(credit?.textContent).toContain('Developed with love by');
    expect(credit?.querySelector('a')?.getAttribute('href')).toBe(SITE.credit?.url);
  });

  it('should leave the credit out when none is stored', () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: IClipboardService, useClass: FakeClipboardService },
      ],
    });
    const fixture = TestBed.createComponent(FooterComponent);
    fixture.componentRef.setInput('site', new SiteConfigModel({ ...SITE_DTO, credit: null }));
    fixture.componentRef.setInput('chrome', PAGE_CHROME);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-footer-credit')).toBeNull();
    expect(element.querySelector('.fine')?.textContent).not.toContain('·  ');
  });
});
