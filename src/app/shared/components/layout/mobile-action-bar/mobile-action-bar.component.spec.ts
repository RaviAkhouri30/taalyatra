import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HOME_CHROME, SITE, queryAll } from '@shared/testing/fixtures';
import { MobileActionBarComponent } from './mobile-action-bar.component';

describe('MobileActionBarComponent', () => {
  it('should offer call, WhatsApp and the page call to action', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(MobileActionBarComponent);
    fixture.componentRef.setInput('contact', SITE.contact);
    fixture.componentRef.setInput('cta', HOME_CHROME.actionBarCta);
    fixture.detectChanges();
    const links = queryAll(fixture.nativeElement as HTMLElement, 'a');

    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'tel:+919284276168',
      'https://wa.me/919284276168',
      '/#contact',
    ]);
    expect(links[2]?.textContent.trim()).toBe('Get proposal');
  });
});
