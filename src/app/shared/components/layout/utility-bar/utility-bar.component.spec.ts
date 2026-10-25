import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SITE, queryAll } from '@shared/testing/fixtures';
import { UtilityBarComponent } from './utility-bar.component';

describe('UtilityBarComponent', () => {
  function render(): HTMLElement {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(UtilityBarComponent);
    fixture.componentRef.setInput('contact', SITE.contact);
    fixture.componentRef.setInput('socials', SITE.socials);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('should link the phone, email and location', () => {
    const hrefs = queryAll(render(), '.util-l a').map((link) => link.getAttribute('href'));

    expect(hrefs).toEqual([
      'tel:+919284276168',
      'mailto:contact@taalyatra.in',
      SITE.contact.mapsUrl,
    ]);
  });

  it('should render one labelled icon link per social profile, then the login', () => {
    const links = queryAll(render(), '.util-r a');

    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual([
      'WhatsApp',
      'Instagram',
      'YouTube',
      'Facebook',
      'Admin login',
    ]);
    expect(links.at(-1)?.getAttribute('href')).toBe('/admin');
  });
});
